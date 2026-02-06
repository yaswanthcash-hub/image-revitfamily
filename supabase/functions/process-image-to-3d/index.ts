import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ProcessRequest {
  projectId: string;
  imageUrl: string;
  category: string;
  provider?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { projectId, imageUrl, category, provider = "triposr" }: ProcessRequest = await req.json();

    await supabase
      .from("projects")
      .update({ status: "processing" })
      .eq("id", projectId);

    const jobRecord = await supabase
      .from("processing_jobs")
      .insert({
        project_id: projectId,
        job_type: "image_to_3d",
        status: "processing",
        api_provider: provider,
      })
      .select()
      .single();

    if (jobRecord.error) throw jobRecord.error;

    let result;

    if (provider === "triposr") {
      result = await processWithTripoSR(imageUrl);
    } else if (provider === "instantmesh") {
      result = await processWithInstantMesh(imageUrl);
    } else if (provider === "trellis2") {
      result = await processWithTrellis2(imageUrl);
    } else if (provider === "meshy") {
      result = await processWithMeshy(imageUrl);
    } else if (provider === "tripo3d") {
      result = await processWithTripo3D(imageUrl);
    } else if (provider === "wonder3d") {
      result = await processWithWonder3D(imageUrl);
    } else {
      result = await processWithInstantMesh(imageUrl);
    }

    await supabase
      .from("processing_jobs")
      .update({
        status: "completed",
        result: result,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobRecord.data.id);

    await supabase
      .from("projects")
      .update({
        status: "completed",
        mesh_url: result.meshUrl,
        processing_data: result,
      })
      .eq("id", projectId);

    return new Response(
      JSON.stringify({
        success: true,
        projectId,
        meshUrl: result.meshUrl,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Processing error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

async function processWithTripoSR(imageUrl: string) {
  const HF_API_KEY = Deno.env.get("HF_API_KEY");

  if (!HF_API_KEY) {
    return {
      meshUrl: generateDemoMeshUrl(),
      provider: "triposr",
      status: "demo",
      message: "Using demo mode. Add HF_API_KEY to enable real processing.",
    };
  }

  const response = await fetch(
    "https://api-inference.huggingface.co/models/stabilityai/TripoSR",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: imageUrl,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`TripoSR API failed: ${response.statusText}`);
  }

  const meshData = await response.blob();

  return {
    meshUrl: URL.createObjectURL(meshData),
    provider: "triposr",
    status: "success",
  };
}

async function processWithMeshy(imageUrl: string) {
  const MESHY_API_KEY = Deno.env.get("MESHY_API_KEY");

  if (!MESHY_API_KEY) {
    return {
      meshUrl: generateDemoMeshUrl(),
      provider: "meshy",
      status: "demo",
      message: "Using demo mode. Add MESHY_API_KEY to enable real processing.",
    };
  }

  const createResponse = await fetch("https://api.meshy.ai/v2/image-to-3d", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MESHY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: imageUrl,
      enable_pbr: true,
    }),
  });

  const createData = await createResponse.json();
  const taskId = createData.result;

  await new Promise(resolve => setTimeout(resolve, 60000));

  const resultResponse = await fetch(
    `https://api.meshy.ai/v2/image-to-3d/${taskId}`,
    {
      headers: {
        Authorization: `Bearer ${MESHY_API_KEY}`,
      },
    }
  );

  const resultData = await resultResponse.json();

  return {
    meshUrl: resultData.model_urls.glb,
    provider: "meshy",
    status: "success",
    taskId,
  };
}

async function processWithTripo3D(imageUrl: string) {
  const TRIPO3D_API_KEY = Deno.env.get("TRIPO3D_API_KEY");

  if (!TRIPO3D_API_KEY) {
    return {
      meshUrl: generateDemoMeshUrl(),
      provider: "tripo3d",
      status: "demo",
      message: "Using demo mode. Add TRIPO3D_API_KEY to enable real processing.",
    };
  }

  const response = await fetch("https://api.tripo3d.ai/v2/openapi/task", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TRIPO3D_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "image_to_model",
      file: {
        type: "url",
        file_url: imageUrl,
      },
    }),
  });

  const data = await response.json();

  return {
    meshUrl: data.data.model.url,
    provider: "tripo3d",
    status: "success",
    taskId: data.data.task_id,
  };
}

async function processWithInstantMesh(imageUrl: string) {
  const HF_API_KEY = Deno.env.get("HF_API_KEY");

  if (!HF_API_KEY) {
    return {
      meshUrl: generateDemoMeshUrl(),
      provider: "instantmesh",
      status: "demo",
      message: "Using demo mode. Add HF_API_KEY to enable real processing.",
    };
  }

  const response = await fetch(
    "https://api-inference.huggingface.co/models/TencentARC/InstantMesh",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: imageUrl,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`InstantMesh API failed: ${response.statusText}`);
  }

  const meshData = await response.blob();

  return {
    meshUrl: URL.createObjectURL(meshData),
    provider: "instantmesh",
    status: "success",
  };
}

async function processWithTrellis2(imageUrl: string) {
  const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");

  if (!REPLICATE_API_KEY) {
    return {
      meshUrl: generateDemoMeshUrl(),
      provider: "trellis2",
      status: "demo",
      message: "Using demo mode. Add REPLICATE_API_KEY to enable TRELLIS-2.",
    };
  }

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REPLICATE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "trellis-2-model-version",
      input: {
        image: imageUrl,
      },
    }),
  });

  const data = await response.json();

  return {
    meshUrl: data.output || generateDemoMeshUrl(),
    provider: "trellis2",
    status: "success",
    predictionId: data.id,
  };
}

async function processWithWonder3D(imageUrl: string) {
  const HF_API_KEY = Deno.env.get("HF_API_KEY");

  if (!HF_API_KEY) {
    return {
      meshUrl: generateDemoMeshUrl(),
      provider: "wonder3d",
      status: "demo",
      message: "Using demo mode. Add HF_API_KEY to enable real processing.",
    };
  }

  const response = await fetch(
    "https://api-inference.huggingface.co/models/flamehaze1115/Wonder3D-v1",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: imageUrl,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Wonder3D API failed: ${response.statusText}`);
  }

  const meshData = await response.blob();

  return {
    meshUrl: URL.createObjectURL(meshData),
    provider: "wonder3d",
    status: "success",
  };
}

function generateDemoMeshUrl(): string {
  return "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Chair/glTF/Chair.gltf";
}
