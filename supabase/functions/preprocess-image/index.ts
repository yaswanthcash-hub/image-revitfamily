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

    const { projectId, imageUrl }: PreprocessRequest = await req.json();

    await supabase
      .from("processing_jobs")
      .insert({
        project_id: projectId,
        job_type: "preprocess",
        status: "processing",
        api_provider: "replicate-sam",
      });

    const processedUrl = await removeBackground(imageUrl);

    await supabase
      .from("projects")
      .update({
        processed_image_url: processedUrl,
      })
      .eq("id", projectId);

    return new Response(
      JSON.stringify({
        success: true,
        processedImageUrl: processedUrl,
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

async function removeBackground(imageUrl: string): Promise<string> {
  const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");

  if (!REPLICATE_API_KEY) {
    return imageUrl;
  }

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REPLICATE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version:
        "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      input: {
        image: imageUrl,
      },
    }),
  });

  const prediction = await response.json();

  const result = await pollForResult(prediction.urls.get, REPLICATE_API_KEY);

  return result.output || imageUrl;
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
