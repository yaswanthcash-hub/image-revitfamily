export interface DimensionSpec {
  key: string
  label: string
  default: number
  min: number
  max: number
  step: number
  unit: string
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

export interface ComponentInfo {
  name: string
  detected: boolean
  confidence: number
}

export interface FurnitureCategory {
  id: string
  name: string
  description: string
  revitCategory: string
  omniClass: string
  uniclass: string
  ifcEntity: string
  suggestedTemplate: string
  analysisSteps: string[]
  components: ComponentInfo[]
  detections: ComponentDetection[]
  dimensions: DimensionSpec[]
  subcategories: string[]
  templates: string[]
}

export const furnitureCategories: FurnitureCategory[] = [
  {
    id: 'accent-chair',
    name: 'Accent / Lounge Chair',
    description: 'Upholstered accent chairs, wingback chairs, and lounge seating with fixed legs.',
    revitCategory: 'Furniture',
    omniClass: '23-21 11 11',
    uniclass: 'Pr_40_70_73_64',
    ifcEntity: 'IfcFurniture',
    suggestedTemplate: 'Metric Generic Model',
    analysisSteps: [
      'Detecting seat cushion...',
      'Analyzing backrest and wings...',
      'Identifying armrest style...',
      'Measuring leg positions...',
      'Extracting upholstery profile...',
      'Computing overall dimensions...',
    ],
    components: [
      { name: 'Seat Cushion', detected: true, confidence: 97 },
      { name: 'Backrest', detected: true, confidence: 96 },
      { name: 'Wings / Side Panels', detected: true, confidence: 89 },
      { name: 'Armrests', detected: true, confidence: 92 },
      { name: 'Front Legs', detected: true, confidence: 94 },
      { name: 'Rear Legs', detected: true, confidence: 91 },
    ],
    detections: [
      { id: 'seat', label: 'Seat', confidence: 97, x: 15, y: 50, width: 70, height: 18 },
      { id: 'back', label: 'Backrest', confidence: 96, x: 20, y: 8, width: 60, height: 45 },
      { id: 'arm-l', label: 'Left Arm', confidence: 92, x: 5, y: 20, width: 18, height: 45 },
      { id: 'arm-r', label: 'Right Arm', confidence: 92, x: 77, y: 20, width: 18, height: 45 },
      { id: 'legs', label: 'Legs', confidence: 94, x: 18, y: 72, width: 64, height: 26 },
    ],
    dimensions: [
      { key: 'seatHeight', label: 'Seat Height', default: 17, min: 14, max: 20, step: 0.5, unit: '"' },
      { key: 'seatWidth', label: 'Seat Width', default: 22, min: 18, max: 28, step: 0.5, unit: '"' },
      { key: 'seatDepth', label: 'Seat Depth', default: 21, min: 17, max: 26, step: 0.5, unit: '"' },
      { key: 'backHeight', label: 'Back Height', default: 20, min: 14, max: 30, step: 1, unit: '"' },
      { key: 'overallWidth', label: 'Overall Width', default: 28, min: 24, max: 36, step: 0.5, unit: '"' },
      { key: 'overallHeight', label: 'Overall Height', default: 38, min: 30, max: 46, step: 1, unit: '"' },
    ],
    subcategories: ['Wingback Chair', 'Club Chair', 'Barrel Chair', 'Slipper Chair', 'Accent Chair'],
    templates: ['Metric Generic Model', 'Chair - Lounge', 'Chair - Wingback', 'Chair - Accent'],
  },
  {
    id: 'office-chair',
    name: 'Office Chair',
    description: 'Ergonomic office seating with adjustable features, casters, and lumbar support.',
    revitCategory: 'Furniture',
    omniClass: '23-21 11 11',
    uniclass: 'Pr_40_70_73_64',
    ifcEntity: 'IfcFurniture',
    suggestedTemplate: 'Metric Generic Model',
    analysisSteps: [
      'Detecting seat geometry...',
      'Analyzing backrest curvature...',
      'Identifying armrest positions...',
      'Measuring base and casters...',
      'Extracting adjustment mechanism...',
      'Computing overall dimensions...',
    ],
    components: [
      { name: 'Seat Cushion', detected: true, confidence: 97 },
      { name: 'Backrest', detected: true, confidence: 95 },
      { name: 'Armrests', detected: true, confidence: 92 },
      { name: 'Gas Lift Cylinder', detected: true, confidence: 88 },
      { name: '5-Star Base', detected: true, confidence: 94 },
      { name: 'Casters', detected: true, confidence: 91 },
      { name: 'Headrest', detected: false, confidence: 30 },
    ],
    detections: [
      { id: 'seat', label: 'Seat', confidence: 97, x: 20, y: 40, width: 60, height: 20 },
      { id: 'back', label: 'Backrest', confidence: 95, x: 25, y: 10, width: 50, height: 35 },
      { id: 'arm-l', label: 'Left Arm', confidence: 92, x: 8, y: 30, width: 15, height: 25 },
      { id: 'arm-r', label: 'Right Arm', confidence: 92, x: 77, y: 30, width: 15, height: 25 },
      { id: 'base', label: 'Base', confidence: 94, x: 15, y: 75, width: 70, height: 22 },
    ],
    dimensions: [
      { key: 'seatHeight', label: 'Seat Height', default: 17.5, min: 15, max: 22, step: 0.5, unit: '"' },
      { key: 'seatWidth', label: 'Seat Width', default: 19, min: 16, max: 24, step: 0.5, unit: '"' },
      { key: 'seatDepth', label: 'Seat Depth', default: 17, min: 14, max: 22, step: 0.5, unit: '"' },
      { key: 'backHeight', label: 'Back Height', default: 22, min: 16, max: 32, step: 1, unit: '"' },
      { key: 'overallWidth', label: 'Overall Width', default: 26, min: 22, max: 30, step: 0.5, unit: '"' },
      { key: 'overallHeight', label: 'Overall Height', default: 40, min: 34, max: 52, step: 1, unit: '"' },
    ],
    subcategories: ['Task Chair', 'Executive Chair', 'Conference Chair', 'Stool', 'Ergonomic Chair'],
    templates: ['Metric Generic Model', 'Chair - Task', 'Chair - Executive', 'Chair - Conference'],
  },
  {
    id: 'sofa-lounge',
    name: 'Sofa / Lounge',
    description: 'Upholstered seating for lounges, lobbies, and collaborative spaces.',
    revitCategory: 'Furniture',
    omniClass: '23-21 11 13',
    uniclass: 'Pr_40_70_73_76',
    ifcEntity: 'IfcFurniture',
    suggestedTemplate: 'Metric Generic Model',
    analysisSteps: [
      'Detecting seat cushions...',
      'Analyzing backrest profile...',
      'Identifying armrest geometry...',
      'Measuring seating sections...',
      'Detecting leg/base type...',
      'Computing overall envelope...',
    ],
    components: [
      { name: 'Seat Cushions', detected: true, confidence: 96 },
      { name: 'Back Cushions', detected: true, confidence: 94 },
      { name: 'Left Armrest', detected: true, confidence: 90 },
      { name: 'Right Armrest', detected: true, confidence: 90 },
      { name: 'Frame Structure', detected: true, confidence: 88 },
      { name: 'Legs / Base', detected: true, confidence: 85 },
      { name: 'Throw Pillows', detected: false, confidence: 40 },
    ],
    detections: [
      { id: 'seat', label: 'Seat', confidence: 96, x: 10, y: 50, width: 80, height: 20 },
      { id: 'back', label: 'Backrest', confidence: 94, x: 10, y: 15, width: 80, height: 38 },
      { id: 'arm-l', label: 'Left Arm', confidence: 90, x: 2, y: 20, width: 12, height: 55 },
      { id: 'arm-r', label: 'Right Arm', confidence: 90, x: 86, y: 20, width: 12, height: 55 },
      { id: 'base', label: 'Legs', confidence: 85, x: 8, y: 82, width: 84, height: 16 },
    ],
    dimensions: [
      { key: 'seatHeight', label: 'Seat Height', default: 17, min: 14, max: 20, step: 0.5, unit: '"' },
      { key: 'overallHeight', label: 'Overall Height', default: 34, min: 28, max: 42, step: 1, unit: '"' },
      { key: 'overallWidth', label: 'Overall Width', default: 72, min: 48, max: 108, step: 2, unit: '"' },
      { key: 'overallDepth', label: 'Overall Depth', default: 36, min: 28, max: 44, step: 1, unit: '"' },
      { key: 'armHeight', label: 'Arm Height', default: 26, min: 20, max: 32, step: 0.5, unit: '"' },
      { key: 'seatDepth', label: 'Seat Depth', default: 22, min: 18, max: 28, step: 0.5, unit: '"' },
    ],
    subcategories: ['2-Seat Sofa', '3-Seat Sofa', 'Sectional', 'Loveseat', 'Chaise Lounge'],
    templates: ['Metric Generic Model', 'Sofa - 2 Seat', 'Sofa - 3 Seat', 'Sofa - Sectional'],
  },
  {
    id: 'dining-table',
    name: 'Dining Table',
    description: 'Tables for dining, conference, and collaborative spaces with various base types.',
    revitCategory: 'Furniture',
    omniClass: '23-21 11 21',
    uniclass: 'Pr_40_70_73_89',
    ifcEntity: 'IfcFurniture',
    suggestedTemplate: 'Metric Generic Model',
    analysisSteps: [
      'Detecting table surface...',
      'Analyzing edge profile...',
      'Identifying leg configuration...',
      'Measuring tabletop geometry...',
      'Detecting base type...',
      'Computing clearance dimensions...',
    ],
    components: [
      { name: 'Tabletop Surface', detected: true, confidence: 98 },
      { name: 'Edge Banding', detected: true, confidence: 86 },
      { name: 'Table Legs', detected: true, confidence: 93 },
      { name: 'Cross Bracing', detected: false, confidence: 35 },
      { name: 'Leveling Feet', detected: true, confidence: 80 },
    ],
    detections: [
      { id: 'top', label: 'Tabletop', confidence: 98, x: 5, y: 10, width: 90, height: 30 },
      { id: 'leg1', label: 'Leg', confidence: 93, x: 8, y: 40, width: 10, height: 55 },
      { id: 'leg2', label: 'Leg', confidence: 93, x: 82, y: 40, width: 10, height: 55 },
      { id: 'apron', label: 'Apron', confidence: 86, x: 10, y: 38, width: 80, height: 8 },
    ],
    dimensions: [
      { key: 'tableHeight', label: 'Table Height', default: 30, min: 28, max: 36, step: 0.5, unit: '"' },
      { key: 'tableLength', label: 'Table Length', default: 72, min: 36, max: 120, step: 2, unit: '"' },
      { key: 'tableWidth', label: 'Table Width', default: 36, min: 24, max: 60, step: 2, unit: '"' },
      { key: 'topThickness', label: 'Top Thickness', default: 1.25, min: 0.75, max: 2.5, step: 0.25, unit: '"' },
      { key: 'legWidth', label: 'Leg Width', default: 2.5, min: 1.5, max: 4, step: 0.25, unit: '"' },
    ],
    subcategories: ['Rectangular', 'Round', 'Oval', 'Extendable', 'Conference'],
    templates: ['Metric Generic Model', 'Table - Dining Rectangular', 'Table - Round', 'Table - Conference'],
  },
  {
    id: 'office-desk',
    name: 'Office Desk',
    description: 'Work surfaces for office environments with integrated storage and cable management.',
    revitCategory: 'Furniture',
    omniClass: '23-21 11 23',
    uniclass: 'Pr_40_70_73_25',
    ifcEntity: 'IfcFurniture',
    suggestedTemplate: 'Metric Generic Model',
    analysisSteps: [
      'Detecting work surface...',
      'Analyzing storage components...',
      'Identifying modesty panel...',
      'Measuring cable management...',
      'Detecting grommet positions...',
      'Computing workstation envelope...',
    ],
    components: [
      { name: 'Work Surface', detected: true, confidence: 97 },
      { name: 'Side Panels', detected: true, confidence: 91 },
      { name: 'Modesty Panel', detected: true, confidence: 85 },
      { name: 'Drawer Pedestal', detected: false, confidence: 42 },
      { name: 'Cable Tray', detected: false, confidence: 30 },
      { name: 'Grommets', detected: true, confidence: 78 },
    ],
    detections: [
      { id: 'top', label: 'Work Surface', confidence: 97, x: 5, y: 15, width: 90, height: 15 },
      { id: 'panel-l', label: 'Left Panel', confidence: 91, x: 3, y: 28, width: 8, height: 60 },
      { id: 'panel-r', label: 'Right Panel', confidence: 91, x: 89, y: 28, width: 8, height: 60 },
      { id: 'modesty', label: 'Modesty Panel', confidence: 85, x: 12, y: 35, width: 76, height: 40 },
    ],
    dimensions: [
      { key: 'deskHeight', label: 'Desk Height', default: 29, min: 27, max: 48, step: 0.5, unit: '"' },
      { key: 'deskWidth', label: 'Desk Width', default: 60, min: 42, max: 84, step: 2, unit: '"' },
      { key: 'deskDepth', label: 'Desk Depth', default: 30, min: 24, max: 36, step: 1, unit: '"' },
      { key: 'modestyHeight', label: 'Modesty Height', default: 12, min: 8, max: 18, step: 1, unit: '"' },
      { key: 'topThickness', label: 'Top Thickness', default: 1, min: 0.75, max: 1.5, step: 0.25, unit: '"' },
    ],
    subcategories: ['L-Desk', 'U-Desk', 'Straight Desk', 'Sit-Stand', 'Corner Desk'],
    templates: ['Metric Generic Model', 'Desk - Straight', 'Desk - L Shape', 'Desk - Sit Stand'],
  },
  {
    id: 'storage-cabinet',
    name: 'Storage Cabinet',
    description: 'Enclosed storage units with shelves, drawers, or doors for office and residential use.',
    revitCategory: 'Furniture',
    omniClass: '23-21 11 31',
    uniclass: 'Pr_40_70_73_13',
    ifcEntity: 'IfcFurniture',
    suggestedTemplate: 'Metric Generic Model',
    analysisSteps: [
      'Detecting cabinet body...',
      'Analyzing door configuration...',
      'Identifying shelf positions...',
      'Measuring hardware locations...',
      'Detecting toe kick...',
      'Computing internal volume...',
    ],
    components: [
      { name: 'Cabinet Body', detected: true, confidence: 96 },
      { name: 'Doors', detected: true, confidence: 93 },
      { name: 'Door Handles', detected: true, confidence: 89 },
      { name: 'Internal Shelves', detected: true, confidence: 82 },
      { name: 'Toe Kick', detected: true, confidence: 87 },
      { name: 'Back Panel', detected: false, confidence: 45 },
    ],
    detections: [
      { id: 'body', label: 'Cabinet Body', confidence: 96, x: 10, y: 5, width: 80, height: 80 },
      { id: 'door-l', label: 'Left Door', confidence: 93, x: 12, y: 8, width: 38, height: 72 },
      { id: 'door-r', label: 'Right Door', confidence: 93, x: 52, y: 8, width: 38, height: 72 },
      { id: 'toe', label: 'Toe Kick', confidence: 87, x: 12, y: 86, width: 76, height: 10 },
    ],
    dimensions: [
      { key: 'cabinetHeight', label: 'Cabinet Height', default: 42, min: 24, max: 84, step: 2, unit: '"' },
      { key: 'cabinetWidth', label: 'Cabinet Width', default: 36, min: 18, max: 48, step: 2, unit: '"' },
      { key: 'cabinetDepth', label: 'Cabinet Depth', default: 18, min: 12, max: 24, step: 1, unit: '"' },
      { key: 'toeKickHeight', label: 'Toe Kick Height', default: 4, min: 3, max: 6, step: 0.5, unit: '"' },
      { key: 'shelfSpacing', label: 'Shelf Spacing', default: 12, min: 8, max: 18, step: 1, unit: '"' },
    ],
    subcategories: ['Lateral File', 'Bookcase', 'Wardrobe', 'Credenza', 'Storage Tower'],
    templates: ['Metric Generic Model', 'Cabinet - Lateral File', 'Cabinet - Storage', 'Bookcase'],
  },
  {
    id: 'pendant-light',
    name: 'Pendant Light',
    description: 'Suspended light fixtures for ambient and task lighting in commercial and residential spaces.',
    revitCategory: 'Lighting Fixtures',
    omniClass: '23-35 47 11',
    uniclass: 'Pr_60_60_38_62',
    ifcEntity: 'IfcLightFixture',
    suggestedTemplate: 'Metric Lighting Fixture',
    analysisSteps: [
      'Detecting shade geometry...',
      'Analyzing suspension system...',
      'Identifying canopy mount...',
      'Measuring luminaire dimensions...',
      'Detecting light source type...',
      'Computing light distribution...',
    ],
    components: [
      { name: 'Shade / Diffuser', detected: true, confidence: 95 },
      { name: 'Suspension Rod', detected: true, confidence: 92 },
      { name: 'Canopy Mount', detected: true, confidence: 88 },
      { name: 'Light Source', detected: true, confidence: 90 },
      { name: 'Socket / Holder', detected: false, confidence: 50 },
    ],
    detections: [
      { id: 'shade', label: 'Shade', confidence: 95, x: 15, y: 50, width: 70, height: 40 },
      { id: 'rod', label: 'Suspension', confidence: 92, x: 45, y: 10, width: 10, height: 45 },
      { id: 'canopy', label: 'Canopy', confidence: 88, x: 38, y: 2, width: 24, height: 12 },
      { id: 'bulb', label: 'Light Source', confidence: 90, x: 35, y: 60, width: 30, height: 20 },
    ],
    dimensions: [
      { key: 'fixtureDiameter', label: 'Fixture Diameter', default: 18, min: 6, max: 36, step: 1, unit: '"' },
      { key: 'fixtureHeight', label: 'Fixture Height', default: 14, min: 6, max: 30, step: 1, unit: '"' },
      { key: 'suspensionLength', label: 'Suspension Length', default: 36, min: 12, max: 72, step: 2, unit: '"' },
      { key: 'canopyDiameter', label: 'Canopy Diameter', default: 5, min: 3, max: 8, step: 0.5, unit: '"' },
    ],
    subcategories: ['Drum Pendant', 'Globe Pendant', 'Linear Pendant', 'Mini Pendant', 'Multi-Light'],
    templates: ['Metric Lighting Fixture', 'Pendant - Drum', 'Pendant - Globe', 'Pendant - Linear'],
  },
]
