import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DimensionRequest {
  projectId: string;
  imageUrl: string;
  category: string;
  referenceHeight?: number;
}

const CATEGORY_DEFAULTS: Record<
  string,
  { height: number; width: number; depth: number }
> = {
  chair: { height: 32, width: 18, depth: 20 },
  table: { height: 30, width: 48, depth: 30 },
  desk: { height: 30, width: 60, depth: 30 },
  cabinet: { height: 36, width: 30, depth: 24 },
  sofa: { height: 34, width: 84, depth: 38 },
  bed: { height: 36, width: 60, depth: 80 },
  bookshelf: { height: 72, width: 36, depth: 12 },
  dresser: { height: 36, width: 60, depth: 18 },
  nightstand: { height: 24, width: 20, depth: 18 },
  ottoman: { height: 18, width: 24, depth: 24 },
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

    const { projectId, imageUrl, category, referenceHeight }: DimensionRequest =
      await req.json();

    await supabase.from("processing_jobs").insert({
      project_id: projectId,
      job_type: "dimension_estimation",
      status: "processing",
      api_provider: "replicate-depth",
    });

    let dimensions = await estimateDimensions(
      imageUrl,
      category,
      referenceHeight
    );

    await supabase
      .from("projects")
      .update({
        dimensions: dimensions,
        estimated_dimensions: dimensions,
      })
      .eq("id", projectId);

    await supabase
      .from("processing_jobs")
      .update({
        status: "completed",
        result: { dimensions },
        completed_at: new Date().toISOString(),
      })
      .eq("project_id", projectId)
      .eq("job_type", "dimension_estimation");

    return new Response(
      JSON.stringify({
        success: true,
        dimensions,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Dimension estimation error:", error);

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

async function estimateDimensions(
  imageUrl: string,
  category: string,
  referenceHeight?: number
): Promise<{ height: number; width: number; depth: number; confidence: number }> {
  const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");

  const defaults = CATEGORY_DEFAULTS[category] || CATEGORY_DEFAULTS.chair;

  if (!REPLICATE_API_KEY) {
    return {
      ...defaults,
      confidence: 0.5,
    };
  }

  try {
    const depthResponse = await fetch(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REPLICATE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version:
            "c5f18922eeb0a86b0ffcac34a97f17e48d2a8a95b0f233d89a5e28bc10e19b26",
          input: {
            image: imageUrl,
          },
        }),
      }
    );

    const depthPrediction = await depthResponse.json();

    if (depthPrediction.urls?.get) {
      const depthResult = await pollForResult(
        depthPrediction.urls.get,
        REPLICATE_API_KEY
      );

      if (depthResult.output) {
        const aspectRatio = await getImageAspectRatio(imageUrl);

        let estimatedHeight = defaults.height;
        let estimatedWidth = defaults.width;
        let estimatedDepth = defaults.depth;

        if (referenceHeight) {
          const scale = referenceHeight / defaults.height;
          estimatedHeight = referenceHeight;
          estimatedWidth = Math.round(defaults.width * scale);
          estimatedDepth = Math.round(defaults.depth * scale);
        } else {
          if (aspectRatio > 1) {
            estimatedWidth = Math.round(defaults.width * aspectRatio);
          } else {
            estimatedHeight = Math.round(defaults.height / aspectRatio);
          }
        }

        return {
          height: estimatedHeight,
          width: estimatedWidth,
          depth: estimatedDepth,
          confidence: 0.75,
        };
      }
    }
  } catch (error) {
    console.error("Depth estimation failed, using defaults:", error);
  }

  return {
    ...defaults,
    confidence: 0.5,
  };
}

async function getImageAspectRatio(imageUrl: string): Promise<number> {
  try {
    const response = await fetch(imageUrl, { method: "HEAD" });
    return 1;
  } catch {
    return 1;
  }
}

async function pollForResult(
  url: string,
  apiKey: string,
  maxAttempts = 30
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
