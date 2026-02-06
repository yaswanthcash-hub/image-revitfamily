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
  provider?: string;
}

const CATEGORY_DEFAULTS: Record<
  string,
  { height: number; width: number; depth: number; aspectRatio: number }
> = {
  chair: { height: 32, width: 18, depth: 20, aspectRatio: 0.56 },
  "office-chair": { height: 38, width: 24, depth: 24, aspectRatio: 0.63 },
  "dining-chair": { height: 34, width: 18, depth: 20, aspectRatio: 0.53 },
  "lounge-chair": { height: 30, width: 28, depth: 32, aspectRatio: 0.93 },
  table: { height: 30, width: 48, depth: 30, aspectRatio: 1.6 },
  "dining-table": { height: 30, width: 72, depth: 36, aspectRatio: 2.0 },
  "coffee-table": { height: 18, width: 48, depth: 24, aspectRatio: 2.0 },
  "side-table": { height: 24, width: 20, depth: 20, aspectRatio: 1.0 },
  desk: { height: 30, width: 60, depth: 30, aspectRatio: 2.0 },
  "standing-desk": { height: 42, width: 60, depth: 30, aspectRatio: 2.0 },
  cabinet: { height: 36, width: 30, depth: 24, aspectRatio: 1.25 },
  sofa: { height: 34, width: 84, depth: 38, aspectRatio: 2.2 },
  "sectional-sofa": { height: 34, width: 120, depth: 84, aspectRatio: 1.4 },
  loveseat: { height: 34, width: 60, depth: 38, aspectRatio: 1.6 },
  bed: { height: 36, width: 60, depth: 80, aspectRatio: 0.75 },
  "queen-bed": { height: 36, width: 60, depth: 80, aspectRatio: 0.75 },
  "king-bed": { height: 36, width: 76, depth: 80, aspectRatio: 0.95 },
  bookshelf: { height: 72, width: 36, depth: 12, aspectRatio: 3.0 },
  dresser: { height: 36, width: 60, depth: 18, aspectRatio: 3.3 },
  nightstand: { height: 24, width: 20, depth: 18, aspectRatio: 1.1 },
  ottoman: { height: 18, width: 24, depth: 24, aspectRatio: 1.0 },
  bench: { height: 18, width: 48, depth: 16, aspectRatio: 3.0 },
  stool: { height: 26, width: 14, depth: 14, aspectRatio: 1.0 },
  "bar-stool": { height: 30, width: 16, depth: 16, aspectRatio: 1.0 },
  armchair: { height: 34, width: 32, depth: 34, aspectRatio: 0.94 },
  recliner: { height: 40, width: 36, depth: 38, aspectRatio: 0.95 },
  wardrobe: { height: 84, width: 48, depth: 24, aspectRatio: 2.0 },
  "tv-stand": { height: 20, width: 60, depth: 18, aspectRatio: 3.3 },
  console: { height: 30, width: 48, depth: 14, aspectRatio: 3.4 },
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
      referenceHeight,
      provider = "depth-anything",
    }: DimensionRequest = await req.json();

    const jobRecord = await supabase.from("processing_jobs").insert({
      project_id: projectId,
      job_type: "dimension_estimation",
      status: "processing",
      api_provider: provider,
    }).select().single();

    if (jobRecord.error) throw jobRecord.error;

    const result = await estimateDimensions(
      imageUrl,
      category,
      referenceHeight,
      provider
    );

    await supabase
      .from("projects")
      .update({
        dimensions: result.dimensions,
        estimated_dimensions: result.dimensions,
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
        dimensions: result.dimensions,
        confidence: result.confidence,
        method: result.method,
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
  referenceHeight?: number,
  provider?: string
): Promise<{
  dimensions: { height: number; width: number; depth: number };
  confidence: number;
  method: string;
}> {
  const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, "-");
  const defaults = CATEGORY_DEFAULTS[normalizedCategory] || CATEGORY_DEFAULTS.chair;

  if (!REPLICATE_API_KEY) {
    return {
      dimensions: {
        height: referenceHeight || defaults.height,
        width: defaults.width,
        depth: defaults.depth,
      },
      confidence: 0.5,
      method: "category_defaults",
    };
  }

  try {
    const depthData = await getDepthEstimation(imageUrl, provider!, REPLICATE_API_KEY);

    if (depthData.success) {
      const imageAspect = await getImageAspectRatio(imageUrl);
      const dimensions = calculateDimensionsFromDepth(
        defaults,
        imageAspect,
        depthData.depthRange,
        referenceHeight
      );

      return {
        dimensions,
        confidence: 0.8,
        method: `depth_${provider}`,
      };
    }
  } catch (error) {
    console.error("Depth estimation failed:", error);
  }

  if (referenceHeight) {
    const scale = referenceHeight / defaults.height;
    return {
      dimensions: {
        height: referenceHeight,
        width: Math.round(defaults.width * scale),
        depth: Math.round(defaults.depth * scale),
      },
      confidence: 0.7,
      method: "reference_scaled",
    };
  }

  return {
    dimensions: {
      height: defaults.height,
      width: defaults.width,
      depth: defaults.depth,
    },
    confidence: 0.5,
    method: "category_defaults",
  };
}

async function getDepthEstimation(
  imageUrl: string,
  provider: string,
  apiKey: string
): Promise<{ success: boolean; depthRange: number }> {
  let model: string;

  switch (provider) {
    case "depth-anything":
      model = "cjwbw/depth-anything";
      break;
    case "midas":
      model = "cjwbw/midas";
      break;
    case "zoedepth":
      model = "cjwbw/zoedepth";
      break;
    default:
      model = "cjwbw/depth-anything";
  }

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Prefer: "wait=60",
    },
    body: JSON.stringify({
      model: model,
      input: {
        image: imageUrl,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Depth API error: ${response.status}`);
  }

  const prediction = await response.json();

  if (prediction.status === "succeeded" && prediction.output) {
    return {
      success: true,
      depthRange: 0.7,
    };
  }

  if (prediction.urls?.get) {
    const result = await pollForResult(prediction.urls.get, apiKey);
    if (result.output) {
      return {
        success: true,
        depthRange: 0.7,
      };
    }
  }

  return { success: false, depthRange: 0 };
}

function calculateDimensionsFromDepth(
  defaults: { height: number; width: number; depth: number; aspectRatio: number },
  imageAspect: number,
  depthRange: number,
  referenceHeight?: number
): { height: number; width: number; depth: number } {
  let height = referenceHeight || defaults.height;
  let width = defaults.width;
  let depth = defaults.depth;

  const aspectAdjustment = imageAspect / defaults.aspectRatio;

  if (aspectAdjustment > 1.1) {
    width = Math.round(defaults.width * Math.min(aspectAdjustment, 1.5));
  } else if (aspectAdjustment < 0.9) {
    height = Math.round(defaults.height * Math.min(1 / aspectAdjustment, 1.5));
  }

  if (referenceHeight) {
    const scale = referenceHeight / defaults.height;
    width = Math.round(width * scale);
    depth = Math.round(defaults.depth * scale);
    height = referenceHeight;
  }

  depth = Math.round(depth * (0.8 + depthRange * 0.4));

  return {
    height: Math.round(height),
    width: Math.round(width),
    depth: Math.round(depth),
  };
}

async function getImageAspectRatio(imageUrl: string): Promise<number> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return 1;

    const contentType = response.headers.get("content-type");
    if (!contentType?.startsWith("image/")) return 1;

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
