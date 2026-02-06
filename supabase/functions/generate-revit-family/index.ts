import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateRequest {
  projectId: string;
  dimensions: {
    height: number;
    width: number;
    depth: number;
    seat_height?: number;
  };
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

    const { projectId, dimensions }: GenerateRequest = await req.json();

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError) throw projectError;

    const jobRecord = await supabase
      .from("processing_jobs")
      .insert({
        project_id: projectId,
        job_type: "revit_generation",
        status: "processing",
        api_provider: "custom",
      })
      .select()
      .single();

    if (jobRecord.error) throw jobRecord.error;

    const revitFamilyData = await generateRevitFamily(
      project.furniture_category,
      dimensions,
      project.mesh_url
    );

    const fileName = `${projectId}-${Date.now()}.rfa`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("revit-families")
      .upload(fileName, revitFamilyData, {
        contentType: "application/octet-stream",
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("revit-families")
      .getPublicUrl(fileName);

    await supabase
      .from("processing_jobs")
      .update({
        status: "completed",
        result: { revit_family_url: publicUrl },
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobRecord.data.id);

    await supabase
      .from("projects")
      .update({
        revit_family_url: publicUrl,
        status: "completed",
      })
      .eq("id", projectId);

    return new Response(
      JSON.stringify({
        success: true,
        revitFamilyUrl: publicUrl,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Revit generation error:", error);

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

async function generateRevitFamily(
  category: string,
  dimensions: any,
  meshUrl?: string
): Promise<Uint8Array> {
  const revitTemplate = `
    Revit Family File (Binary Format)
    Category: ${category}
    Dimensions: ${JSON.stringify(dimensions)}
    MeshURL: ${meshUrl || "N/A"}

    This is a placeholder Revit family file.
    In production, this would:
    1. Load the 3D mesh from ${meshUrl}
    2. Convert mesh to B-rep using Point2CAD
    3. Generate parametric operations using BRepNet
    4. Use Revit API (Design Automation) to create .rfa file
    5. Return actual Revit family binary data

    For now, this returns a text file demonstrating the workflow.
    To implement real Revit family generation:
    - Use Autodesk Design Automation for Revit API
    - Integrate Point2CAD for mesh-to-parametric conversion
    - Use BRepNet for feature classification
    - Generate proper .rfa binary format
  `;

  return new TextEncoder().encode(revitTemplate);
}
