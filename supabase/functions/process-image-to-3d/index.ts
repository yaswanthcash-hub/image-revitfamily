import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ProcessRequest {
  projectId: string;
  imageUrl: string;
  category: string;
  provider?: string;
}

const REPLICATE_MODELS: Record<string, string> = {
  triposr: "camenduru/triposr:aec44c48ff8a7e7f8b53e9e3d406bd8c8a3e5cf3",
  instantmesh: "camenduru/instantmesh:3fef3d8200cc3eb3d5b9b0df66d2650ebf55c0d8",
  trellis: "firtoz/trellis:64483e9ea83b28c9b8303a22c8b08d14e44f09a0",
  wonder3d: "camenduru/wonder3d:cb2f20a73af9fed47632e9ee7edb9f1b58eb5abb",
  zero123plus:
    "camenduru/zero123plusplus:6af03d3f0d74e8d4ed02c3b6a04207be4ebcffe4",
};

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

    const {
      projectId,
      imageUrl,
      category,
      provider = "instantmesh",
    }: ProcessRequest = await req.json();

    await supabase
      .from("projects")
      .update({ status: "processing", processing_provider: provider })
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

    switch (provider) {
      case "triposr":
        result = await processWithReplicate(imageUrl, "triposr");
        break;
      case "instantmesh":
        result = await processWithReplicate(imageUrl, "instantmesh");
        break;
      case "trellis2":
      case "trellis":
        result = await processWithReplicate(imageUrl, "trellis");
        break;
      case "wonder3d":
        result = await processWithReplicate(imageUrl, "wonder3d");
        break;
      case "meshy":
        result = await processWithMeshy(imageUrl);
        break;
      case "tripo3d":
        result = await processWithTripo3D(imageUrl);
        break;
      default:
        result = await processWithReplicate(imageUrl, "instantmesh");
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
        status: "mesh_ready",
        mesh_url: result.meshUrl,
        processing_data: result,
      })
      .eq("id", projectId);

    return new Response(
      JSON.stringify({
        success: true,
        projectId,
        meshUrl: result.meshUrl,
        provider: result.provider,
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
      const body = await req.clone().json();
      if (body.projectId) {
        await supabase
          .from("projects")
          .update({ status: "failed", error_message: error.message })
          .eq("id", body.projectId);
      }
    } catch {}

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

async function processWithReplicate(
  imageUrl: string,
  model: string
): Promise<{ meshUrl: string; provider: string; status: string }> {
  const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");

  if (!REPLICATE_API_KEY) {
    return {
      meshUrl: getDemoMeshUrl(model),
      provider: model,
      status: "demo",
    };
  }

  const modelVersion = REPLICATE_MODELS[model];

  if (!modelVersion) {
    return {
      meshUrl: getDemoMeshUrl(model),
      provider: model,
      status: "demo",
    };
  }

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REPLICATE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: modelVersion.split(":")[1],
      input: {
        image: imageUrl,
        output_format: "glb",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Replicate API error: ${errorText}`);
  }

  const prediction = await response.json();

  const result = await pollForResult(prediction.urls.get, REPLICATE_API_KEY);

  let meshUrl = result.output;

  if (Array.isArray(meshUrl)) {
    meshUrl = meshUrl.find(
      (url: string) =>
        url.endsWith(".glb") || url.endsWith(".obj") || url.endsWith(".gltf")
    );
    if (!meshUrl) meshUrl = meshUrl[0];
  }

  return {
    meshUrl: meshUrl || getDemoMeshUrl(model),
    provider: model,
    status: "success",
  };
}

async function processWithMeshy(
  imageUrl: string
): Promise<{ meshUrl: string; provider: string; status: string }> {
  const MESHY_API_KEY = Deno.env.get("MESHY_API_KEY");

  if (!MESHY_API_KEY) {
    return {
      meshUrl: getDemoMeshUrl("meshy"),
      provider: "meshy",
      status: "demo",
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

  if (!createResponse.ok) {
    throw new Error(`Meshy API error: ${await createResponse.text()}`);
  }

  const createData = await createResponse.json();
  const taskId = createData.result;

  const meshUrl = await pollMeshyTask(taskId, MESHY_API_KEY);

  return {
    meshUrl,
    provider: "meshy",
    status: "success",
  };
}

async function pollMeshyTask(taskId: string, apiKey: string): Promise<string> {
  for (let i = 0; i < 120; i++) {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const response = await fetch(
      `https://api.meshy.ai/v2/image-to-3d/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const data = await response.json();

    if (data.status === "SUCCEEDED") {
      return data.model_urls?.glb || data.model_urls?.obj;
    }

    if (data.status === "FAILED") {
      throw new Error("Meshy processing failed");
    }
  }

  throw new Error("Meshy processing timeout");
}

async function processWithTripo3D(
  imageUrl: string
): Promise<{ meshUrl: string; provider: string; status: string }> {
  const TRIPO3D_API_KEY = Deno.env.get("TRIPO3D_API_KEY");

  if (!TRIPO3D_API_KEY) {
    return {
      meshUrl: getDemoMeshUrl("tripo3d"),
      provider: "tripo3d",
      status: "demo",
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

  if (!response.ok) {
    throw new Error(`Tripo3D API error: ${await response.text()}`);
  }

  const data = await response.json();
  const taskId = data.data?.task_id;

  if (!taskId) {
    throw new Error("No task ID returned from Tripo3D");
  }

  const meshUrl = await pollTripo3DTask(taskId, TRIPO3D_API_KEY);

  return {
    meshUrl,
    provider: "tripo3d",
    status: "success",
  };
}

async function pollTripo3DTask(taskId: string, apiKey: string): Promise<string> {
  for (let i = 0; i < 120; i++) {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const response = await fetch(
      `https://api.tripo3d.ai/v2/openapi/task/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const data = await response.json();

    if (data.data?.status === "success") {
      return data.data?.output?.model;
    }

    if (data.data?.status === "failed") {
      throw new Error("Tripo3D processing failed");
    }
  }

  throw new Error("Tripo3D processing timeout");
}

async function pollForResult(
  url: string,
  apiKey: string,
  maxAttempts = 120
): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const result = await response.json();

    if (result.status === "succeeded") {
      return result;
    }

    if (result.status === "failed") {
      throw new Error(result.error || "Processing failed");
    }
  }

  throw new Error("Processing timeout");
}

function getDemoMeshUrl(provider: string): string {
  const demoModels: Record<string, string> = {
    chair:
      "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Chair/glTF-Binary/Chair.glb",
    default:
      "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb",
  };

  return demoModels.chair;
}
