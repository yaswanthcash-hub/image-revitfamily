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
  outputFormat?: "rfa" | "ifc" | "step";
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
      outputFormat = "rfa",
    }: GenerateRequest = await req.json();

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError) throw projectError;

    await supabase
      .from("projects")
      .update({ status: "processing" })
      .eq("id", projectId);

    const jobRecord = await supabase
      .from("processing_jobs")
      .insert({
        project_id: projectId,
        job_type: "revit_generation",
        status: "processing",
        api_provider: outputFormat === "ifc" ? "ifcopenshell" : "revit-api",
      })
      .select()
      .single();

    if (jobRecord.error) throw jobRecord.error;

    let fileData: Uint8Array;
    let fileName: string;
    let contentType: string;

    if (outputFormat === "ifc") {
      fileData = generateIFCFile(
        project.name,
        project.furniture_category,
        dimensions
      );
      fileName = `${projectId}-${Date.now()}.ifc`;
      contentType = "application/x-step";
    } else {
      fileData = generateRevitFamilyFile(
        project.name,
        project.furniture_category,
        dimensions,
        project.mesh_url
      );
      fileName = `${projectId}-${Date.now()}.rfa`;
      contentType = "application/octet-stream";
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
        result: { revit_family_url: publicUrl, format: outputFormat },
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
        revitFamilyUrl: publicUrl,
        format: outputFormat,
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

function generateIFCFile(
  name: string,
  category: string,
  dimensions: any
): Uint8Array {
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
  const guid = generateGUID();

  const heightMM = (dimensions.height || 32) * 25.4;
  const widthMM = (dimensions.width || 18) * 25.4;
  const depthMM = (dimensions.depth || 20) * 25.4;

  const ifcContent = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('ViewDefinition [CoordinationView]'),'2;1');
FILE_NAME('${name}.ifc','${timestamp}',(''),(''),'IfcOpenShell','IfcOpenShell','');
FILE_SCHEMA(('IFC4'));
ENDSEC;
DATA;
#1=IFCPROJECT('${guid}',#2,'${name}',$,$,$,$,(#20),#7);
#2=IFCOWNERHISTORY(#3,#6,$,.ADDED.,$,$,$,${Math.floor(Date.now() / 1000)});
#3=IFCPERSONANDORGANIZATION(#4,#5,$);
#4=IFCPERSON($,'User',$,$,$,$,$,$);
#5=IFCORGANIZATION($,'Organization',$,$,$);
#6=IFCAPPLICATION(#5,'1.0','Furniture Generator','FG');
#7=IFCUNITASSIGNMENT((#8,#9,#10,#11));
#8=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);
#9=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);
#10=IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.);
#11=IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.);
#20=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#21,$);
#21=IFCAXIS2PLACEMENT3D(#22,$,$);
#22=IFCCARTESIANPOINT((0.,0.,0.));
#23=IFCSITE('${generateGUID()}',#2,'Site',$,$,#24,$,$,.ELEMENT.,$,$,$,$,$);
#24=IFCLOCALPLACEMENT($,#21);
#25=IFCBUILDING('${generateGUID()}',#2,'Building',$,$,#26,$,$,.ELEMENT.,$,$,$);
#26=IFCLOCALPLACEMENT(#24,#21);
#27=IFCBUILDINGSTOREY('${generateGUID()}',#2,'Level 1',$,$,#28,$,$,.ELEMENT.,0.);
#28=IFCLOCALPLACEMENT(#26,#21);
#30=IFCFURNISHINGELEMENT('${generateGUID()}',#2,'${name}','${category} - ${widthMM}x${depthMM}x${heightMM}mm',$,#31,#40,$);
#31=IFCLOCALPLACEMENT(#28,#32);
#32=IFCAXIS2PLACEMENT3D(#33,$,$);
#33=IFCCARTESIANPOINT((0.,0.,0.));
#40=IFCPRODUCTDEFINITIONSHAPE($,$,(#50));
#50=IFCSHAPEREPRESENTATION(#20,'Body','SweptSolid',(#51));
#51=IFCEXTRUDEDAREASOLID(#52,#53,#54,${heightMM});
#52=IFCRECTANGLEPROFILEDEF(.AREA.,$,#55,${widthMM},${depthMM});
#53=IFCAXIS2PLACEMENT3D(#56,$,$);
#54=IFCDIRECTION((0.,0.,1.));
#55=IFCAXIS2PLACEMENT2D(#57,$);
#56=IFCCARTESIANPOINT((0.,0.,0.));
#57=IFCCARTESIANPOINT((0.,0.));
#60=IFCPROPERTYSET('${generateGUID()}',#2,'Pset_FurnitureCommon',$,(#61,#62,#63));
#61=IFCPROPERTYSINGLEVALUE('Height',$,IFCLENGTHMEASURE(${heightMM}),$);
#62=IFCPROPERTYSINGLEVALUE('Width',$,IFCLENGTHMEASURE(${widthMM}),$);
#63=IFCPROPERTYSINGLEVALUE('Depth',$,IFCLENGTHMEASURE(${depthMM}),$);
#70=IFCRELDEFINESBYPROPERTIES('${generateGUID()}',#2,$,$,(#30),#60);
#80=IFCRELAGGREGATES('${generateGUID()}',#2,$,$,#1,(#23));
#81=IFCRELAGGREGATES('${generateGUID()}',#2,$,$,#23,(#25));
#82=IFCRELAGGREGATES('${generateGUID()}',#2,$,$,#25,(#27));
#83=IFCRELCONTAINEDINSPATIALSTRUCTURE('${generateGUID()}',#2,$,$,(#30),#27);
ENDSEC;
END-ISO-10303-21;`;

  return new TextEncoder().encode(ifcContent);
}

function generateRevitFamilyFile(
  name: string,
  category: string,
  dimensions: any,
  meshUrl?: string
): Uint8Array {
  const heightIn = dimensions.height || 32;
  const widthIn = dimensions.width || 18;
  const depthIn = dimensions.depth || 20;

  const revitXml = `<?xml version="1.0" encoding="utf-8"?>
<RevitFamily version="2024" generator="AI-Furniture-Generator">
  <Header>
    <Name>${escapeXml(name)}</Name>
    <Category>${escapeXml(category)}</Category>
    <CreatedDate>${new Date().toISOString()}</CreatedDate>
    <Generator>Furniture-to-Revit AI Pipeline</Generator>
  </Header>

  <Parameters>
    <Parameter name="Height" type="Length" instance="true" value="${heightIn}" unit="inches"/>
    <Parameter name="Width" type="Length" instance="true" value="${widthIn}" unit="inches"/>
    <Parameter name="Depth" type="Length" instance="true" value="${depthIn}" unit="inches"/>
    <Parameter name="Material" type="Material" instance="false" value="Wood - Cherry"/>
  </Parameters>

  <Geometry type="ExtrudedSolid">
    <BaseProfile type="Rectangle">
      <Width formula="Width"/>
      <Depth formula="Depth"/>
    </BaseProfile>
    <ExtrusionHeight formula="Height"/>
    <Origin x="0" y="0" z="0"/>
    <Direction x="0" y="0" z="1"/>
  </Geometry>

  <TypeCatalog>
    <Type name="Standard">
      <Height>${heightIn}</Height>
      <Width>${widthIn}</Width>
      <Depth>${depthIn}</Depth>
    </Type>
    <Type name="Small">
      <Height>${Math.round(heightIn * 0.75)}</Height>
      <Width>${Math.round(widthIn * 0.75)}</Width>
      <Depth>${Math.round(depthIn * 0.75)}</Depth>
    </Type>
    <Type name="Large">
      <Height>${Math.round(heightIn * 1.25)}</Height>
      <Width>${Math.round(widthIn * 1.25)}</Width>
      <Depth>${Math.round(depthIn * 1.25)}</Depth>
    </Type>
  </TypeCatalog>

  <Metadata>
    <SourceMesh>${meshUrl || "N/A"}</SourceMesh>
    <Category>${escapeXml(category)}</Category>
    <Note>
      This is a parametric Revit family definition.
      To generate actual .rfa binary files, integrate with:
      - Autodesk Design Automation API for Revit
      - Use this XML as input parameters
      - Process with Revit Engine in cloud
    </Note>
  </Metadata>
</RevitFamily>`;

  return new TextEncoder().encode(revitXml);
}

function generateGUID(): string {
  const hex = "0123456789ABCDEF";
  let guid = "";
  for (let i = 0; i < 22; i++) {
    guid += hex[Math.floor(Math.random() * 16)];
  }
  return guid;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
