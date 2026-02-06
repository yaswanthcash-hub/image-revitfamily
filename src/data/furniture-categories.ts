export interface DimensionSpec {
  label: string
  key: string
  min: number
  max: number
  default: number
  unit: string
  step: number
}

export interface ComponentDetection {
  id: string
  label: string
  confidence: number
  x: number
  y: number
  width: number
  height: number
}

export interface MaterialSlot {
  key: string
  label: string
  default: string
  options: string[]
}

export interface FurnitureCategory {
  id: string
  name: string
  revitCategory: string
  omniClass: string
  uniclass: string
  ifcEntity: string
  description: string
  icon: string
  templates: string[]
  components: { name: string; confidence: number; detected: boolean }[]
  detections: ComponentDetection[]
  dimensions: DimensionSpec[]
  materials: MaterialSlot[]
  baseTypes: string[]
  subcategories: string[]
  analysisSteps: string[]
  suggestedTemplate: string
}

export const furnitureCategories: FurnitureCategory[] = [
  {
    id: 'office-chair',
    name: 'Office Chair',
    revitCategory: 'Furniture',
    omniClass: '23-21 11 11',
    uniclass: 'Pr_40_30_29',
    ifcEntity: 'IfcFurniture',
    description: 'Task chairs, executive chairs, conference seating',
    icon: 'Armchair',
    templates: ['Task Chair - 5 Star Base', 'Executive Chair - High Back', 'Conference Chair - Sled Base', 'Stacking Chair - 4 Leg'],
    components: [
      { name: 'Seat Pan', confidence: 98, detected: true },
      { name: 'Backrest', confidence: 96, detected: true },
      { name: 'Armrests', confidence: 94, detected: true },
      { name: 'Gas Cylinder', confidence: 97, detected: true },
      { name: 'Base (5-Star)', confidence: 95, detected: true },
      { name: 'Casters', confidence: 92, detected: true },
      { name: 'Lumbar Support', confidence: 88, detected: true },
      { name: 'Headrest', confidence: 85, detected: false },
    ],
    detections: [
      { id: '1', label: 'Seat Pan', confidence: 98, x: 20, y: 42, width: 55, height: 18 },
      { id: '2', label: 'Backrest', confidence: 96, x: 22, y: 10, width: 50, height: 35 },
      { id: '3', label: 'Armrests', confidence: 94, x: 8, y: 32, width: 80, height: 12 },
      { id: '4', label: 'Gas Cylinder', confidence: 97, x: 42, y: 58, width: 12, height: 18 },
      { id: '5', label: 'Base (5-Star)', confidence: 95, x: 25, y: 75, width: 50, height: 12 },
      { id: '6', label: 'Casters', confidence: 92, x: 15, y: 88, width: 65, height: 10 },
    ],
    dimensions: [
      { label: 'Seat Height', key: 'seatHeight', min: 15, max: 22, default: 17.5, unit: '"', step: 0.25 },
      { label: 'Seat Width', key: 'seatWidth', min: 17, max: 22, default: 19, unit: '"', step: 0.25 },
      { label: 'Seat Depth', key: 'seatDepth', min: 15, max: 20, default: 17, unit: '"', step: 0.25 },
      { label: 'Overall Height', key: 'overallHeight', min: 34, max: 53, default: 40, unit: '"', step: 0.5 },
      { label: 'Overall Width', key: 'overallWidth', min: 23, max: 30, default: 26, unit: '"', step: 0.25 },
      { label: 'Overall Depth', key: 'overallDepth', min: 23, max: 28, default: 25, unit: '"', step: 0.25 },
      { label: 'Arm Height', key: 'armHeight', min: 25, max: 33, default: 28, unit: '"', step: 0.25 },
      { label: 'Back Height', key: 'backHeight', min: 16, max: 30, default: 22, unit: '"', step: 0.5 },
    ],
    materials: [
      { key: 'seatMaterial', label: 'Seat Upholstery', default: 'Fabric - Charcoal', options: ['Fabric - Charcoal', 'Fabric - Navy', 'Fabric - Black', 'Mesh - Black', 'Mesh - Gray', 'Leather - Black', 'Leather - Brown', 'Vinyl - Black'] },
      { key: 'backMaterial', label: 'Back Material', default: 'Mesh - Black', options: ['Mesh - Black', 'Mesh - Gray', 'Fabric - Charcoal', 'Fabric - Navy', 'Leather - Black', 'Plastic - Black'] },
      { key: 'frameMaterial', label: 'Frame/Base', default: 'Aluminum - Polished', options: ['Aluminum - Polished', 'Aluminum - Brushed', 'Steel - Chrome', 'Steel - Black', 'Nylon - Black', 'Nylon - Gray'] },
      { key: 'armMaterial', label: 'Armrest Pad', default: 'Polyurethane - Black', options: ['Polyurethane - Black', 'Polyurethane - Gray', 'Rubber - Black', 'Leather - Black', 'None'] },
    ],
    baseTypes: ['5-Star Swivel', '4-Leg', 'Sled Base', 'Cantilever'],
    subcategories: ['Seat', 'Back', 'Arms', 'Base', 'Casters', 'Mechanism'],
    analysisSteps: [
      'Classifying furniture category...',
      'Detecting seat pan geometry...',
      'Identifying backrest profile...',
      'Analyzing armrest configuration...',
      'Detecting base type & casters...',
      'Extracting BIFMA G1 dimensions...',
      'Matching Revit template...',
      'Generating parametric constraints...',
      'Analysis complete!',
    ],
    suggestedTemplate: 'Task Chair - 5 Star Base',
  },
  {
    id: 'dining-table',
    name: 'Dining / Conference Table',
    revitCategory: 'Furniture',
    omniClass: '23-21 11 13',
    uniclass: 'Pr_40_30_89',
    ifcEntity: 'IfcFurniture',
    description: 'Dining tables, conference tables, meeting tables',
    icon: 'Table',
    templates: ['Rectangular Table - 4 Leg', 'Round Table - Pedestal', 'Oval Table - Trestle', 'Boat-Shape Conference'],
    components: [
      { name: 'Tabletop', confidence: 99, detected: true },
      { name: 'Edge Profile', confidence: 93, detected: true },
      { name: 'Apron/Skirt', confidence: 88, detected: true },
      { name: 'Legs', confidence: 96, detected: true },
      { name: 'Stretchers', confidence: 82, detected: false },
      { name: 'Leveling Glides', confidence: 78, detected: false },
    ],
    detections: [
      { id: '1', label: 'Tabletop', confidence: 99, x: 5, y: 15, width: 90, height: 25 },
      { id: '2', label: 'Edge Profile', confidence: 93, x: 5, y: 35, width: 90, height: 8 },
      { id: '3', label: 'Legs', confidence: 96, x: 10, y: 42, width: 78, height: 52 },
      { id: '4', label: 'Apron/Skirt', confidence: 88, x: 12, y: 38, width: 75, height: 10 },
    ],
    dimensions: [
      { label: 'Table Height', key: 'tableHeight', min: 28, max: 32, default: 30, unit: '"', step: 0.25 },
      { label: 'Table Length', key: 'tableLength', min: 36, max: 120, default: 72, unit: '"', step: 1 },
      { label: 'Table Width', key: 'tableWidth', min: 30, max: 60, default: 36, unit: '"', step: 1 },
      { label: 'Top Thickness', key: 'topThickness', min: 0.75, max: 2, default: 1.25, unit: '"', step: 0.125 },
      { label: 'Leg Width', key: 'legWidth', min: 2, max: 6, default: 3, unit: '"', step: 0.25 },
      { label: 'Overhang', key: 'overhang', min: 0, max: 6, default: 2, unit: '"', step: 0.25 },
    ],
    materials: [
      { key: 'topMaterial', label: 'Tabletop', default: 'Wood - Oak', options: ['Wood - Oak', 'Wood - Walnut', 'Wood - Maple', 'Wood - Cherry', 'Laminate - White', 'Laminate - Gray', 'Stone - Marble', 'Stone - Granite', 'Glass - Clear', 'Glass - Frosted'] },
      { key: 'edgeMaterial', label: 'Edge Banding', default: 'Wood - Oak (matched)', options: ['Wood - Oak (matched)', 'PVC - Black', 'PVC - White', 'Metal - Chrome', 'Rubber - Black', 'Self-Edge'] },
      { key: 'legMaterial', label: 'Legs/Base', default: 'Wood - Oak (matched)', options: ['Wood - Oak (matched)', 'Wood - Walnut', 'Metal - Chrome', 'Metal - Black', 'Metal - Brushed Nickel', 'Cast Iron - Black'] },
    ],
    baseTypes: ['4-Leg', 'Pedestal (Single)', 'Pedestal (Double)', 'Trestle', 'X-Base', 'U-Leg'],
    subcategories: ['Top', 'Base', 'Edge', 'Apron', 'Hardware'],
    analysisSteps: [
      'Classifying furniture category...',
      'Detecting tabletop geometry...',
      'Measuring edge profile...',
      'Identifying base/leg configuration...',
      'Extracting surface dimensions...',
      'Detecting material properties...',
      'Matching Revit template...',
      'Generating parametric constraints...',
      'Analysis complete!',
    ],
    suggestedTemplate: 'Rectangular Table - 4 Leg',
  },
  {
    id: 'office-desk',
    name: 'Office Desk / Workstation',
    revitCategory: 'Furniture',
    omniClass: '23-21 11 15',
    uniclass: 'Pr_40_30_22',
    ifcEntity: 'IfcFurniture',
    description: 'L-desks, straight desks, sit-stand desks, reception desks',
    icon: 'Monitor',
    templates: ['Straight Desk - Panel Legs', 'L-Desk - Metal Frame', 'Sit-Stand Desk - Electric', 'Reception Desk - Curved'],
    components: [
      { name: 'Worksurface', confidence: 98, detected: true },
      { name: 'Modesty Panel', confidence: 91, detected: true },
      { name: 'Legs/Supports', confidence: 95, detected: true },
      { name: 'Cable Management', confidence: 87, detected: true },
      { name: 'Grommet/Power Access', confidence: 83, detected: true },
      { name: 'Return Surface', confidence: 76, detected: false },
    ],
    detections: [
      { id: '1', label: 'Worksurface', confidence: 98, x: 5, y: 12, width: 90, height: 20 },
      { id: '2', label: 'Modesty Panel', confidence: 91, x: 10, y: 35, width: 78, height: 30 },
      { id: '3', label: 'Legs/Supports', confidence: 95, x: 8, y: 30, width: 82, height: 55 },
      { id: '4', label: 'Cable Management', confidence: 87, x: 40, y: 60, width: 20, height: 15 },
      { id: '5', label: 'Grommet', confidence: 83, x: 70, y: 15, width: 10, height: 8 },
    ],
    dimensions: [
      { label: 'Desk Height', key: 'deskHeight', min: 27, max: 50, default: 29, unit: '"', step: 0.25 },
      { label: 'Desk Width', key: 'deskWidth', min: 42, max: 84, default: 60, unit: '"', step: 1 },
      { label: 'Desk Depth', key: 'deskDepth', min: 24, max: 36, default: 30, unit: '"', step: 1 },
      { label: 'Top Thickness', key: 'topThickness', min: 1, max: 1.5, default: 1, unit: '"', step: 0.125 },
      { label: 'Modesty Height', key: 'modestyHeight', min: 8, max: 18, default: 12, unit: '"', step: 0.5 },
      { label: 'Return Depth', key: 'returnDepth', min: 18, max: 24, default: 20, unit: '"', step: 1 },
    ],
    materials: [
      { key: 'topMaterial', label: 'Worksurface', default: 'Laminate - White', options: ['Laminate - White', 'Laminate - Gray', 'Laminate - Maple', 'Wood Veneer - Walnut', 'Wood Veneer - Oak', 'Solid Surface - White', 'Bamboo - Natural'] },
      { key: 'edgeMaterial', label: 'Edge', default: 'PVC - Matching', options: ['PVC - Matching', 'PVC - Black', '3mm PVC - Contrasting', 'Wood - Self Edge', 'Metal - Aluminum'] },
      { key: 'frameMaterial', label: 'Frame/Legs', default: 'Steel - Silver', options: ['Steel - Silver', 'Steel - Black', 'Steel - White', 'Aluminum - Polished', 'Wood - Matching', 'Panel - Matching Laminate'] },
      { key: 'modestyMaterial', label: 'Modesty Panel', default: 'Steel - Silver', options: ['Steel - Silver', 'Steel - Black', 'Laminate - Matching', 'Fabric - Acoustic', 'None'] },
    ],
    baseTypes: ['Panel End', 'Metal Frame', 'Cantilever', 'Height-Adjustable', 'T-Leg'],
    subcategories: ['Worksurface', 'Base', 'Modesty Panel', 'Cable Tray', 'Hardware'],
    analysisSteps: [
      'Classifying furniture category...',
      'Detecting worksurface geometry...',
      'Analyzing leg/support system...',
      'Identifying modesty panel...',
      'Detecting cable management...',
      'Extracting workstation dimensions...',
      'Checking ADA compliance (29" knee clearance)...',
      'Matching Revit template...',
      'Generating parametric constraints...',
      'Analysis complete!',
    ],
    suggestedTemplate: 'Straight Desk - Panel Legs',
  },
  {
    id: 'storage-cabinet',
    name: 'Storage Cabinet / Casework',
    revitCategory: 'Casework',
    omniClass: '23-21 13 11',
    uniclass: 'Pr_40_30_14',
    ifcEntity: 'IfcFurnishingElement',
    description: 'File cabinets, bookcases, credenzas, storage towers',
    icon: 'Archive',
    templates: ['Lateral File Cabinet', 'Bookcase - Open Shelf', 'Storage Credenza - 2 Door', 'Tower Cabinet - 4 Drawer'],
    components: [
      { name: 'Carcass/Box', confidence: 97, detected: true },
      { name: 'Doors', confidence: 95, detected: true },
      { name: 'Drawers', confidence: 93, detected: true },
      { name: 'Shelves', confidence: 91, detected: true },
      { name: 'Hardware/Pulls', confidence: 89, detected: true },
      { name: 'Base/Toe Kick', confidence: 86, detected: true },
      { name: 'Back Panel', confidence: 84, detected: false },
    ],
    detections: [
      { id: '1', label: 'Carcass', confidence: 97, x: 8, y: 5, width: 82, height: 82 },
      { id: '2', label: 'Doors', confidence: 95, x: 10, y: 8, width: 78, height: 55 },
      { id: '3', label: 'Hardware/Pulls', confidence: 89, x: 45, y: 30, width: 12, height: 8 },
      { id: '4', label: 'Base/Toe Kick', confidence: 86, x: 10, y: 88, width: 78, height: 10 },
    ],
    dimensions: [
      { label: 'Cabinet Height', key: 'cabinetHeight', min: 28, max: 84, default: 42, unit: '"', step: 1 },
      { label: 'Cabinet Width', key: 'cabinetWidth', min: 15, max: 48, default: 36, unit: '"', step: 1 },
      { label: 'Cabinet Depth', key: 'cabinetDepth', min: 12, max: 24, default: 18, unit: '"', step: 0.5 },
      { label: 'Shelf Spacing', key: 'shelfSpacing', min: 8, max: 16, default: 12, unit: '"', step: 0.5 },
      { label: 'Toe Kick Height', key: 'toeKickHeight', min: 3, max: 6, default: 4, unit: '"', step: 0.25 },
      { label: 'Panel Thickness', key: 'panelThickness', min: 0.5, max: 1, default: 0.75, unit: '"', step: 0.125 },
    ],
    materials: [
      { key: 'carcassMaterial', label: 'Carcass', default: 'Laminate - White', options: ['Laminate - White', 'Laminate - Gray', 'Laminate - Maple', 'Wood Veneer - Walnut', 'Wood Veneer - Cherry', 'Steel - Putty', 'Steel - Black'] },
      { key: 'doorMaterial', label: 'Doors/Fronts', default: 'Laminate - White', options: ['Laminate - White', 'Laminate - Matching', 'Wood Veneer - Walnut', 'Glass - Clear', 'Glass - Frosted', 'Steel - Matching'] },
      { key: 'hardwareMaterial', label: 'Hardware/Pulls', default: 'Chrome - Polished', options: ['Chrome - Polished', 'Brushed Nickel', 'Matte Black', 'Brass - Satin', 'Aluminum - Anodized', 'Integrated Pull'] },
    ],
    baseTypes: ['Toe Kick', 'Plinth Base', 'Leveling Legs', 'Casters', 'Wall-Mounted'],
    subcategories: ['Carcass', 'Doors', 'Drawers', 'Shelves', 'Hardware', 'Interior Fittings'],
    analysisSteps: [
      'Classifying furniture category...',
      'Detecting carcass/box geometry...',
      'Identifying door configuration...',
      'Analyzing drawer layout...',
      'Detecting shelf positions...',
      'Extracting hardware placement...',
      'Measuring overall dimensions...',
      'Matching Revit template...',
      'Generating parametric constraints...',
      'Analysis complete!',
    ],
    suggestedTemplate: 'Lateral File Cabinet',
  },
  {
    id: 'sofa-lounge',
    name: 'Sofa / Lounge Seating',
    revitCategory: 'Furniture',
    omniClass: '23-21 11 17',
    uniclass: 'Pr_40_30_76',
    ifcEntity: 'IfcFurniture',
    description: 'Sofas, loveseats, lounge chairs, sectionals',
    icon: 'Sofa',
    templates: ['2-Seat Sofa - Track Arm', '3-Seat Sofa - Roll Arm', 'Lounge Chair - Club', 'Sectional - L-Shape'],
    components: [
      { name: 'Seat Cushion(s)', confidence: 97, detected: true },
      { name: 'Back Cushion(s)', confidence: 95, detected: true },
      { name: 'Frame/Arms', confidence: 93, detected: true },
      { name: 'Base/Legs', confidence: 91, detected: true },
      { name: 'Throw Pillows', confidence: 84, detected: false },
    ],
    detections: [
      { id: '1', label: 'Seat Cushions', confidence: 97, x: 10, y: 50, width: 78, height: 20 },
      { id: '2', label: 'Back Cushions', confidence: 95, x: 12, y: 15, width: 74, height: 38 },
      { id: '3', label: 'Arms', confidence: 93, x: 3, y: 20, width: 92, height: 35 },
      { id: '4', label: 'Base/Legs', confidence: 91, x: 8, y: 72, width: 82, height: 18 },
    ],
    dimensions: [
      { label: 'Seat Height', key: 'seatHeight', min: 15, max: 20, default: 17, unit: '"', step: 0.25 },
      { label: 'Overall Height', key: 'overallHeight', min: 28, max: 40, default: 34, unit: '"', step: 0.5 },
      { label: 'Overall Width', key: 'overallWidth', min: 50, max: 100, default: 72, unit: '"', step: 1 },
      { label: 'Overall Depth', key: 'overallDepth', min: 30, max: 42, default: 36, unit: '"', step: 0.5 },
      { label: 'Arm Height', key: 'armHeight', min: 22, max: 30, default: 26, unit: '"', step: 0.25 },
      { label: 'Seat Depth', key: 'seatDepth', min: 20, max: 26, default: 22, unit: '"', step: 0.25 },
    ],
    materials: [
      { key: 'upholsteryMaterial', label: 'Primary Upholstery', default: 'Fabric - Gray Tweed', options: ['Fabric - Gray Tweed', 'Fabric - Navy', 'Fabric - Charcoal', 'Leather - Black', 'Leather - Cognac', 'Leather - Gray', 'Velvet - Emerald', 'Velvet - Navy', 'Linen - Natural'] },
      { key: 'legMaterial', label: 'Legs/Base', default: 'Wood - Walnut', options: ['Wood - Walnut', 'Wood - Oak', 'Wood - Ebony', 'Metal - Chrome', 'Metal - Black', 'Metal - Brass'] },
      { key: 'pillowMaterial', label: 'Accent Pillows', default: 'Fabric - Contrasting', options: ['Fabric - Contrasting', 'Fabric - Matching', 'Leather - Accent', 'Velvet - Accent', 'None'] },
    ],
    baseTypes: ['Tapered Leg', 'Block Foot', 'Metal Frame', 'Plinth', 'Hairpin Leg'],
    subcategories: ['Seat', 'Back', 'Arms', 'Legs', 'Cushions', 'Upholstery'],
    analysisSteps: [
      'Classifying furniture category...',
      'Detecting seat cushion layout...',
      'Analyzing backrest profile...',
      'Identifying arm style...',
      'Detecting base/leg configuration...',
      'Estimating seating capacity...',
      'Extracting overall dimensions...',
      'Matching Revit template...',
      'Generating parametric constraints...',
      'Analysis complete!',
    ],
    suggestedTemplate: '3-Seat Sofa - Roll Arm',
  },
  {
    id: 'pendant-light',
    name: 'Pendant / Ceiling Light',
    revitCategory: 'Lighting Fixtures',
    omniClass: '23-35 47 11',
    uniclass: 'Pr_60_60_48',
    ifcEntity: 'IfcLightFixture',
    description: 'Pendant lights, chandeliers, ceiling fixtures, linear luminaires',
    icon: 'Lightbulb',
    templates: ['Pendant - Drum Shade', 'Pendant - Globe', 'Linear Pendant - Office', 'Chandelier - Multi-Arm'],
    components: [
      { name: 'Shade/Diffuser', confidence: 96, detected: true },
      { name: 'Light Source', confidence: 93, detected: true },
      { name: 'Canopy/Mounting', confidence: 90, detected: true },
      { name: 'Suspension Cable', confidence: 88, detected: true },
      { name: 'Socket/Lampholder', confidence: 85, detected: true },
    ],
    detections: [
      { id: '1', label: 'Shade/Diffuser', confidence: 96, x: 15, y: 35, width: 65, height: 45 },
      { id: '2', label: 'Canopy', confidence: 90, x: 35, y: 2, width: 25, height: 10 },
      { id: '3', label: 'Suspension', confidence: 88, x: 45, y: 10, width: 8, height: 28 },
      { id: '4', label: 'Light Source', confidence: 93, x: 30, y: 55, width: 35, height: 20 },
    ],
    dimensions: [
      { label: 'Fixture Diameter', key: 'fixtureDiameter', min: 6, max: 48, default: 18, unit: '"', step: 1 },
      { label: 'Fixture Height', key: 'fixtureHeight', min: 6, max: 36, default: 14, unit: '"', step: 0.5 },
      { label: 'Suspension Length', key: 'suspensionLength', min: 12, max: 120, default: 36, unit: '"', step: 1 },
      { label: 'Canopy Diameter', key: 'canopyDiameter', min: 4, max: 8, default: 5, unit: '"', step: 0.25 },
    ],
    materials: [
      { key: 'shadeMaterial', label: 'Shade/Diffuser', default: 'Fabric - White Linen', options: ['Fabric - White Linen', 'Fabric - Black', 'Metal - Brass', 'Metal - Matte Black', 'Glass - Clear', 'Glass - Opal White', 'Glass - Amber', 'Acrylic - Frosted'] },
      { key: 'frameMaterial', label: 'Frame/Hardware', default: 'Metal - Brass', options: ['Metal - Brass', 'Metal - Chrome', 'Metal - Matte Black', 'Metal - Nickel', 'Metal - Copper', 'Wood - Natural'] },
    ],
    baseTypes: ['Single Pendant', 'Multi-Pendant (3)', 'Multi-Pendant (5)', 'Linear (2ft)', 'Linear (4ft)'],
    subcategories: ['Shade', 'Frame', 'Light Source', 'Mounting', 'Diffuser'],
    analysisSteps: [
      'Classifying fixture category...',
      'Detecting shade geometry...',
      'Identifying light source type...',
      'Analyzing mounting system...',
      'Extracting photometric data...',
      'Calculating light distribution...',
      'Matching Revit template...',
      'Setting up light source connector...',
      'Analysis complete!',
    ],
    suggestedTemplate: 'Pendant - Drum Shade',
  },
]

