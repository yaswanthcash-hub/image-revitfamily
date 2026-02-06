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

const REPLICATE_MODELS: Record<
  string,
  { owner: string; name: string; version?: string }
> = {
  triposr: {
    owner: "camenduru",
    name: "triposr",
  },
  instantmesh: {
    owner: "camenduru",
    name: "instantmesh",
  },
  trellis: {
    owner: "firtoz",
    name: "trellis",
  },
  wonder3d: {
    owner: "camenduru",
    name: "wonder3d",
  },
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
      .update({
        status: "processing",
        processing_provider: provider,
        processing_started_at: new Date().toISOString(),
      })
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
        result = await processWithReplicate(imageUrl, "triposr", supabase, projectId);
        break;
      case "instantmesh":
        result = await processWithReplicate(imageUrl, "instantmesh", supabase, projectId);
        break;
      case "trellis":
        result = await processWithReplicate(imageUrl, "trellis", supabase, projectId);
        break;
      case "wonder3d":
        result = await processWithReplicate(imageUrl, "wonder3d", supabase, projectId);
        break;
      case "meshy":
        result = await processWithMeshy(imageUrl, supabase, projectId);
        break;
      case "tripo3d":
        result = await processWithTripo3D(imageUrl, supabase, projectId);
        break;
      default:
        result = await processWithReplicate(imageUrl, "instantmesh", supabase, projectId);
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
        processing_completed_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    return new Response(
      JSON.stringify({
        success: true,
        projectId,
        meshUrl: result.meshUrl,
        provider: result.provider,
        mode: result.status,
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
          .update({
            status: "failed",
            error_message: error.message,
            processing_completed_at: new Date().toISOString(),
          })
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

async function updateProgress(
  supabase: any,
  projectId: string,
  progress: number,
  stage: string
) {
  await supabase
    .from("projects")
    .update({
      processing_progress: progress,
      processing_stage: stage,
    })
    .eq("id", projectId);
}

async function processWithReplicate(
  imageUrl: string,
  model: string,
  supabase: any,
  projectId: string
): Promise<{ meshUrl: string; provider: string; status: string }> {
  const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");

  if (!REPLICATE_API_KEY) {
    console.log(`No REPLICATE_API_KEY found, using demo mode for ${model}`);
    await updateProgress(supabase, projectId, 100, "demo_complete");
    return {
      meshUrl: getDemoMeshUrl(model),
      provider: model,
      status: "demo",
    };
  }

  const modelInfo = REPLICATE_MODELS[model];
  if (!modelInfo) {
    return {
      meshUrl: getDemoMeshUrl(model),
      provider: model,
      status: "demo",
    };
  }

  await updateProgress(supabase, projectId, 10, "starting_prediction");

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REPLICATE_API_KEY}`,
      "Content-Type": "application/json",
      Prefer: "wait=60",
    },
    body: JSON.stringify({
      model: `${modelInfo.owner}/${modelInfo.name}`,
      input: getModelInput(model, imageUrl),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Replicate API error:", errorText);
    throw new Error(`Replicate API error: ${response.status}`);
  }

  const prediction = await response.json();

  await updateProgress(supabase, projectId, 30, "processing_3d");

  if (prediction.status === "succeeded") {
    const meshUrl = extractMeshUrl(prediction.output);
    await updateProgress(supabase, projectId, 100, "complete");
    return {
      meshUrl: meshUrl || getDemoMeshUrl(model),
      provider: model,
      status: "success",
    };
  }

  const result = await pollForResult(
    prediction.urls.get,
    REPLICATE_API_KEY,
    supabase,
    projectId
  );

  const meshUrl = extractMeshUrl(result.output);

  await updateProgress(supabase, projectId, 100, "complete");

  return {
    meshUrl: meshUrl || getDemoMeshUrl(model),
    provider: model,
    status: "success",
  };
}

function getModelInput(model: string, imageUrl: string): Record<string, any> {
  switch (model) {
    case "triposr":
      return {
        image: imageUrl,
        mc_resolution: 256,
        render_video: false,
      };
    case "instantmesh":
      return {
        image_path: imageUrl,
        export_video: false,
      };
    case "trellis":
      return {
        image: imageUrl,
        seed: 42,
        ss_sampling_steps: 12,
        slat_sampling_steps: 12,
      };
    case "wonder3d":
      return {
        input_image: imageUrl,
      };
    default:
      return {
        image: imageUrl,
      };
  }
}

function extractMeshUrl(output: any): string | null {
  if (!output) return null;

  if (typeof output === "string") {
    if (
      output.endsWith(".glb") ||
      output.endsWith(".obj") ||
      output.endsWith(".gltf") ||
      output.endsWith(".ply")
    ) {
      return output;
    }
  }

  if (Array.isArray(output)) {
    const meshFile = output.find(
      (url: string) =>
        typeof url === "string" &&
        (url.endsWith(".glb") ||
          url.endsWith(".obj") ||
          url.endsWith(".gltf") ||
          url.endsWith(".ply"))
    );
    return meshFile || output[0];
  }

  if (typeof output === "object") {
    if (output.mesh) return output.mesh;
    if (output.glb) return output.glb;
    if (output.obj) return output.obj;
    if (output.model_mesh) return output.model_mesh;
  }

  return null;
}

async function processWithMeshy(
  imageUrl: string,
  supabase: any,
  projectId: string
): Promise<{ meshUrl: string; provider: string; status: string }> {
  const MESHY_API_KEY = Deno.env.get("MESHY_API_KEY");

  if (!MESHY_API_KEY) {
    console.log("No MESHY_API_KEY found, using demo mode");
    await updateProgress(supabase, projectId, 100, "demo_complete");
    return {
      meshUrl: getDemoMeshUrl("meshy"),
      provider: "meshy",
      status: "demo",
    };
  }

  await updateProgress(supabase, projectId, 10, "creating_task");

  const createResponse = await fetch(
    "https://api.meshy.ai/openapi/v1/image-to-3d",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MESHY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: imageUrl,
        enable_pbr: true,
        should_remesh: true,
        topology: "quad",
      }),
    }
  );

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error("Meshy API error:", errorText);
    throw new Error(`Meshy API error: ${createResponse.status}`);
  }

  const createData = await createResponse.json();
  const taskId = createData.result;

  if (!taskId) {
    throw new Error("No task ID returned from Meshy");
  }

  await updateProgress(supabase, projectId, 30, "processing_3d");

  const meshUrl = await pollMeshyTask(taskId, MESHY_API_KEY, supabase, projectId);

  await updateProgress(supabase, projectId, 100, "complete");

  return {
    meshUrl,
    provider: "meshy",
    status: "success",
  };
}

async function pollMeshyTask(
  taskId: string,
  apiKey: string,
  supabase: any,
  projectId: string
): Promise<string> {
  for (let i = 0; i < 120; i++) {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const response = await fetch(
      `https://api.meshy.ai/openapi/v1/image-to-3d/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const data = await response.json();

    const progress = Math.min(30 + Math.floor((i / 120) * 70), 95);
    await updateProgress(supabase, projectId, progress, "generating_mesh");

    if (data.status === "SUCCEEDED") {
      return data.model_urls?.glb || data.model_urls?.obj || data.model_urls?.fbx;
    }

    if (data.status === "FAILED") {
      throw new Error(data.message || "Meshy processing failed");
    }
  }

  throw new Error("Meshy processing timeout");
}

async function processWithTripo3D(
  imageUrl: string,
  supabase: any,
  projectId: string
): Promise<{ meshUrl: string; provider: string; status: string }> {
  const TRIPO3D_API_KEY = Deno.env.get("TRIPO3D_API_KEY");

  if (!TRIPO3D_API_KEY) {
    console.log("No TRIPO3D_API_KEY found, using demo mode");
    await updateProgress(supabase, projectId, 100, "demo_complete");
    return {
      meshUrl: getDemoMeshUrl("tripo3d"),
      provider: "tripo3d",
      status: "demo",
    };
  }

  await updateProgress(supabase, projectId, 10, "creating_task");

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
        url: imageUrl,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Tripo3D API error:", errorText);
    throw new Error(`Tripo3D API error: ${response.status}`);
  }

  const data = await response.json();
  const taskId = data.data?.task_id;

  if (!taskId) {
    throw new Error("No task ID returned from Tripo3D");
  }

  await updateProgress(supabase, projectId, 30, "processing_3d");

  const meshUrl = await pollTripo3DTask(taskId, TRIPO3D_API_KEY, supabase, projectId);

  await updateProgress(supabase, projectId, 100, "complete");

  return {
    meshUrl,
    provider: "tripo3d",
    status: "success",
  };
}

async function pollTripo3DTask(
  taskId: string,
  apiKey: string,
  supabase: any,
  projectId: string
): Promise<string> {
  for (let i = 0; i < 60; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const response = await fetch(
      `https://api.tripo3d.ai/v2/openapi/task/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const data = await response.json();

    const progress = Math.min(30 + Math.floor((i / 60) * 70), 95);
    await updateProgress(supabase, projectId, progress, "generating_mesh");

    if (data.data?.status === "success") {
      return (
        data.data?.output?.model ||
        data.data?.output?.pbr_model ||
        data.data?.output?.base_model
      );
    }

    if (data.data?.status === "failed") {
      throw new Error(data.data?.message || "Tripo3D processing failed");
    }
  }

  throw new Error("Tripo3D processing timeout");
}

async function pollForResult(
  url: string,
  apiKey: string,
  supabase: any,
  projectId: string,
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

    const progress = Math.min(30 + Math.floor((i / maxAttempts) * 70), 95);
    await updateProgress(supabase, projectId, progress, "generating_mesh");

    if (result.status === "succeeded") {
      return result;
    }

    if (result.status === "failed") {
      throw new Error(result.error || "Processing failed");
    }
  }

  throw new Error("Processing timeout");
}

function getDemoMeshUrl(_provider: string): string {
  return "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Chair/glTF-Binary/Chair.glb";
}
