import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateRequest {
  projectId: string;
  dimensions: {
    height: number;
    width: number;
    depth: number;
    seat_height?: number;
  };
  outputFormat?: "ifc" | "step" | "json";
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

    const {
      projectId,
      dimensions,
      outputFormat = "ifc",
    }: GenerateRequest = await req.json();

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError) throw projectError;

    await supabase
      .from("projects")
      .update({ status: "generating_family" })
      .eq("id", projectId);

    const jobRecord = await supabase
      .from("processing_jobs")
      .insert({
        project_id: projectId,
        job_type: "revit_generation",
        status: "processing",
        api_provider: "ifcopenshell",
      })
      .select()
      .single();

    if (jobRecord.error) throw jobRecord.error;

    let fileData: Uint8Array;
    let fileName: string;
    let contentType: string;

    const ifcCategory = mapCategoryToIfc(project.furniture_category);

    if (outputFormat === "ifc") {
      fileData = generateIFC4File(
        project.name,
        project.furniture_category,
        ifcCategory,
        dimensions,
        project.mesh_url
      );
      fileName = `${projectId}-${Date.now()}.ifc`;
      contentType = "application/x-step";
    } else if (outputFormat === "json") {
      fileData = generateParameterFile(
        project.name,
        project.furniture_category,
        dimensions,
        project.mesh_url
      );
      fileName = `${projectId}-${Date.now()}.json`;
      contentType = "application/json";
    } else {
      fileData = generateIFC4File(
        project.name,
        project.furniture_category,
        ifcCategory,
        dimensions,
        project.mesh_url
      );
      fileName = `${projectId}-${Date.now()}.ifc`;
      contentType = "application/x-step";
    }

    const { error: uploadError } = await supabase.storage
      .from("revit-families")
      .upload(fileName, fileData, {
        contentType,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("revit-families").getPublicUrl(fileName);

    await supabase
      .from("processing_jobs")
      .update({
        status: "completed",
        result: {
          file_url: publicUrl,
          format: outputFormat,
          ifc_class: ifcCategory,
        },
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobRecord.data.id);

    await supabase
      .from("projects")
      .update({
        revit_family_url: publicUrl,
        status: "completed",
        dimensions: dimensions,
      })
      .eq("id", projectId);

    return new Response(
      JSON.stringify({
        success: true,
        fileUrl: publicUrl,
        format: outputFormat,
        ifcClass: ifcCategory,
        importInstructions: getImportInstructions(outputFormat),
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Generation error:", error);

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

function mapCategoryToIfc(category: string): string {
  const categoryMap: Record<string, string> = {
    chair: "IfcFurniture",
    table: "IfcFurniture",
    desk: "IfcFurniture",
    sofa: "IfcFurniture",
    bed: "IfcFurniture",
    cabinet: "IfcFurniture",
    bookshelf: "IfcFurniture",
    dresser: "IfcFurniture",
    lamp: "IfcLightFixture",
    lighting: "IfcLightFixture",
    appliance: "IfcElectricAppliance",
  };
  return categoryMap[category.toLowerCase()] || "IfcFurnishingElement";
}

function generateIFC4File(
  name: string,
  category: string,
  ifcClass: string,
  dimensions: any,
  meshUrl?: string
): Uint8Array {
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];

  const heightMM = Math.round((dimensions.height || 32) * 25.4);
  const widthMM = Math.round((dimensions.width || 18) * 25.4);
  const depthMM = Math.round((dimensions.depth || 20) * 25.4);

  const projectGuid = generateIFCGUID();
  const siteGuid = generateIFCGUID();
  const buildingGuid = generateIFCGUID();
  const storeyGuid = generateIFCGUID();
  const furnitureGuid = generateIFCGUID();
  const typeGuid = generateIFCGUID();
  const ownerGuid = generateIFCGUID();
  const psetGuid = generateIFCGUID();
  const relDefGuid = generateIFCGUID();
  const relTypeGuid = generateIFCGUID();

  const ifcContent = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('ViewDefinition [CoordinationView_V2.0]','ExchangeRequirement [Architecture]'),'2;1');
FILE_NAME('${escapeStep(name)}.ifc','${timestamp}',('AI Furniture Generator'),('Furniture to BIM'),'IfcOpenShell-0.7','AI-Furniture-Pipeline','');
FILE_SCHEMA(('IFC4'));
ENDSEC;
DATA;
/* ============================================ */
/* Project Structure */
/* ============================================ */
#1=IFCPROJECT('${projectGuid}',$,'${escapeStep(name)}',$,$,$,$,(#20,#23),#9);
#2=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);
#3=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);
#4=IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.);
#5=IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.);
#6=IFCSIUNIT(*,.MASSUNIT.,.KILO.,.GRAM.);
#7=IFCSIUNIT(*,.TIMEUNIT.,$,.SECOND.);
#8=IFCMONETARYUNIT('USD');
#9=IFCUNITASSIGNMENT((#2,#3,#4,#5,#6,#7,#8));

/* ============================================ */
/* Geometric Contexts */
/* ============================================ */
#20=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#21,$);
#21=IFCAXIS2PLACEMENT3D(#22,$,$);
#22=IFCCARTESIANPOINT((0.,0.,0.));
#23=IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*,#20,$,.MODEL_VIEW.,$);
#24=IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Box','Model',*,*,*,*,#20,$,.MODEL_VIEW.,$);

/* ============================================ */
/* Spatial Structure */
/* ============================================ */
#30=IFCSITE('${siteGuid}',$,'Default Site',$,$,#31,$,$,.ELEMENT.,$,$,$,$,$);
#31=IFCLOCALPLACEMENT($,#21);
#32=IFCBUILDING('${buildingGuid}',$,'Default Building',$,$,#33,$,$,.ELEMENT.,$,$,$);
#33=IFCLOCALPLACEMENT(#31,#21);
#34=IFCBUILDINGSTOREY('${storeyGuid}',$,'Level 1',$,$,#35,$,$,.ELEMENT.,0.);
#35=IFCLOCALPLACEMENT(#33,#21);

/* Spatial aggregations */
#40=IFCRELAGGREGATES('${generateIFCGUID()}',$,$,$,#1,(#30));
#41=IFCRELAGGREGATES('${generateIFCGUID()}',$,$,$,#30,(#32));
#42=IFCRELAGGREGATES('${generateIFCGUID()}',$,$,$,#32,(#34));

/* ============================================ */
/* Furniture Type Definition */
/* ============================================ */
#50=IFCFURNITURETYPE('${typeGuid}',$,'${escapeStep(name)} Type','${escapeStep(category)} - ${widthMM}x${depthMM}x${heightMM}mm',$,$,$,$,$,.CHAIR.);

/* ============================================ */
/* Furniture Instance */
/* ============================================ */
#60=IFCFURNITURE('${furnitureGuid}',$,'${escapeStep(name)}','${escapeStep(category)} furniture generated from image',$,#61,#70,'${escapeStep(name)}',.ELEMENT.);
#61=IFCLOCALPLACEMENT(#35,#62);
#62=IFCAXIS2PLACEMENT3D(#63,$,$);
#63=IFCCARTESIANPOINT((0.,0.,0.));

/* ============================================ */
/* Geometry - Bounding Box */
/* ============================================ */
#70=IFCPRODUCTDEFINITIONSHAPE($,$,(#71,#80));
#71=IFCSHAPEREPRESENTATION(#24,'Box','BoundingBox',(#72));
#72=IFCBOUNDINGBOX(#73,${widthMM}.,${depthMM}.,${heightMM}.);
#73=IFCCARTESIANPOINT((0.,0.,0.));

/* ============================================ */
/* Geometry - Extruded Solid Body */
/* ============================================ */
#80=IFCSHAPEREPRESENTATION(#23,'Body','SweptSolid',(#81));
#81=IFCEXTRUDEDAREASOLID(#82,#85,#86,${heightMM}.);
#82=IFCRECTANGLEPROFILEDEF(.AREA.,$,#83,${widthMM}.,${depthMM}.);
#83=IFCAXIS2PLACEMENT2D(#84,$);
#84=IFCCARTESIANPOINT((${widthMM / 2}.,${depthMM / 2}.));
#85=IFCAXIS2PLACEMENT3D(#22,$,$);
#86=IFCDIRECTION((0.,0.,1.));

/* ============================================ */
/* Property Sets */
/* ============================================ */
#90=IFCPROPERTYSET('${psetGuid}',$,'Pset_FurnitureTypeCommon',$,(#91,#92,#93,#94,#95));
#91=IFCPROPERTYSINGLEVALUE('NominalHeight',$,IFCLENGTHMEASURE(${heightMM}.),$);
#92=IFCPROPERTYSINGLEVALUE('NominalWidth',$,IFCLENGTHMEASURE(${widthMM}.),$);
#93=IFCPROPERTYSINGLEVALUE('NominalDepth',$,IFCLENGTHMEASURE(${depthMM}.),$);
#94=IFCPROPERTYSINGLEVALUE('IsMovable',$,IFCBOOLEAN(.T.),$);
#95=IFCPROPERTYSINGLEVALUE('Reference',$,IFCIDENTIFIER('${escapeStep(name)}'),$);

/* Custom properties */
#96=IFCPROPERTYSET('${generateIFCGUID()}',$,'AI_Generation_Info',$,(#97,#98,#99));
#97=IFCPROPERTYSINGLEVALUE('GeneratedFrom',$,IFCLABEL('AI Image-to-3D Pipeline'),$);
#98=IFCPROPERTYSINGLEVALUE('SourceMeshURL',$,IFCLABEL('${meshUrl || "N/A"}'),$);
#99=IFCPROPERTYSINGLEVALUE('FurnitureCategory',$,IFCLABEL('${escapeStep(category)}'),$);

/* Property relationships */
#100=IFCRELDEFINESBYPROPERTIES('${relDefGuid}',$,$,$,(#60),#90);
#101=IFCRELDEFINESBYPROPERTIES('${generateIFCGUID()}',$,$,$,(#60),#96);
#102=IFCRELDEFINESBYTYPE('${relTypeGuid}',$,$,$,(#60),#50);

/* Spatial containment */
#110=IFCRELCONTAINEDINSPATIALSTRUCTURE('${generateIFCGUID()}',$,$,$,(#60),#34);

ENDSEC;
END-ISO-10303-21;`;

  return new TextEncoder().encode(ifcContent);
}

function generateParameterFile(
  name: string,
  category: string,
  dimensions: any,
  meshUrl?: string
): Uint8Array {
  const data = {
    familyInfo: {
      name: name,
      category: category,
      template: getFamilyTemplate(category),
      version: "1.0",
      generatedAt: new Date().toISOString(),
    },
    parameters: {
      instance: [
        {
          name: "Height",
          type: "Length",
          value: dimensions.height || 32,
          unit: "inches",
          formula: null,
        },
        {
          name: "Width",
          type: "Length",
          value: dimensions.width || 18,
          unit: "inches",
          formula: null,
        },
        {
          name: "Depth",
          type: "Length",
          value: dimensions.depth || 20,
          unit: "inches",
          formula: null,
        },
      ],
      type: [
        {
          name: "Material",
          type: "Material",
          value: "Wood - Cherry",
        },
        {
          name: "Manufacturer",
          type: "Text",
          value: "",
        },
        {
          name: "Model",
          type: "Text",
          value: name,
        },
      ],
    },
    geometry: {
      boundingBox: {
        width: dimensions.width || 18,
        depth: dimensions.depth || 20,
        height: dimensions.height || 32,
        unit: "inches",
      },
      sourceMesh: meshUrl || null,
      meshFormat: meshUrl ? "GLB" : null,
    },
    typeCatalog: [
      {
        name: "Standard",
        height: dimensions.height || 32,
        width: dimensions.width || 18,
        depth: dimensions.depth || 20,
      },
      {
        name: "Small",
        height: Math.round((dimensions.height || 32) * 0.8),
        width: Math.round((dimensions.width || 18) * 0.8),
        depth: Math.round((dimensions.depth || 20) * 0.8),
      },
      {
        name: "Large",
        height: Math.round((dimensions.height || 32) * 1.2),
        width: Math.round((dimensions.width || 18) * 1.2),
        depth: Math.round((dimensions.depth || 20) * 1.2),
      },
    ],
    revitImport: {
      instructions: [
        "1. Open Revit and create a new project or open an existing one",
        "2. Go to Insert tab > Link IFC or Import CAD",
        "3. Select the downloaded IFC file",
        "4. The furniture will appear as a linked element",
        "5. To convert to a native family, select the element and use 'Edit In-Place'",
        "6. Copy geometry to a new Family file for full parametric control",
      ],
      recommendedWorkflow: "Link IFC for coordination, or use Geometry Gym for native family conversion",
    },
  };

  return new TextEncoder().encode(JSON.stringify(data, null, 2));
}

function getFamilyTemplate(category: string): string {
  const templates: Record<string, string> = {
    chair: "Furniture.rft",
    table: "Furniture.rft",
    desk: "Furniture.rft",
    sofa: "Furniture.rft",
    bed: "Furniture.rft",
    cabinet: "Furniture.rft",
    bookshelf: "Furniture.rft",
    lamp: "Lighting Fixture.rft",
    lighting: "Lighting Fixture.rft",
  };
  return templates[category.toLowerCase()] || "Generic Model.rft";
}

function getImportInstructions(format: string): string[] {
  if (format === "ifc") {
    return [
      "Open Revit 2020 or later",
      "Go to Insert tab > Link IFC (recommended) or Open IFC",
      "Select the downloaded .ifc file",
      "The furniture will be imported as an IFC element",
      "For native Revit family: Right-click > Create Family from IFC (Revit 2024+)",
      "Alternative: Use Geometry Gym IFC importer for parametric families",
    ];
  }
  return [
    "Download the parameter file",
    "Use with Revit Family Editor to create parametric family",
    "Import the source mesh (GLB) using Import CAD",
  ];
}

function generateIFCGUID(): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$";
  let guid = "";
  for (let i = 0; i < 22; i++) {
    guid += chars[Math.floor(Math.random() * 64)];
  }
  return guid;
}

function escapeStep(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "''")
    .replace(/\n/g, "\\n");
}