export const revitParameterGroups = {
  identity: {
    label: 'Identity Data',
    params: [
      { key: 'manufacturer', label: 'Manufacturer', type: 'text', placeholder: 'e.g., Herman Miller' },
      { key: 'model', label: 'Model', type: 'text', placeholder: 'e.g., Aeron Chair' },
      { key: 'modelUrl', label: 'URL', type: 'text', placeholder: 'https://manufacturer.com/product' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Product description...' },
      { key: 'assemblyCode', label: 'Assembly Code', type: 'text', placeholder: 'e.g., E2010' },
      { key: 'assemblyDescription', label: 'Assembly Description', type: 'text', placeholder: 'e.g., Fixed Furnishings' },
      { key: 'typeMark', label: 'Type Mark', type: 'text', placeholder: 'e.g., CH-A' },
      { key: 'keynote', label: 'Keynote', type: 'text', placeholder: 'e.g., 12.51.00' },
      { key: 'typeComments', label: 'Type Comments', type: 'text', placeholder: '' },
    ],
  },
  cost: {
    label: 'Cost & Procurement',
    params: [
      { key: 'cost', label: 'Cost', type: 'currency', placeholder: '0.00' },
      { key: 'leadTime', label: 'Lead Time (weeks)', type: 'number', placeholder: '4' },
      { key: 'warrantyYears', label: 'Warranty (years)', type: 'number', placeholder: '12' },
    ],
  },
  classification: {
    label: 'IFC / Classification',
    params: [
      { key: 'omniClassNumber', label: 'OmniClass Number', type: 'text', placeholder: '23-21 11 11' },
      { key: 'omniClassTitle', label: 'OmniClass Title', type: 'text', placeholder: 'Chairs' },
      { key: 'uniclassCode', label: 'Uniclass 2015 Code', type: 'text', placeholder: 'Pr_40_30_29' },
      { key: 'ifcExportAs', label: 'IFC Export As', type: 'text', placeholder: 'IfcFurniture' },
    ],
  },
  sustainability: {
    label: 'Sustainability & Performance',
    params: [
      { key: 'weight', label: 'Weight (lbs)', type: 'number', placeholder: '0' },
      { key: 'recycledContent', label: 'Recycled Content (%)', type: 'number', placeholder: '0' },
      { key: 'certification', label: 'Certification', type: 'text', placeholder: 'e.g., GREENGUARD Gold' },
      { key: 'fireRating', label: 'Fire Rating', type: 'text', placeholder: 'e.g., CAL 133' },
    ],
  },
}

export const validationRules = [
  { id: 1, category: 'File & Metadata', name: 'Family file size under 1MB', severity: 'error' },
  { id: 2, category: 'File & Metadata', name: 'Category correctly assigned', severity: 'error' },
  { id: 3, category: 'File & Metadata', name: 'Revit version compatibility (2022-2025)', severity: 'error' },
  { id: 4, category: 'File & Metadata', name: 'File naming follows convention', severity: 'warning' },
  { id: 5, category: 'Parametric Integrity', name: 'All reference planes named', severity: 'error' },
  { id: 6, category: 'Parametric Integrity', name: 'Geometry locked to reference planes', severity: 'error' },
  { id: 7, category: 'Parametric Integrity', name: 'Dimensions are parametric (not fixed)', severity: 'error' },
  { id: 8, category: 'Parametric Integrity', name: 'Parameters flex without errors', severity: 'error' },
  { id: 9, category: 'Parametric Integrity', name: 'Formula-driven constraints valid', severity: 'warning' },
  { id: 10, category: 'Geometry Quality', name: 'Insertion point at origin', severity: 'error' },
  { id: 11, category: 'Geometry Quality', name: 'Geometry intersections resolved', severity: 'warning' },
  { id: 12, category: 'Geometry Quality', name: 'Symmetry enforcement applied', severity: 'warning' },
  { id: 13, category: 'Geometry Quality', name: 'No duplicate/overlapping geometry', severity: 'error' },
  { id: 14, category: 'Geometry Quality', name: 'LOD representations complete (C/M/F)', severity: 'error' },
  { id: 15, category: 'Parameter Standards', name: 'Identity Data parameters populated', severity: 'error' },
  { id: 16, category: 'Parameter Standards', name: 'Dimension parameters use correct units', severity: 'error' },
  { id: 17, category: 'Parameter Standards', name: 'Shared parameters use correct GUIDs', severity: 'warning' },
  { id: 18, category: 'Parameter Standards', name: 'Naming follows Autodesk Style Guide', severity: 'warning' },
  { id: 19, category: 'Subcategories', name: 'Subcategories correctly assigned', severity: 'error' },
  { id: 20, category: 'Subcategories', name: 'Visibility settings per subcategory', severity: 'warning' },
  { id: 21, category: 'Materials', name: 'Material parameters assigned', severity: 'error' },
  { id: 22, category: 'Materials', name: 'Materials render correctly', severity: 'warning' },
  { id: 23, category: 'Materials', name: 'Material naming follows standards', severity: 'warning' },
]

export type FurnitureCategoryId = typeof furnitureCategories[number]['id']
