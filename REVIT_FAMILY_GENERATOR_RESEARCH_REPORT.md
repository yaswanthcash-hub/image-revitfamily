# World-Class Revit Family Generator: Comprehensive Research Report

---

## Table of Contents

1. [Revit Family Creation Best Practices](#1-revit-family-creation-best-practices)
2. [AI-Powered BIM/CAD Tools Landscape](#2-ai-powered-bimcad-tools-landscape)
3. [3D Reconstruction from Images](#3-3d-reconstruction-from-images)
4. [Revit Family Parameters - Complete Reference](#4-revit-family-parameters---complete-reference)
5. [Revit Family Validation Standards](#5-revit-family-validation-standards)
6. [Furniture Industry Standards](#6-furniture-industry-standards)
7. [Missing Features for a World-Class Generator](#7-missing-features-for-a-world-class-generator)

---

## 1. Revit Family Creation Best Practices

### 1.1 Family Hierarchy

Revit organizes all elements in a strict hierarchy:

```
Category (e.g., Furniture)
  -> Family (e.g., Office_Chair)
    -> Type (e.g., Standard, Executive, Ergonomic)
      -> Instance (a placed element in the project)
```

### 1.2 Three Types of Revit Families

| Family Type | Description | Examples | Can Create New? |
|---|---|---|---|
| **System Families** | Predefined in Revit; cannot be loaded/saved as .rfa | Walls, Floors, Roofs, Ceilings | No (only new Types) |
| **Loadable Families** | Created in Family Editor; saved as .rfa files | Furniture, Doors, Windows, Equipment | Yes |
| **In-Place Families** | One-off elements created directly in a project | Unique sculptural elements | Yes (but discouraged) |

### 1.3 Key Quality Metrics

| Metric | Target | Notes |
|---|---|---|
| **File Size** | < 500 KB (simple), < 1 MB (complex) | BIMsmith standard; Autodesk Seek target is < 500 KB |
| **Parametric Integrity** | Must flex without breaking | Test extreme parameter values |
| **Correct Category** | Must match element function | A chair MUST be in "Furniture," NOT "Generic Models" |
| **LOD Completeness** | Coarse + Medium + Fine representations | All three detail levels must display properly |
| **Material Parameters** | Use material parameters, not hard-coded | Allows project-level material changes |
| **Backwards Compatibility** | Target Revit 2020+ | Families are NOT backwards compatible |
| **Origin Point** | Correct insertion point | Must be at logical center/base |
| **Reference Planes** | Strong references for key snapping points | Label as Strong/Weak/Not a Reference |

### 1.4 Professional Standards Alignment

- **ISO 19650**: Information management using BIM
- **BIM Execution Plan (BEP)**: Naming, categorization, version control
- **NBS BIM Object Standard**: UK standard for object quality
- **FCSI Global Revit Standards**: Foodservice equipment families standard
- **NATSPEC**: Australian BIM object standard

### 1.5 The BIMsmith 20 Rules (Summary)

1. The family should work (flex without breaking)
2. Parameters should be helpful and editable
3. Backwards compatibility matters
4. Correct category assignment
5. Do not over-brand
6. No lazy imports (no .dwg/.sat/.skp dumps)
7. Keep it simple
8. Materials and rendering readiness
9. Proper Type vs. Instance parameter usage
10. Small file size (< 1 MB)
11. Purge unused elements
12. Appropriate level of detail
13. Consider masking regions for plan views
14. Shared parameters for scheduling
15. Proper origin/insertion point
16. Correct subcategories
17. Named reference planes
18. Proper constraint strategy
19. Documentation and metadata
20. Testing and validation

---

## 2. AI-Powered BIM/CAD Tools Landscape

### 2.1 Market Leaders Comparison

| Tool | Primary Focus | AI Approach | BIM Integration | Speed |
|---|---|---|---|---|
| **TestFit** | Site feasibility & massing | Generative design (rule-based) | Revit, SketchUp, DXF | 3,000 plans in < 10 sec |
| **Hypar** | Design automation platform | Code-first + parametric | Revit, Dynamo, Grasshopper | Real-time generation |
| **Finch 3D** | Unit layout optimization | Graph tech + algorithms | Grasshopper (Rhino) | Real-time iterations |
| **Swapp** | Construction documentation | Portfolio learning + AI | Revit (3D model input) | Full drawing sets auto-generated |
| **Autodesk Forma** | Early-stage design | Environmental analysis + AI | Revit (native) | Real-time |
| **ArchiLabs** | Revit AI assistant | NLP + automation | Revit plugin | Real-time |

### 2.2 What Makes Them Successful

1. **Speed**: TestFit generates 3,000 valid site plans in under 10 seconds
2. **Constraint-based generation**: All tools accept real-world constraints (zoning, setbacks, unit mix)
3. **BIM interoperability**: Direct export to Revit/IFC is table stakes
4. **Encoding firm standards**: Hypar and Swapp learn from company-specific design patterns
5. **Real-time feedback**: Immediate visual output with cost/area metrics
6. **Cloud-based collaboration**: Multi-user, browser-accessible

### 2.3 Gaps in the Market (Your Opportunity)

No existing tool focuses on **AI-powered Revit family generation from images or descriptions**. The closest tools are:
- **Autodesk Informed Design**: Generates Revit family instances from manufacturer templates (limited to pre-built content)
- **BIMobject / BIMsmith**: Content libraries, not generators
- **Swapp**: Documentation automation, not family creation

**Key differentiator**: An AI tool that takes an image or text description and produces a parametric, standards-compliant .rfa file fills a completely unserved gap.

---

## 3. 3D Reconstruction from Images

### 3.1 Technology Comparison

| Method | Input | Output | Speed | Accuracy | Editability |
|---|---|---|---|---|---|
| **NeRF** | Multi-view images (50-200) | Radiance field / mesh | Minutes-hours | High visual fidelity | Low (mesh only) |
| **3D Gaussian Splatting** | Multi-view images (20-100) | Gaussian splats / mesh | Seconds-minutes | High + better noise handling | Low (mesh only) |
| **Wonder3D** | Single image | Textured mesh (256x256) | 2-3 minutes | Good generalization | Low |
| **Wonder3D++** | Single image | High-fidelity textured mesh | ~3 minutes | State-of-the-art single-view | Low |
| **Point2CAD** | 3D point cloud | Structured CAD (B-rep) | < 5 minutes | Chamfer distance 0.018 | **High (editable CAD)** |
| **Point2Primitive** | 3D point cloud | Explicit parametric primitives | Minutes | Better than Point2CAD | **High (parametric)** |

### 3.2 Accuracy Benchmarks

**Point2CAD on ABC Dataset:**
- Surface Chamfer distance: 0.018 (vs. ComplexGen's 0.042)
- Edge F-score at threshold 0.06: 0.742 (vs. ComplexGen's 0.637)
- Achieves state-of-the-art on the ABC benchmark

**3D Gaussian Splatting:**
- Rendering: Up to 361 FPS real-time
- Consistently outperforms NeRF in computational efficiency and noise reduction
- Sparse-view reconstruction still challenging but rapidly improving

**Wonder3D++:**
- Leading geometric detail quality among zero-shot single-view methods
- Validated on Google Scanned Object dataset
- Coarse-to-fine mesh extraction mitigates multi-view inconsistency

### 3.3 Recommended Pipeline for Revit Family Generation

```
Image Input
  -> Wonder3D++ (single image to textured mesh, ~3 min)
  -> Point Cloud Extraction (mesh sampling)
  -> Point2CAD / Point2Primitive (structured CAD output)
  -> Parametric Fitting (map to Revit primitives: extrusions, revolves, sweeps)
  -> Revit Family Assembly (API-driven .rfa generation)
```

**Key challenge**: The gap between mesh output and parametric Revit geometry. This requires a "parametric fitting" step that maps reconstructed geometry to Revit-native primitives (extrusions, blends, revolves, sweeps, voids).

---

## 4. Revit Family Parameters - Complete Reference

### 4.1 Parameter Scope Types

| Parameter Scope | Where Created | Schedulable | Taggable | Scope |
|---|---|---|---|---|
| **Built-in** | Revit (hard-coded) | Yes | Some | Cannot be removed/renamed |
| **Family** | Family Editor | No | No | Only within the family |
| **Shared** | External .txt file (GUID) | Yes | Yes | Across families and projects |
| **Project** | Revit Project | Yes | No | Only within the project |
| **Global** | Revit Project | No | No | Controls multiple elements |

### 4.2 Type vs. Instance Parameters

| Aspect | Type Parameter | Instance Parameter |
|---|---|---|
| **Change affects** | ALL instances of that type | Only the selected instance |
| **Use for** | Standardized properties (model number, material) | Variable properties (elevation, rotation) |
| **In Type Catalog** | Yes | No |
| **Example** | Width, Height, Material, Manufacturer | Offset from Level, Mirrored |

### 4.3 Complete Parameter Data Types

#### Common Discipline

| Data Type | Storage | Use Case | Example |
|---|---|---|---|
| **Text** | String | Descriptions, model numbers | "Herman Miller Aeron" |
| **Integer** | Int32 | Counts, quantities | 4 (legs) |
| **Number** | Double | Unitless numeric values | 0.85 (coefficient) |
| **Length** | Double | Dimensional values | 750 mm |
| **Area** | Double | Surface areas | 0.45 m^2 |
| **Volume** | Double | Volumetric values | 0.03 m^3 |
| **Angle** | Double | Angular measures | 15 degrees |
| **Slope** | Double | Gradient values | 1:12 |
| **Currency** | Double | Cost values | $450.00 |
| **Mass Density** | Double | Material density | 7850 kg/m^3 |
| **URL** | String | Web links | https://manufacturer.com |
| **Material** | ElementId | Material reference | "Oak - Natural" |
| **Image** | ElementId | Image reference | Product photo |
| **Yes/No** | Int32 (0/1) | Boolean toggles | Has_Armrests = Yes |
| **Multiline Text** | String | Long descriptions | Product specification |
| **Family Type** | ElementId | Nested family reference | Chair_Leg type |

#### Structural Discipline (additional)

| Data Type | Use Case |
|---|---|
| **Force** | Load values (kN) |
| **Linear Force** | Distributed loads (kN/m) |
| **Area Force** | Pressure loads (kN/m^2) |
| **Moment** | Bending moments (kN*m) |
| **Stress** | Material stress (MPa) |
| **Unit Weight** | Weight per unit (kN/m^3) |
| **Weight** | Total weight (kN) |
| **Mass** | Mass (kg) |
| **Mass per Unit Length** | Linear mass (kg/m) |
| **Reinforcement Area** | Rebar area (mm^2) |
| **Reinforcement Area per Unit Length** | Rebar density (mm^2/m) |
| **Section Dimension** | Section properties |

#### HVAC Discipline (additional)

| Data Type | Use Case |
|---|---|
| **Duct Size** | Duct dimensions |
| **Airflow** | CFM / L/s |
| **Air Velocity** | ft/min / m/s |
| **Cooling Load** | BTU/h / kW |
| **Heating Load** | BTU/h / kW |
| **Friction** | Pressure loss |
| **Duct Insulation Thickness** | Insulation size |
| **Roughness** | Duct roughness |
| **Pressure** | Static pressure |

#### Electrical Discipline (additional)

| Data Type | Use Case |
|---|---|
| **Wattage** | Power (W) |
| **Apparent Power** | VA rating |
| **Current** | Amperage (A) |
| **Electrical Potential** | Voltage (V) |
| **Electrical Frequency** | Hertz (Hz) |
| **Luminous Flux** | Lumens (lm) |
| **Luminous Intensity** | Candela (cd) |
| **Illuminance** | Lux (lx) |
| **Efficacy** | lm/W |
| **Power Density** | W/ft^2 or W/m^2 |
| **Color Temperature** | Kelvin (K) |
| **Wire Size** | Gauge / mm^2 |
| **Cable Tray Size** | Tray dimensions |
| **Demand Factor** | Load factor |

#### Piping Discipline (additional)

| Data Type | Use Case |
|---|---|
| **Pipe Size** | Pipe dimensions |
| **Flow** | GPM / L/s |
| **Piping Velocity** | ft/s / m/s |
| **Piping Friction** | Pressure loss |
| **Piping Mass per Time** | Mass flow rate |
| **Piping Temperature** | Temperature |
| **Piping Viscosity** | Fluid viscosity |
| **Piping Roughness** | Pipe roughness |
| **Piping Volume** | Pipe volume |
| **Pipe Insulation Thickness** | Insulation |

### 4.4 Parameter Groups (Where Parameters Appear in Properties)

| Group Enum (API) | UI Display Name | Typical Parameters |
|---|---|---|
| `PG_IDENTITY_DATA` | Identity Data | Family Name, Type Name, Manufacturer, Model, URL, Description, Assembly Code, OmniClass |
| `PG_GEOMETRY` | Dimensions | Width, Depth, Height, Length, Radius |
| `PG_CONSTRAINTS` | Constraints | Level, Offset, Host |
| `PG_MATERIALS` | Materials and Finishes | Material, Finish, Color |
| `PG_CONSTRUCTION` | Construction | Construction Type, Assembly |
| `PG_GRAPHICS` | Graphics | Visibility, Detail Level |
| `PG_AELECTRICAL` | Electrical | Voltage, Wattage, Apparent Load |
| `PG_ELECTRICAL_LIGHTING` | Electrical - Lighting | Luminous Flux, Efficacy, Color Temperature |
| `PG_ELECTRICAL_LOADS` | Electrical - Loads | Load Classification, Connected Load |
| `PG_ELECTRICAL_CIRCUITING` | Electrical - Circuiting | Circuit Number, Panel |
| `PG_MECHANICAL` | Mechanical | Airflow, CFM, Static Pressure |
| `PG_MECHANICAL_AIRFLOW` | Mechanical - Flow | Supply/Return Airflow |
| `PG_MECHANICAL_LOADS` | Mechanical - Loads | Cooling/Heating Load |
| `PG_PLUMBING` | Plumbing | Flow, Fixture Units |
| `PG_STRUCTURAL` | Structural | Moment, Shear, Axial Force |
| `PG_ANALYTICAL_MODEL` | Analytical Model | Analytical properties |
| `PG_FIRE_PROTECTION` | Fire Protection | Fire Rating, Smoke Rating |
| `PG_ENERGY_ANALYSIS` | Energy Analysis / Green Building | Thermal properties |
| `PG_IFC` | IFC Parameters | IFC Export As, IFC Classification |
| `PG_PHASING` | Phasing | Phase Created, Phase Demolished |
| `PG_GENERAL` | General | Comments, Mark |
| `PG_DATA` | Data | Custom data fields |
| `PG_TEXT` | Text | Text properties |
| `PG_VISIBILITY` | Visibility | Visibility settings |
| `PG_PATTERN` | Pattern | Fill pattern settings |

### 4.5 Naming Conventions

#### Family Naming Convention

```
[Owner]_[Category]_[SubType]_[Description]_[Version]

Examples:
  HM_Furniture_Chair_Aeron_001
  KI_Furniture_Desk_Height-Adjustable_002
  GEN_Lighting_Pendant_Linear_001
```

#### Parameter Naming Convention

```
[Prefix]_[Description]

Examples:
  SP_Width              (Shared Parameter)
  SP_Height
  SP_Seat_Height
  SP_Has_Armrests
  FP_Internal_Offset    (Family Parameter - internal use)
```

**Rules:**
- Use only A-Z, a-z, 0-9, hyphen (-), underscore (_)
- NO spaces (use underscores)
- First letter capitalized for each word
- Keep names concise but descriptive

### 4.6 Essential Built-in Parameters for Furniture Families

| Parameter | Group | Type/Instance | Data Type | Notes |
|---|---|---|---|---|
| `Width` | Dimensions | Type | Length | Overall width |
| `Depth` | Dimensions | Type | Length | Overall depth |
| `Height` | Dimensions | Type | Length | Overall height |
| `Seat Height` | Dimensions | Type | Length | Chair-specific |
| `Material` | Materials and Finishes | Type | Material | Primary material |
| `Finish` | Materials and Finishes | Type | Text | Surface finish description |
| `Manufacturer` | Identity Data | Type | Text | Maker name |
| `Model` | Identity Data | Type | Text | Product model |
| `Type Comments` | Identity Data | Type | Text | Type description |
| `URL` | Identity Data | Type | URL | Product page link |
| `Description` | Identity Data | Type | Text | Full description |
| `Assembly Code` | Identity Data | Type | Text | UniFormat code |
| `OmniClass Number` | Identity Data | Type | Text | OmniClass Table 23 code |
| `OmniClass Title` | Identity Data | Type | Text | OmniClass description |
| `Cost` | Identity Data | Type | Currency | Unit cost |
| `Keynote` | Identity Data | Type | Text | MasterFormat keynote |
| `Mark` | General | Instance | Text | Instance identifier |
| `Comments` | General | Instance | Text | Instance notes |
| `Level` | Constraints | Instance | ElementId | Host level |
| `Offset from Level` | Constraints | Instance | Length | Vertical offset |

---

## 5. Revit Family Validation Standards

### 5.1 Complete Validation Checklist

#### A. File & Metadata Checks

| Check | Rule | Score Criteria |
|---|---|---|
| **File Size** | Simple: < 500 KB; Complex: < 1 MB; Max: 2 MB | FAIL if > 2 MB |
| **File Name** | Matches naming convention pattern | FAIL if spaces or special characters |
| **Revit Version** | Report version; target 2020+ compatibility | WARN if > 2 years old |
| **Category** | Must match correct Revit category | FAIL if Generic Models for known types |
| **OmniClass Number** | Must be populated with correct code | WARN if empty |
| **Manufacturer** | Should be populated for manufacturer content | INFO if empty |
| **Description** | Should be non-empty | WARN if empty |

#### B. Parametric Integrity Checks

| Check | Rule | Score Criteria |
|---|---|---|
| **Parameter Flex Test** | Set Width/Height/Depth to min, default, max values | FAIL if geometry breaks |
| **Min Value Test** | Width/Depth/Height > 0 | FAIL if allows zero/negative |
| **Max Value Test** | Dimensions within 10x default | WARN if allows unreasonable values |
| **Circular References** | No formula circular dependencies | FAIL if detected |
| **Constraint Conflicts** | No over-constrained geometry | FAIL if moving one param breaks another |
| **Formula Validity** | All formulas evaluate correctly | FAIL if formula error |

#### C. Geometry Quality Checks

| Check | Rule | Score Criteria |
|---|---|---|
| **3D Geometry Present** | Must have 3D geometry in Front/Back/Left/Right views | FAIL if missing |
| **Coarse Detail Level** | Simplified geometry visible | FAIL if identical to Fine |
| **Medium Detail Level** | Intermediate geometry visible | WARN if missing |
| **Fine Detail Level** | Full-detail geometry visible | FAIL if missing |
| **Plan View Symbol** | 2D symbolic lines for plan views | WARN if only 3D shown |
| **Geometry Constrained** | All geometry locked to reference planes | WARN if free-floating |
| **No Import Geometry** | No embedded .dwg/.sat/.skp files | FAIL if imports found |
| **Geometry Clean** | No overlapping/duplicate solids | WARN if detected |
| **Origin Point** | Insertion point at logical center/base | FAIL if at arbitrary location |

#### D. Parameter Standards Checks

| Check | Rule | Score Criteria |
|---|---|---|
| **Shared Parameter Use** | Key parameters use shared parameters with valid GUIDs | Score 5: >50% match; Score 1: 0% match |
| **Parameter Naming** | Follows naming convention (no spaces, proper case) | WARN per violation |
| **Unused Parameters** | No orphaned parameters | WARN if found |
| **Duplicate Parameters** | No duplicate-named parameters | FAIL if found |
| **Parameter Groups** | Parameters in correct property groups | WARN if misplaced |
| **Type vs Instance** | Correct assignment (fixed props = Type, variable = Instance) | WARN per misassignment |

#### E. Subcategory Checks

| Check | Rule | Score Criteria |
|---|---|---|
| **Subcategory Assignment** | All geometry assigned to appropriate subcategories | WARN if unassigned |
| **Empty Subcategories** | No subcategories without geometry | WARN if found |
| **Standard Names** | Subcategory names match project standards | WARN per violation |

#### F. Material Checks

| Check | Rule | Score Criteria |
|---|---|---|
| **Material Parameters** | Materials assigned via parameters (not hard-coded) | FAIL if hard-coded |
| **Render-Ready** | Materials have appearance assets | WARN if missing |
| **Material Named** | Material names follow conventions | WARN per violation |
| **No Missing Materials** | No <By Category> on visible geometry | WARN if found |

### 5.2 Automated Scoring Model (Based on Nexus Ally)

```
Total Score = (File_Score * 0.15) +
              (Parametric_Score * 0.25) +
              (Geometry_Score * 0.25) +
              (Parameter_Standards_Score * 0.15) +
              (Subcategory_Score * 0.10) +
              (Material_Score * 0.10)

Rating:
  5.0 = Excellent (production-ready)
  4.0 = Good (minor improvements needed)
  3.0 = Acceptable (several improvements needed)
  2.0 = Below Standard (significant rework)
  1.0 = Unacceptable (rebuild required)
```

---

## 6. Furniture Industry Standards

### 6.1 Chairs

#### Office/Ergonomic Chairs (BIFMA G1-2013, ISO 9241-5:2024)

| Dimension | Min (mm) | Standard (mm) | Max (mm) | Notes |
|---|---|---|---|---|
| **Seat Height** | 381 (15") | 432-483 (17-19") | 533 (21") | Adjustable range |
| **Seat Width** | 406 (16") | 457-483 (18-19") | 508 (20") | Between armrests |
| **Seat Depth** | 381 (15") | 406-432 (16-17") | 457 (18") | Front edge to back |
| **Backrest Height** | 457 (18") | 508-635 (20-25") | 762 (30") | From seat |
| **Overall Height** | 813 (32") | 965-1067 (38-42") | 1219 (48") | Floor to top |
| **Overall Width** | 508 (20") | 610-686 (24-27") | 762 (30") | Including armrests |
| **Overall Depth** | 508 (20") | 610-686 (24-27") | 762 (30") | Front to back |
| **Armrest Height** | 178 (7") | 203-254 (8-10") | 279 (11") | Above seat |
| **Weight Capacity** | - | 113 kg (250 lbs) | 181 kg (400 lbs) | Standard to heavy-duty |

#### Dining Chairs

| Dimension | Min (mm) | Standard (mm) | Max (mm) |
|---|---|---|---|
| **Seat Height** | 432 (17") | 457 (18") | 483 (19") |
| **Seat Width** | 406 (16") | 432-457 (17-18") | 508 (20") |
| **Seat Depth** | 381 (15") | 406-432 (16-17") | 457 (18") |
| **Overall Height** | 762 (30") | 838-965 (33-38") | 1067 (42") |
| **Overall Width** | 406 (16") | 457-508 (18-20") | 610 (24") |
| **Overall Depth** | 457 (18") | 508-559 (20-22") | 610 (24") |

#### Lounge Chairs

| Dimension | Min (mm) | Standard (mm) | Max (mm) |
|---|---|---|---|
| **Seat Height** | 356 (14") | 381-432 (15-17") | 457 (18") |
| **Overall Width** | 610 (24") | 762-914 (30-36") | 1016 (40") |
| **Overall Depth** | 762 (30") | 838-914 (33-36") | 1016 (40") |
| **Overall Height** | 686 (27") | 762-914 (30-36") | 1016 (40") |

### 6.2 Tables

#### Dining Tables

| Dimension | Value (mm) | Value (inches) | Notes |
|---|---|---|---|
| **Height** | 711-762 | 28-30 | Industry standard |
| **Width (rectangular)** | 914-1016 | 36-40 | Standard |
| **Length (4-seat)** | 1219 | 48 | Minimum for 4 |
| **Length (6-seat)** | 1524 | 60 | Minimum for 6 |
| **Length (8-seat)** | 1829-2134 | 72-84 | Standard for 8 |
| **Round (4-seat)** | 914 dia | 36 dia | Diameter |
| **Round (6-seat)** | 1219-1524 dia | 48-60 dia | Diameter |
| **Round (8-seat)** | 1524-1829 dia | 60-72 dia | Diameter |
| **Per-person width** | 610 | 24 | Minimum per place setting |

#### Conference Tables

| Seating | Length (mm) | Width (mm) | Notes |
|---|---|---|---|
| **4-6 people** | 1524-1829 | 914-1067 | Small conference |
| **8-10 people** | 2438-3048 | 1067-1219 | Medium conference |
| **12-14 people** | 3658-4267 | 1219-1372 | Large conference |
| **16-20 people** | 4877-6096 | 1372-1524 | Boardroom |

#### Coffee Tables

| Dimension | Min (mm) | Standard (mm) | Max (mm) |
|---|---|---|---|
| **Height** | 356 (14") | 406-457 (16-18") | 508 (20") |
| **Width** | 457 (18") | 610-762 (24-30") | 914 (36") |
| **Length** | 762 (30") | 1016-1219 (40-48") | 1524 (60") |

### 6.3 Desks

#### Standard Office Desks

| Dimension | Min (mm) | Standard (mm) | Max (mm) | Notes |
|---|---|---|---|---|
| **Height** | 711 (28") | 737-762 (29-30") | 762 (30") | Fixed desks |
| **Width** | 1016 (40") | 1219-1524 (48-60") | 1829 (72") | Depends on use |
| **Depth** | 610 (24") | 762 (30") | 914 (36") | Standard |
| **Sit-Stand Height (Low)** | 635 (25") | 635-711 (25-28") | 711 (28") | Seated position |
| **Sit-Stand Height (High)** | 1016 (40") | 1067-1219 (42-48") | 1270 (50") | Standing position |
| **ADA Maximum Height** | - | - | 864 (34") | Wheelchair accessible |
| **Keyboard Tray Height** | 635 (25") | 660 (26") | 711 (28") | Below desk surface |
| **Leg Clearance Width** | 508 (20") | 610 (24") | - | Minimum knee space |
| **Leg Clearance Depth** | 381 (15") | 432 (17") | - | Minimum knee depth |

### 6.4 Cabinets & Storage

#### Kitchen Cabinets

| Type | Height (mm) | Width (mm) | Depth (mm) | Notes |
|---|---|---|---|---|
| **Base Cabinet** | 864 (34") | 229-914 (9-36") | 610 (24") | Counter at 914mm (36") |
| **Wall Cabinet** | 305-1067 (12-42") | 229-914 (9-36") | 305 (12") | Standard 762mm (30") high |
| **Tall/Pantry Cabinet** | 1829-2438 (72-96") | 305-914 (12-36") | 610 (24") | Full height |
| **Drawer Base** | 864 (34") | 305-914 (12-36") | 610 (24") | 3-5 drawers |

#### Office Storage

| Type | Height (mm) | Width (mm) | Depth (mm) |
|---|---|---|---|
| **Filing Cabinet (2-drawer)** | 711 (28") | 381 (15") | 559 (22") |
| **Filing Cabinet (4-drawer)** | 1321 (52") | 381 (15") | 559 (22") |
| **Bookcase (2-shelf)** | 813 (32") | 762 (30") | 254-305 (10-12") |
| **Bookcase (4-shelf)** | 1372 (54") | 762-914 (30-36") | 254-305 (10-12") |
| **Credenza** | 508-762 (20-30") | 1270-3556 (50-140") | 457-559 (18-22") |
| **Lateral File** | 673-1346 (26.5-53") | 762-1067 (30-42") | 457 (18") |
| **Pedestal (Mobile)** | 559-711 (22-28") | 381 (15") | 508 (20") |

### 6.5 Lighting Fixtures

#### Pendant Lights

| Dimension | Value | Notes |
|---|---|---|
| **Diameter** | 127-1143 mm (5-45") | Varies widely |
| **Hanging Height (over table)** | 762-914 mm above surface (30-36") | Standard |
| **Hanging Height (open space)** | 2134 mm minimum from floor (7 ft) | Minimum clearance |
| **Spacing** | 762-914 mm apart (30-36") | Center to center |
| **Task Wattage** | 75-100 W incandescent / 10-15 W LED | Kitchen island |
| **Ambient Wattage** | 40-60 W incandescent / 6-10 W LED | Living/bedroom |
| **Task Lumens** | ~4,000 lm | Kitchen work areas |
| **Ambient Lumens** | 2,000-3,000 lm | Living rooms |

#### Chandeliers

| Sizing Rule | Formula |
|---|---|
| **Diameter** | Room length (ft) + Room width (ft) = diameter (inches) |
| **Height** | Ceiling height (ft) x 2.5 = chandelier height (inches) |
| **Over dining table** | 1/2 to 2/3 of table width |
| **Must be narrower than table by** | 305 mm (12") minimum |
| **Hanging height above table** | 711-914 mm (28-36") |
| **Floor clearance** | 2134 mm minimum (7 ft) |

#### Wall Sconces

| Dimension | Value | Notes |
|---|---|---|
| **Mounting Height** | 1397-1778 mm (55-70") | Eye level when standing |
| **Bedside Height** | Eye level when sitting in bed | Reading position |
| **Spacing** | 2438-3048 mm apart (8-10 ft) | Even illumination |
| **Projection from Wall** | 76-203 mm (3-8") | Typical range |

### 6.6 Sofas and Couches

| Dimension | Min (mm) | Standard (mm) | Max (mm) |
|---|---|---|---|
| **Seat Height** | 381 (15") | 432-483 (17-19") | 508 (20") |
| **Seat Depth** | 508 (20") | 559-610 (22-24") | 660 (26") |
| **Overall Height** | 686 (27") | 813-914 (32-36") | 1016 (40") |
| **Overall Depth** | 813 (32") | 889-965 (35-38") | 1067 (42") |
| **Loveseat Width** | 1219 (48") | 1372-1524 (54-60") | 1676 (66") |
| **3-seat Sofa Width** | 1829 (72") | 2032-2286 (80-90") | 2438 (96") |
| **Sectional Width** | 2438 (96") | 2743-3658 (108-144") | 4267 (168") |

### 6.7 Common Material Specifications

| Material Category | Common Options | Revit Material Parameter Values |
|---|---|---|
| **Wood** | Oak, Walnut, Maple, Cherry, Birch, Teak, Pine | "Wood - Oak", "Wood - Walnut", etc. |
| **Metal** | Steel, Aluminum, Chrome, Brass, Copper | "Metal - Chrome", "Metal - Brushed Steel" |
| **Upholstery** | Fabric, Leather, Vinyl, Mesh | "Fabric - Gray", "Leather - Black" |
| **Plastic** | Polypropylene, ABS, Acrylic, Nylon | "Plastic - White", "Plastic - Black" |
| **Stone** | Marble, Granite, Quartz, Concrete | "Stone - Marble White", "Stone - Granite" |
| **Glass** | Clear, Frosted, Tinted, Tempered | "Glass - Clear", "Glass - Frosted" |
| **Laminate** | HPL, Melamine, Veneer | "Laminate - White", "Laminate - Woodgrain" |

---

## 7. Missing Features for a World-Class Generator

### 7.1 Material/Finish Assignment

**What to implement:**

```python
# Material parameter structure
material_config = {
    "parameter_name": "Material_Primary",       # Shared parameter
    "parameter_type": "Material",                # Revit Material type
    "parameter_scope": "Type",                   # Type parameter
    "parameter_group": "PG_MATERIALS",           # Materials and Finishes group
    "default_value": "Wood - Oak",               # Default material
    "additional_materials": {
        "Material_Secondary": "Metal - Chrome",  # Secondary material (legs, hardware)
        "Material_Upholstery": "Fabric - Gray",  # For seating
        "Material_Glass": "Glass - Clear",       # For tables with glass tops
    }
}
```

**Implementation requirements:**
- Every piece of visible geometry MUST be assigned a material parameter (not hard-coded)
- Create separate material parameters for distinct material zones (e.g., seat vs. legs vs. armrests)
- Include appearance assets for rendering (diffuse color, roughness, bump maps)
- Name materials following convention: `[Category] - [Specific]` (e.g., "Wood - Oak Natural")
- Provide material parameter for each subcategory
- UV mapping should follow standard Revit projection (planar for flat surfaces, cylindrical for round)

### 7.2 Level of Detail (LOD) - Coarse/Medium/Fine

**What to implement:**

```
COARSE (1:200, 1:100 scale views):
  - Simple extruded rectangle/profile representing overall bounding box
  - 2D symbolic lines in plan view
  - Minimal geometry (4-8 faces maximum)
  - No curves, fillets, or small features
  - Example: A chair is a simple box in plan, a T-shape in elevation

MEDIUM (1:50 scale views):
  - Recognizable form with major features
  - Simplified curves (low polygon)
  - Major openings and recesses shown
  - No surface detail or hardware
  - Example: A chair shows seat, back, and legs as distinct forms

FINE (1:20, 1:10 scale views):
  - Full geometric detail
  - Curves, fillets, chamfers
  - Hardware, buttons, tufting details
  - Edge details and trim
  - Example: A chair shows full form with cushion details
```

**Implementation approach:**
```
Each geometry element in the family must have Visibility settings:
  - visibility_coarse: true/false
  - visibility_medium: true/false
  - visibility_fine: true/false

Strategy:
  1. Create FINE geometry as the full model
  2. Create MEDIUM geometry as simplified version (fewer faces, no small details)
  3. Create COARSE geometry as bounding-box approximation
  4. Assign visibility per detail level to each geometry element
  5. Use subcategories to group related LOD elements
```

### 7.3 2D Plan Symbols

**What to implement:**

```
For each furniture category, define standard 2D plan symbols:

CHAIR:
  - Rectangle with arc indicating back
  - Dimensions: Seat Width x Seat Depth
  - Symbol lines: 2 symbolic lines (seat outline + backrest arc)
  - Masking region to hide geometry behind

TABLE (Rectangular):
  - Rectangle outline
  - Dimensions: Width x Depth
  - Optional: chair positions as dashed circles

TABLE (Round):
  - Circle outline
  - Dimensions: Diameter
  - Optional: chair positions as dashed arcs

DESK:
  - Rectangle with keyboard tray indication
  - Monitor position dot
  - Chair space arc

CABINET:
  - Rectangle outline with door swing arcs
  - Handle dots

SOFA:
  - Rectangle with rounded back indication
  - Cushion division lines

LIGHTING (Ceiling):
  - Circle or rectangle with cross
  - Size proportional to fixture
```

**Implementation requirements:**
- Use Symbolic Lines (not Model Lines) for plan representation
- Use Masking Regions to hide 3D geometry in plan views
- Assign to annotation subcategory for proper visibility control
- Make plan symbol visibility tied to detail level (show at Coarse/Medium, hide at Fine)
- Symbol should represent actual footprint dimensions

### 7.4 Nested Families

**What to implement:**

```
Parent Family (e.g., Dining Set)
  |-- Nested Family: Table (shared = true for scheduling)
  |-- Nested Family: Chair_1 (shared = true)
  |-- Nested Family: Chair_2 (shared = true)
  |-- Nested Family: Chair_3 (shared = true)
  |-- Nested Family: Chair_4 (shared = true)

Connector Examples:
  Office Chair
  |-- Nested Family: Base (Family Type parameter for swappable bases)
  |-- Nested Family: Armrest_Left (visibility controlled by Yes/No parameter)
  |-- Nested Family: Armrest_Right (visibility controlled by Yes/No parameter)
  |-- Nested Family: Headrest (visibility controlled by Yes/No parameter)
```

**Key rules:**
- Mark nested families as "Shared" when they need to appear in schedules independently
- Use Family Type parameters to allow swapping nested components
- Control nested family visibility with Yes/No parameters
- Lock nested family instances to reference planes (X and Y)
- Keep nested families lightweight (separate .rfa files)
- Purge unused types from both parent and nested families

### 7.5 Shared Parameters

**What to implement:**

Shared parameter file format (tab-delimited .txt):

```
# This is a Revit shared parameter file.
# Do not edit manually.
*META	VERSION	MINVERSION
META	2	1
*GROUP	ID	NAME
GROUP	1	Dimensions
GROUP	2	Identity
GROUP	3	Materials
GROUP	4	Performance
GROUP	5	Classification
*PARAM	GUID	NAME	DATATYPE	DATACATEGORY	GROUP	DESCRIPTION	USERMODIFIABLE	HIDEWHENNOVALUE
PARAM	a1b2c3d4-e5f6-7890-abcd-ef1234567890	SP_Width	LENGTH		1	Overall width of the element	1	0
PARAM	b2c3d4e5-f6a7-8901-bcde-f12345678901	SP_Depth	LENGTH		1	Overall depth of the element	1	0
PARAM	c3d4e5f6-a7b8-9012-cdef-123456789012	SP_Height	LENGTH		1	Overall height of the element	1	0
PARAM	d4e5f6a7-b8c9-0123-defa-234567890123	SP_Seat_Height	LENGTH		1	Height from floor to seat surface	1	0
PARAM	e5f6a7b8-c9d0-1234-efab-345678901234	SP_Manufacturer	TEXT		2	Manufacturer name	1	0
PARAM	f6a7b8c9-d0e1-2345-fabc-456789012345	SP_Model	TEXT		2	Product model identifier	1	0
PARAM	a7b8c9d0-e1f2-3456-abcd-567890123456	SP_Description	TEXT		2	Product description	1	0
PARAM	b8c9d0e1-f2a3-4567-bcde-678901234567	SP_Material_Primary	ELEM		3	Primary material parameter	1	0
PARAM	c9d0e1f2-a3b4-5678-cdef-789012345678	SP_Finish	TEXT		3	Surface finish specification	1	0
PARAM	d0e1f2a3-b4c5-6789-defa-890123456789	SP_Weight	NUMBER		4	Product weight in kg	1	0
PARAM	e1f2a3b4-c5d6-7890-efab-901234567890	SP_Fire_Rating	TEXT		4	Fire resistance rating	1	0
PARAM	f2a3b4c5-d6e7-8901-fabc-012345678901	SP_OmniClass_Number	TEXT		5	OmniClass Table 23 code	1	0
PARAM	a3b4c5d6-e7f8-9012-abcd-123456789012	SP_Uniclass_Code	TEXT		5	Uniclass 2015 code	1	0
PARAM	b4c5d6e7-f8a9-0123-bcde-234567890123	SP_IFC_Classification	TEXT		5	IFC classification reference	1	0
```

**Essential shared parameters for furniture:**

| Parameter | Data Type | Group | Purpose |
|---|---|---|---|
| SP_Width | Length | Dimensions | Overall width |
| SP_Depth | Length | Dimensions | Overall depth |
| SP_Height | Length | Dimensions | Overall height |
| SP_Seat_Height | Length | Dimensions | Chair seat height |
| SP_Seat_Depth | Length | Dimensions | Chair seat depth |
| SP_Seat_Width | Length | Dimensions | Chair seat width |
| SP_Clearance_Height | Length | Dimensions | Under-table clearance |
| SP_Manufacturer | Text | Identity | Maker |
| SP_Model | Text | Identity | Model name/number |
| SP_Description | Text | Identity | Full description |
| SP_URL | URL | Identity | Product URL |
| SP_Cost | Currency | Identity | Unit cost |
| SP_Material_Primary | Material | Materials | Main material |
| SP_Material_Secondary | Material | Materials | Secondary material |
| SP_Material_Upholstery | Material | Materials | Fabric/leather |
| SP_Finish | Text | Materials | Finish description |
| SP_Weight | Number | Performance | Weight in kg |
| SP_Fire_Rating | Text | Performance | Fire rating class |
| SP_Sustainability_Cert | Text | Performance | LEED/WELL certification |
| SP_OmniClass_Number | Text | Classification | OmniClass code |
| SP_Uniclass_Code | Text | Classification | Uniclass code |
| SP_IFC_Classification | Text | Classification | IFC class reference |

### 7.6 Connector Support (MEP)

**What to implement for furniture/equipment:**

```
Connector Types:
  - ElectricalConnector: For powered furniture (sit-stand desks, task lighting)
    Properties: Voltage, Wattage, Number_of_Poles, Load_Classification
  - PipeConnector: For plumbing fixtures (sinks in cabinetry)
    Properties: Flow, System_Type, Pipe_Size
  - DuctConnector: Rarely needed for furniture

Placement Rules:
  - Position connectors at logical connection points
  - Set correct System Classification (e.g., Power for electrical)
  - Set flow direction (Out for supply equipment, In for consuming equipment)
  - Only one primary connector per discipline per family

Example - Sit-Stand Desk:
  ElectricalConnector:
    Location: (x=0, y=-Depth/2, z=0)  # Back center, floor level
    Voltage: 120V / 240V
    Wattage: 150W (motor)
    Load_Classification: Power
    System_Type: Power - Balanced
```

### 7.7 Formula-Driven Parametrics

**What to implement:**

```
Formula Syntax: IF(<condition>, <true_result>, <false_result>)
Operators: +, -, *, /, AND, OR, NOT, <, >, =, <=, >=

Essential formulas for furniture:

1. ARMREST VISIBILITY (Yes/No parameter):
   Has_Armrests_Visible = IF(Has_Armrests, 1, 0)

2. DIMENSION CLAMPING:
   Actual_Width = IF(Width < 300, 300, IF(Width > 2000, 2000, Width))

3. PROPORTIONAL SCALING:
   Leg_Height = Height - Seat_Thickness - Cushion_Thickness
   Backrest_Height = Height - Seat_Height

4. CONDITIONAL GEOMETRY (nested IF):
   Chair_Type_Label = IF(Width < 600, "Side Chair",
                     IF(Width < 900, "Armchair",
                     IF(Width < 1500, "Loveseat", "Sofa")))

5. ARRAY CONTROL:
   Num_Legs = IF(Width > 1500, 6, 4)
   Leg_Spacing = (Width - 2 * Edge_Offset) / (Num_Legs - 1)

6. MATERIAL SWITCHING:
   Is_Wood = IF(OR(Material_Type = "Oak", Material_Type = "Walnut"), 1, 0)

7. WEIGHT ESTIMATION:
   Est_Weight = (Width/1000) * (Depth/1000) * (Height/1000) * Material_Density * 0.3

8. LOD CONTROL:
   Show_Detail = IF(AND(Detail_Level = "Fine", Show_Hardware), 1, 0)
```

**Key rules for formula implementation:**
- Parameters in formulas must share the same unit type
- To mix Number and Length types, multiply by 1 unit (e.g., `Number * 1mm`)
- Yes/No parameters use 1/0 in formulas but display as Yes/No
- Avoid circular references (Parameter A depends on B which depends on A)
- Test formulas at extreme values
- Use conditional statements primarily with instance parameters

### 7.8 Multiple Type Catalog Support

**What to implement:**

Type catalog file format (same name as .rfa, .txt extension, comma-delimited):

```
,Width##LENGTH##MILLIMETERS,Depth##LENGTH##MILLIMETERS,Height##LENGTH##MILLIMETERS,Seat_Height##LENGTH##MILLIMETERS,Has_Armrests##OTHER##,Material_Primary##OTHER##,Cost##CURRENCY##
Side Chair - Small,450,480,800,450,0,Plastic - Black,150
Side Chair - Medium,480,500,850,460,0,Plastic - White,175
Side Chair - Large,520,520,900,470,0,Plastic - Gray,200
Armchair - Standard,600,550,850,450,1,Fabric - Gray,350
Armchair - Executive,650,600,1100,460,1,Leather - Black,750
Armchair - Lounge,750,700,800,380,1,Fabric - Blue,500
Stool - Counter,400,400,650,600,0,Wood - Oak,250
Stool - Bar,400,400,800,750,0,Metal - Chrome,300
```

**Header format rules:**
- First column (before first comma) is empty
- Parameter format: `ParameterName##DATATYPE##UNITS`
- Common data types: `LENGTH`, `NUMBER`, `INTEGER`, `OTHER` (for Text, Yes/No), `CURRENCY`
- Common units: `MILLIMETERS`, `CENTIMETERS`, `METERS`, `FEET`, `INCHES`
- Yes/No values: `1` = Yes, `0` = No

**Implementation for the generator:**
- Auto-generate type catalogs when a family has > 6 types
- Include standard size variants per furniture category
- Include material/finish variants
- File must be in same directory as .rfa with identical name
- Use CSV format saved as .txt

### 7.9 IFC Classification

**What to implement:**

```
Three classification systems must be supported:

1. OmniClass Table 23 (Products) - Furniture Codes:
   23-21 00 00  Furnishings (general)
   23-21 11 00  Office Furniture
   23-21 11 11  Desks
   23-21 11 13  Credenzas
   23-21 11 15  Tables
   23-21 11 17  Chairs
   23-21 11 19  File Cabinets
   23-21 13 00  Lounge Furniture
   23-21 15 00  Cafeteria Furniture
   23-21 23 00  Residential Furniture
   23-21 23 11  Residential Seating
   23-21 23 13  Residential Tables
   23-21 23 15  Residential Storage
   23-40 20 14  Residential Living Room Furniture
   23-40 20 17  Bedroom Furniture
   23-35 00 00  Lighting (general)
   23-35 11 00  Interior Luminaires
   23-35 13 00  Exterior Luminaires

2. Uniclass 2015:
   Pr_40_30       Furniture and fittings
   Pr_40_30_25    Desks and tables
   Pr_40_30_14    Chairs and seating
   Pr_40_30_78    Storage furniture
   Pr_40_30_55    Meeting room furniture

3. IFC Classification:
   IfcFurnishingElement (general)
   IfcFurniture (furniture items)
     - IfcFurnitureType.CHAIR
     - IfcFurnitureType.TABLE
     - IfcFurnitureType.DESK
     - IfcFurnitureType.BED
     - IfcFurnitureType.FILECABINET
     - IfcFurnitureType.SHELF
     - IfcFurnitureType.USERDEFINED
     - IfcFurnitureType.NOTDEFINED

Required IFC Parameters (as shared parameters):
  - IfcExportAs: Text parameter (e.g., "IfcFurniture")
  - IfcExportType: Text parameter (e.g., "CHAIR")
  - ClassificationCode: Text parameter (e.g., "23-21 11 17")

IFC Property Sets to populate:
  - Pset_FurnitureTypeCommon
    * Reference (text)
    * Status (text: NEW, EXISTING, DEMOLISH, TEMPORARY)
    * NominalLength (length)
    * NominalWidth (length)
    * NominalHeight (length)
  - Pset_ManufacturerTypeInformation
    * GlobalTradeItemNumber
    * ArticleNumber
    * ModelReference
    * ModelLabel
    * Manufacturer
    * ProductionYear
```

### 7.10 COBie Data

**What to implement:**

```
COBie worksheets relevant to furniture families:

TYPE WORKSHEET (populated at family level):
  Required fields:
  - Type.Name: Family type name (e.g., "Office_Chair_Standard")
  - Type.Category: "Furniture" or "Furniture Systems"
  - Type.Description: Full text description
  - Type.Manufacturer: Manufacturer name
  - Type.ModelNumber: Product model number
  - Type.WarrantyGuarantorParts: Warranty provider
  - Type.WarrantyDurationParts: Years (integer)
  - Type.WarrantyGuarantorLabor: Labor warranty provider
  - Type.WarrantyDurationLabor: Years (integer)
  - Type.ReplacementCost: Decimal (currency)
  - Type.ExpectedLife: Years (integer)
  - Type.NominalLength: mm
  - Type.NominalWidth: mm
  - Type.NominalHeight: mm
  - Type.Color: Color description
  - Type.Finish: Finish description
  - Type.Material: Material description
  - Type.Sustainability: Certification info
  - Type.AccessibilityPerformance: ADA compliance
  - Type.Shape: Shape description
  - Type.Size: Size description

COMPONENT WORKSHEET (populated per instance):
  Required fields:
  - Component.Name: Unique instance identifier
  - Component.TypeName: References Type.Name
  - Component.Space: Room/space name
  - Component.Description: Instance description
  - Component.SerialNumber: (if available)
  - Component.InstallationDate: Date
  - Component.WarrantyStartDate: Date
  - Component.BarCode: (if available)
  - Component.AssetIdentifier: (if available)

ATTRIBUTE WORKSHEET (custom properties):
  - Attribute.Name: Parameter name
  - Attribute.SheetName: "Type" or "Component"
  - Attribute.RowName: Type/Component name
  - Attribute.Value: Parameter value
  - Attribute.Unit: Unit of measure
  - Attribute.AllowedValues: Enumeration (if applicable)
```

**COBie Shared Parameters to add to families:**

| Parameter | Data Type | Scope | COBie Field |
|---|---|---|---|
| COBie_Type_Category | Text | Type | Type.Category |
| COBie_Type_Description | Text | Type | Type.Description |
| COBie_Warranty_Duration_Parts | Integer | Type | Type.WarrantyDurationParts |
| COBie_Warranty_Duration_Labor | Integer | Type | Type.WarrantyDurationLabor |
| COBie_Replacement_Cost | Currency | Type | Type.ReplacementCost |
| COBie_Expected_Life | Integer | Type | Type.ExpectedLife |
| COBie_Color | Text | Type | Type.Color |
| COBie_Finish | Text | Type | Type.Finish |
| COBie_Material | Text | Type | Type.Material |
| COBie_Sustainability | Text | Type | Type.Sustainability |
| COBie_Accessibility | Text | Type | Type.AccessibilityPerformance |
| COBie_Serial_Number | Text | Instance | Component.SerialNumber |
| COBie_Installation_Date | Text | Instance | Component.InstallationDate |
| COBie_Bar_Code | Text | Instance | Component.BarCode |
| COBie_Asset_Identifier | Text | Instance | Component.AssetIdentifier |

---

## Implementation Priority Matrix

| Feature | Impact | Complexity | Priority |
|---|---|---|---|
| **Material Parameters** | High | Low | P0 - Must Have |
| **LOD (Coarse/Medium/Fine)** | High | Medium | P0 - Must Have |
| **2D Plan Symbols** | High | Medium | P0 - Must Have |
| **Correct Category & Subcategories** | High | Low | P0 - Must Have |
| **Shared Parameters** | High | Medium | P0 - Must Have |
| **Formula-Driven Parametrics** | High | High | P1 - Should Have |
| **Type Catalog Generation** | Medium | Low | P1 - Should Have |
| **IFC Classification** | Medium | Medium | P1 - Should Have |
| **OmniClass Assignment** | Medium | Low | P1 - Should Have |
| **Nested Families** | Medium | High | P2 - Nice to Have |
| **Connector Support (MEP)** | Low-Medium | High | P2 - Nice to Have |
| **COBie Data** | Low-Medium | Medium | P2 - Nice to Have |
| **Validation Engine** | High | Medium | P1 - Should Have |

---

## Summary: What Makes a World-Class Revit Family Generator

A world-class generator must produce families that:

1. **Are parametrically robust**: Flex to any reasonable dimension without breaking
2. **Follow professional naming conventions**: Consistent, readable, standards-compliant names
3. **Include all three LOD representations**: Coarse (bounding box), Medium (recognizable form), Fine (full detail)
4. **Have proper 2D plan symbols**: Symbolic lines and masking regions for plan views
5. **Use shared parameters**: With valid GUIDs for scheduling and tagging
6. **Assign materials via parameters**: Not hard-coded, render-ready
7. **Are correctly categorized**: Right Revit category with appropriate subcategories
8. **Are lightweight**: Under 500 KB for simple families, under 1 MB for complex ones
9. **Include classification data**: OmniClass, Assembly Code, and IFC export parameters
10. **Support type catalogs**: For families with multiple size/material variants
11. **Include COBie-ready parameters**: For facility management handover
12. **Have proper constraints**: Geometry locked to reference planes with Strong/Weak settings
13. **Include formula logic**: Conditional visibility, dimension clamping, proportional scaling
14. **Pass automated validation**: Score 4.0+ on the validation checklist
15. **Are backwards-compatible**: Target Revit 2020+ compatibility

---

## Sources

### Revit Family Best Practices
- [Architectural Revit Families - Complete Guide 2026](https://libraryrevit.com/architectural-revit-families-guide-2026/)
- [Revit Families Explained 2025 - Revit Families Hub](https://revitfamilieshub.com/revit-families-explained-2025/)
- [Revit 2025 - Types of Parameters - ARKANCE](https://ukcommunity.arkance.world/hc/en-us/articles/21550975582738-Revit-2025-Types-of-Parameters)
- [Revit 2026 Understanding Revit Families - ARKANCE](https://ukcommunity.arkance.world/hc/en-us/articles/28886343206034-Revit-2026-Understanding-Revit-Families)
- [Create Family Parameters - Autodesk Help](https://help.autodesk.com/view/RVT/2025/ENU/?guid=GUID-921F7A15-D191-4F75-8243-4989C482E253)

### AI-Powered BIM Tools
- [AI in BIM: Tools, Workflows, and Real-World Use Cases](https://www.myarchitectai.com/blog/bim-ai)
- [8 Best Revit AI Tools and Plugins in 2026](https://www.myarchitectai.com/blog/revit-ai-tools)
- [Top AI Tools for BIM Architects in 2026 - Rendair AI](https://rendair.ai/blog/tools-top-ai-tools-for-bim-architects-in-2026-enhanching-workshops-and-visualization/)
- [Hypar](https://hypar.io/)

### 3D Reconstruction
- [3D Gaussian Splatting vs NeRF - PyImageSearch](https://pyimagesearch.com/2024/12/09/3d-gaussian-splatting-vs-nerf-the-end-game-of-3d-reconstruction/)
- [Wonder3D - Single Image to 3D](https://www.xxlong.site/Wonder3D/)
- [Wonder3D++ - Cross-domain Diffusion](https://arxiv.org/abs/2511.01767)
- [Point2CAD - Reverse Engineering CAD Models](https://www.obukhov.ai/point2cad.html)
- [Point2Primitive - CAD Reconstruction](https://arxiv.org/abs/2505.02043)

### Revit Parameters
- [11 Tips to Master Revit Parameters - BIM Pure](https://www.bimpure.com/blog/parameters)
- [Types of Revit Parameters - BIM GYM](https://bimgym.com/en/types-of-revit-parameters-and-recommendations/)
- [REVIT PARAMETER TYPES - Evolve Consultancy](https://evolve-consultancy.com/product/revit-parameter-types/)
- [BuiltInParameterGroup Enumeration - Revit API Docs](https://www.revitapidocs.com/2023/9942b791-2892-0658-303e-abf99675c5a6.htm)

### Validation Standards
- [Revit Families 101: 20 Rules - BIMsmith](https://blog.bimsmith.com/Revit-Families-101-The-20-Rules-of-Properly-Built-Revit-Families)
- [Nexus Revit Family Standards - CTC Software](https://ctcsoftware.com/help/nexus/familystandards)
- [Revit Family Content Guidance - BIM UK](https://bimuk.co.uk/best-practise/revit-family-content-guidance/)
- [FCSI Global Revit Standards 2022](https://fcsita.org/wp-content/uploads/2023/08/2022-FCSI-Global-Revit-Standards-Final.pdf)
- [Complex Families in Revit - Modelical](https://www.modelical.com/en/gdocs/complex-families/)

### Furniture Standards
- [Standard Sizes for Basic Furniture - TY Fine Furniture](https://www.tyfinefurniture.com/blogs/blog/common-sizes-for-typical-furniture)
- [Standard Dimensions of Furniture - Nordholtz](https://nordholtz.com/standard-dimensions-of-furniture/)
- [Office Furniture Dimensions - Dimensions.com](https://www.dimensions.com/collection/office-furniture)
- [Finding the Ergonomic Office Chair Dimensions - Boulies](https://boulies.com/blogs/tips-and-guides/finding-the-ergonomic-office-chair-dimensions)

### LOD, Plan Symbols, Nested Families
- [Unlocking Detail Levels in Revit - FetchBIM](https://blog.fetchbim.com/unlocking-the-power-of-detail-levels-in-revit-modifying-for-better-family-creation)
- [Scalable Revit Families Using Nested Geometry - Novedge](https://novedge.com/blogs/design-news/revit-tip-scalable-revit-families-using-nested-geometry)
- [8 Principles of Powerful Revit Window Families - BIM Pure](https://www.bimpure.com/blog/8-principles-of-powerful-revit-window-families)
- [MEP Families for Ceiling Coordination - AUGI](https://www.augi.com/articles/detail/mep-families-for-ceiling-coordination)

### IFC & Classification
- [IFC Classification in Revit - Evolve Consultancy](https://evolve-consultancy.com/product/ifc-classification-revit/)
- [Navigating OmniClass and UniClass in Revit - Autodesk](https://www.autodesk.com/support/technical/article/caas/sfdcarticles/sfdcarticles/Navigating-OmniClass-and-UniClass-Classifications-in-Revit.html)
- [OmniClass Table 23 Products List - StartBIM](https://www.startbim.com/2017/06/omniclass-23-products-list.html)
- [Classifications - Autodesk IFC Manual](https://autodesk.ifc-manual.com/revit/classifications)

### COBie
- [COBie Part 1: Exporting Data from Revit - Conserve Solution](https://www.conservesolution.com/blog/bim-for-facility-management-cobie-part-1/)
- [Autodesk COBie Extension for Revit](https://interoperability.autodesk.com/cobieextensionrevit.php)
- [Understanding COBie - Evolve Consultancy](https://evolve-consultancy.com/product/cobie-understandingcobie/)
- [Comprehensive Guide to COBie - ArtisanBIM](https://artisanbim.com/blog/cobie-standard)
- [Data Fields - NIBS COBie](https://www.nibs.org/nbims/v3/cobie/4.3)

### Shared Parameters & Type Catalogs
- [Investigating Revit's Shared Parameter File - IMAGINiT](https://resources.imaginit.com/building-solutions-blog/investigating-revits-shared-parameter-file)
- [Shared Parameters - Autodesk Help](https://help.autodesk.com/cloudhelp/2023/ENU/Revit-Model/files/GUID-E7D12B71-C50D-46D8-886B-8E0C2B285988.htm)
- [Type Catalogues - The Building Coder](https://thebuildingcoder.typepad.com/blog/2015/07/type-catalogues.html)
- [How to Use a Type Catalog - BIMsmith](https://bimsmith.com/help/learning-revit/How-to-Use-a-Type-Catalog)

### Formulas & Connectors
- [Conditional Statements in Formulas - Autodesk](https://knowledge.autodesk.com/support/revit/learn-explore/caas/CloudHelp/cloudhelp/2018/ENU/Revit-Model/files/GUID-A0FA7A2C-9C1D-40F3-A808-73CD0A4A3F20-htm.html)
- [5 Essential Formula Techniques - BIMsmith](https://blog.bimsmith.com/Revit-Formulas-5-Essential-Formula-Techniques-for-Constraining-Revit-Parameters)
- [Connectors API Documentation - Autodesk](https://help.autodesk.com/cloudhelp/2024/ESP/Revit-API/files/Revit_API_Developers_Guide/Discipline_Specific_Functionality/MEP_Engineering/Revit_API_Revit_API_Developers_Guide_Discipline_Specific_Functionality_MEP_Engineering_Connectors_html.html)
- [The Revit MEP API - Jeremy Tammik](https://jeremytammik.github.io/tbc/a/0219_mep_api.htm)

### Materials
- [Hybrid Revit Families: Complex Organic Objects with Correct Texture Mapping - Autodesk University](https://www.autodesk.com/autodesk-university/article/Hybrid-Revit-Families-Complex-Organic-Objects-Correct-Texture-Mapping)
- [Mastering Revit Materials - Kinship](https://kinship.io/blog/mastering-revit-materials)
- [Materials in Revit - Modelical](https://www.modelical.com/en/gdocs/materials-in-revit-use-and-management/)
