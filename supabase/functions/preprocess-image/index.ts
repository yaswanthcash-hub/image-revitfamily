import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PreprocessRequest {
  projectId: string;
  imageUrl: string;
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

    const { projectId, imageUrl, provider = "bria" }: PreprocessRequest =
      await req.json();

    const jobRecord = await supabase.from("processing_jobs").insert({
      project_id: projectId,
      job_type: "preprocess",
      status: "processing",
      api_provider: provider,
    }).select().single();

    if (jobRecord.error) throw jobRecord.error;

    const result = await removeBackground(imageUrl, provider);

    await supabase
      .from("projects")
      .update({
        processed_image_url: result.processedUrl,
      })
      .eq("id", projectId);

    await supabase
      .from("processing_jobs")
      .update({
        status: "completed",
        result: result,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobRecord.data.id);

    return new Response(
      JSON.stringify({
        success: true,
        processedImageUrl: result.processedUrl,
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
    console.error("Preprocessing error:", error);

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

async function removeBackground(
  imageUrl: string,
  provider: string
): Promise<{ processedUrl: string; provider: string; status: string }> {
  const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");

  if (!REPLICATE_API_KEY) {
    console.log("No REPLICATE_API_KEY found, returning original image");
    return {
      processedUrl: imageUrl,
      provider: "none",
      status: "demo",
    };
  }

  let modelConfig: { model: string; input: Record<string, any> };

  switch (provider) {
    case "bria":
      modelConfig = {
        model: "lucataco/remove-bg",
        input: { image: imageUrl },
      };
      break;
    case "rmbg":
      modelConfig = {
        model: "cjwbw/rembg",
        input: { image: imageUrl },
      };
      break;
    case "birefnet":
      modelConfig = {
        model: "smoretalk/birefnet-massive",
        input: { image: imageUrl },
      };
      break;
    default:
      modelConfig = {
        model: "lucataco/remove-bg",
        input: { image: imageUrl },
      };
  }

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
        Prefer: "wait=60",
      },
      body: JSON.stringify({
        model: modelConfig.model,
        input: modelConfig.input,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Replicate API error:", errorText);
      throw new Error(`Replicate API error: ${response.status}`);
    }

    const prediction = await response.json();

    if (prediction.status === "succeeded") {
      const outputUrl = extractOutputUrl(prediction.output);
      return {
        processedUrl: outputUrl || imageUrl,
        provider: provider,
        status: "success",
      };
    }

    if (prediction.urls?.get) {
      const result = await pollForResult(prediction.urls.get, REPLICATE_API_KEY);
      const outputUrl = extractOutputUrl(result.output);
      return {
        processedUrl: outputUrl || imageUrl,
        provider: provider,
        status: "success",
      };
    }

    return {
      processedUrl: imageUrl,
      provider: provider,
      status: "fallback",
    };
  } catch (error) {
    console.error("Background removal failed:", error);
    return {
      processedUrl: imageUrl,
      provider: "none",
      status: "error",
    };
  }
}

function extractOutputUrl(output: any): string | null {
  if (!output) return null;
  if (typeof output === "string") return output;
  if (Array.isArray(output) && output.length > 0) return output[0];
  if (typeof output === "object" && output.image) return output.image;
  return null;
}

async function pollForResult(
  url: string,
  apiKey: string,
  maxAttempts = 60
): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
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

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("Processing timeout");
}
