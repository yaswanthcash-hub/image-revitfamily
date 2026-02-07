import type { Material } from './materials'

export interface IFCProjectInfo {
  name: string
  description?: string
  author?: string
  organization?: string
  phase?: string
}

export interface IFCGeometry {
  type: 'box' | 'cylinder' | 'extrusion' | 'brep' | 'mesh'
  dimensions: Record<string, number>
  position: [number, number, number]
  rotation?: [number, number, number]
  material?: string
}

export interface IFCElement {
  guid: string
  name: string
  description?: string
  ifcClass: string
  geometry: IFCGeometry[]
  properties: IFCPropertySet[]
  classification?: IFCClassification
  material?: IFCMaterial
}

export interface IFCPropertySet {
  name: string
  properties: Record<string, string | number | boolean>
}

export interface IFCClassification {
  system: string
  code: string
  name?: string
}

export interface IFCMaterial {
  name: string
  color?: string
  transparency?: number
}

export function generateGUID(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$'
  let guid = ''
  const uuid = crypto.randomUUID().replace(/-/g, '')
  const bytes = []

  for (let i = 0; i < 32; i += 2) {
    bytes.push(parseInt(uuid.substr(i, 2), 16))
  }

  for (let i = 0; i < 22; i++) {
    const idx = i * 6
    const byteIdx = Math.floor(idx / 8)
    const bitIdx = idx % 8

    let value = (bytes[byteIdx] || 0) >> (2 - bitIdx)
    if (bitIdx > 2 && byteIdx + 1 < bytes.length) {
      value |= (bytes[byteIdx + 1] << (8 - bitIdx))
    }
    value &= 0x3F

    guid += chars[value]
  }

  return guid
}

export function generateIFC(
  project: IFCProjectInfo,
  elements: IFCElement[],
  materials: Material[] = []
): string {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0]
  const projectGuid = generateGUID()
  const siteGuid = generateGUID()
  const buildingGuid = generateGUID()
  const storeyGuid = generateGUID()

  let entityId = 100
  const getNextId = () => `#${entityId++}`

  const lines: string[] = []

  lines.push('ISO-10303-21;')
  lines.push('HEADER;')
  lines.push(`FILE_DESCRIPTION(('ViewDefinition [CoordinationView_V2.0]'),'2;1');`)
  lines.push(`FILE_NAME('${project.name}.ifc','${timestamp}',('${project.author || 'Unknown'}'),('${project.organization || 'Unknown'}'),'IFC Generator 2.0','Revit Family Generator','');`)
  lines.push('FILE_SCHEMA((\'IFC4\'));')
  lines.push('ENDSEC;')
  lines.push('DATA;')

  const personId = getNextId()
  const orgId = getNextId()
  const personOrgId = getNextId()
  const appId = getNextId()
  const ownerHistoryId = getNextId()
  const directionZId = getNextId()
  const directionXId = getNextId()
  const originId = getNextId()
  const worldCoordId = getNextId()
  const contextId = getNextId()
  const projectId = getNextId()
  const siteId = getNextId()
  const buildingId = getNextId()
  const storeyId = getNextId()
  const sitePlacementId = getNextId()
  const buildingPlacementId = getNextId()
  const storeyPlacementId = getNextId()
  const unitAssignmentId = getNextId()

  lines.push(`${personId}=IFCPERSON($,'${project.author || 'Unknown'}',$,$,$,$,$,$);`)
  lines.push(`${orgId}=IFCORGANIZATION($,'${project.organization || 'Unknown'}',$,$,$);`)
  lines.push(`${personOrgId}=IFCPERSONANDORGANIZATION(${personId},${orgId},$);`)
  lines.push(`${appId}=IFCAPPLICATION(${orgId},'2.0','Revit Family Generator','RevitFamilyGen');`)
  lines.push(`${ownerHistoryId}=IFCOWNERHISTORY(${personOrgId},${appId},$,.NOCHANGE.,$,$,$,${Math.floor(Date.now() / 1000)});`)

  lines.push(`${directionZId}=IFCDIRECTION((0.,0.,1.));`)
  lines.push(`${directionXId}=IFCDIRECTION((1.,0.,0.));`)
  lines.push(`${originId}=IFCCARTESIANPOINT((0.,0.,0.));`)
  lines.push(`${worldCoordId}=IFCAXIS2PLACEMENT3D(${originId},${directionZId},${directionXId});`)
  lines.push(`${contextId}=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.0E-5,${worldCoordId},$);`)

  const lengthUnitId = getNextId()
  const areaUnitId = getNextId()
  const volumeUnitId = getNextId()
  const angleUnitId = getNextId()

  lines.push(`${lengthUnitId}=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);`)
  lines.push(`${areaUnitId}=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);`)
  lines.push(`${volumeUnitId}=IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.);`)
  lines.push(`${angleUnitId}=IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.);`)
  lines.push(`${unitAssignmentId}=IFCUNITASSIGNMENT((${lengthUnitId},${areaUnitId},${volumeUnitId},${angleUnitId}));`)

  lines.push(`${projectId}=IFCPROJECT('${projectGuid}',${ownerHistoryId},'${project.name}','${project.description || ''}',${project.phase ? `'${project.phase}'` : '$'},$,$,(${contextId}),${unitAssignmentId});`)

  lines.push(`${sitePlacementId}=IFCLOCALPLACEMENT($,${worldCoordId});`)
  lines.push(`${siteId}=IFCSITE('${siteGuid}',${ownerHistoryId},'Site',$,$,${sitePlacementId},$,$,.ELEMENT.,$,$,$,$,$);`)

  lines.push(`${buildingPlacementId}=IFCLOCALPLACEMENT(${sitePlacementId},${worldCoordId});`)
  lines.push(`${buildingId}=IFCBUILDING('${buildingGuid}',${ownerHistoryId},'Building',$,$,${buildingPlacementId},$,$,.ELEMENT.,$,$,$);`)

  lines.push(`${storeyPlacementId}=IFCLOCALPLACEMENT(${buildingPlacementId},${worldCoordId});`)
  lines.push(`${storeyId}=IFCBUILDINGSTOREY('${storeyGuid}',${ownerHistoryId},'Level 1',$,$,${storeyPlacementId},$,$,.ELEMENT.,0.);`)

  const relAggSiteId = getNextId()
  const relAggBuildingId = getNextId()
  const relAggStoreyId = getNextId()

  lines.push(`${relAggSiteId}=IFCRELAGGREGATES('${generateGUID()}',${ownerHistoryId},$,$,${projectId},(${siteId}));`)
  lines.push(`${relAggBuildingId}=IFCRELAGGREGATES('${generateGUID()}',${ownerHistoryId},$,$,${siteId},(${buildingId}));`)
  lines.push(`${relAggStoreyId}=IFCRELAGGREGATES('${generateGUID()}',${ownerHistoryId},$,$,${buildingId},(${storeyId}));`)

  const materialIds: Record<string, string> = {}
  for (const material of materials) {
    const matId = getNextId()
    const matColor = hexToRgb(material.appearance.color)

    const surfaceStyleId = getNextId()
    const renderingId = getNextId()

    lines.push(`${renderingId}=IFCSURFACESTYLERENDERING(IFCCOLOURRGB($,${matColor.r},${matColor.g},${matColor.b}),${material.appearance.opacity ?? 1},$,$,$,$,IFCNORMALISEDRATIOMEASURE(${1 - material.appearance.roughness}),$,.NOTDEFINED.);`)
    lines.push(`${surfaceStyleId}=IFCSURFACESTYLE('${material.name}',.BOTH.,(${renderingId}));`)
    lines.push(`${matId}=IFCMATERIAL('${material.name}',$,$);`)

    materialIds[material.id] = matId
  }

  const elementIds: string[] = []

  for (const element of elements) {
    const elementId = getNextId()
    elementIds.push(elementId)

    const placementId = getNextId()
    const shapRepId = getNextId()
    const productShapeId = getNextId()

    const geomIds: string[] = []

    for (const geom of element.geometry) {
      const geomId = generateGeometry(geom, lines, getNextId, contextId)
      geomIds.push(geomId)
    }

    const pos = element.geometry[0]?.position || [0, 0, 0]
    const localOriginId = getNextId()
    const localAxis2Id = getNextId()

    lines.push(`${localOriginId}=IFCCARTESIANPOINT((${pos[0] * 1000},${pos[1] * 1000},${pos[2] * 1000}));`)
    lines.push(`${localAxis2Id}=IFCAXIS2PLACEMENT3D(${localOriginId},$,$);`)
    lines.push(`${placementId}=IFCLOCALPLACEMENT(${storeyPlacementId},${localAxis2Id});`)

    lines.push(`${shapRepId}=IFCSHAPEREPRESENTATION(${contextId},'Body','SweptSolid',(${geomIds.join(',')}));`)
    lines.push(`${productShapeId}=IFCPRODUCTDEFINITIONSHAPE($,$,(${shapRepId}));`)

    lines.push(`${elementId}=${element.ifcClass}('${element.guid}',${ownerHistoryId},'${element.name}','${element.description || ''}',${element.ifcClass === 'IFCFURNISHINGELEMENT' ? "'FurnitureType'" : '$'},${placementId},${productShapeId},$);`)

    for (const propSet of element.properties) {
      const propSetId = getNextId()
      const propIds: string[] = []

      for (const [key, value] of Object.entries(propSet.properties)) {
        const propId = getNextId()
        if (typeof value === 'number') {
          lines.push(`${propId}=IFCPROPERTYSINGLEVALUE('${key}',$,IFCREAL(${value}),$);`)
        } else if (typeof value === 'boolean') {
          lines.push(`${propId}=IFCPROPERTYSINGLEVALUE('${key}',$,IFCBOOLEAN(.${value ? 'T' : 'F'}.),$);`)
        } else {
          lines.push(`${propId}=IFCPROPERTYSINGLEVALUE('${key}',$,IFCTEXT('${value}'),$);`)
        }
        propIds.push(propId)
      }

      lines.push(`${propSetId}=IFCPROPERTYSET('${generateGUID()}',${ownerHistoryId},'${propSet.name}',$,(${propIds.join(',')}));`)

      const relDefId = getNextId()
      lines.push(`${relDefId}=IFCRELDEFINESBYPROPERTIES('${generateGUID()}',${ownerHistoryId},$,$,(${elementId}),${propSetId});`)
    }

    if (element.classification) {
      const classRefId = getNextId()
      const classId = getNextId()
      const relClassId = getNextId()

      lines.push(`${classId}=IFCCLASSIFICATION($,$,$,'${element.classification.system}',$,$,$);`)
      lines.push(`${classRefId}=IFCCLASSIFICATIONREFERENCE($,'${element.classification.code}','${element.classification.name || ''}',${classId},$,$);`)
      lines.push(`${relClassId}=IFCRELASSOCIATESCLASSIFICATION('${generateGUID()}',${ownerHistoryId},$,$,(${elementId}),${classRefId});`)
    }
  }

  if (elementIds.length > 0) {
    const relContainedId = getNextId()
    lines.push(`${relContainedId}=IFCRELCONTAINEDINSPATIALSTRUCTURE('${generateGUID()}',${ownerHistoryId},$,$,(${elementIds.join(',')}),${storeyId});`)
  }

  lines.push('ENDSEC;')
  lines.push('END-ISO-10303-21;')

  return lines.join('\n')
}

function generateGeometry(
  geom: IFCGeometry,
  lines: string[],
  getNextId: () => string,
  _contextId: string
): string {
  const { type, dimensions } = geom

  if (type === 'box') {
    const width = (dimensions.width || 1) * 25.4
    const height = (dimensions.height || 1) * 25.4
    const depth = (dimensions.depth || 1) * 25.4

    const profileId = getNextId()
    const positionId = getNextId()
    const directionId = getNextId()
    const extrusionId = getNextId()

    lines.push(`${positionId}=IFCAXIS2PLACEMENT2D(IFCCARTESIANPOINT((0.,0.)),$);`)
    lines.push(`${profileId}=IFCRECTANGLEPROFILEDEF(.AREA.,$,${positionId},${width},${depth});`)
    lines.push(`${directionId}=IFCDIRECTION((0.,0.,1.));`)
    lines.push(`${extrusionId}=IFCEXTRUDEDAREASOLID(${profileId},$,${directionId},${height});`)

    return extrusionId
  }

  if (type === 'cylinder') {
    const radius = (dimensions.radius || dimensions.diameter / 2 || 1) * 25.4
    const height = (dimensions.height || 1) * 25.4

    const profileId = getNextId()
    const positionId = getNextId()
    const directionId = getNextId()
    const extrusionId = getNextId()

    lines.push(`${positionId}=IFCAXIS2PLACEMENT2D(IFCCARTESIANPOINT((0.,0.)),$);`)
    lines.push(`${profileId}=IFCCIRCLEPROFILEDEF(.AREA.,$,${positionId},${radius});`)
    lines.push(`${directionId}=IFCDIRECTION((0.,0.,1.));`)
    lines.push(`${extrusionId}=IFCEXTRUDEDAREASOLID(${profileId},$,${directionId},${height});`)

    return extrusionId
  }

  const boxId = getNextId()
  lines.push(`${boxId}=IFCBLOCK(IFCAXIS2PLACEMENT3D(IFCCARTESIANPOINT((0.,0.,0.)),$,$),100.,100.,100.);`)
  return boxId
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    }
  }
  return { r: 0.5, g: 0.5, b: 0.5 }
}

export function createFurnitureElement(
  name: string,
  categoryId: string,
  dimensions: Record<string, number>,
  classification?: { omniClass?: string; uniclass?: string }
): IFCElement {
  const S = 25.4

  const geometry: IFCGeometry[] = []
  const properties: IFCPropertySet[] = []

  const dimProps: Record<string, number> = {}
  for (const [key, value] of Object.entries(dimensions)) {
    dimProps[formatPropertyName(key)] = value
  }

  properties.push({
    name: 'Pset_FurnitureTypeCommon',
    properties: dimProps
  })

  properties.push({
    name: 'Pset_ManufacturerTypeInformation',
    properties: {
      Manufacturer: 'Custom',
      ModelReference: name,
      ArticleNumber: generateGUID().substring(0, 8)
    }
  })

  if (categoryId.includes('chair')) {
    const seatWidth = dimensions.seatWidth || dimensions.overallWidth || 22
    const seatDepth = dimensions.seatDepth || dimensions.overallDepth || 21
    const seatHeight = dimensions.seatHeight || 17
    const backHeight = dimensions.backHeight || 20

    geometry.push({
      type: 'box',
      dimensions: { width: seatWidth, depth: seatDepth, height: 3 },
      position: [0, seatHeight * S / 1000, 0]
    })

    geometry.push({
      type: 'box',
      dimensions: { width: seatWidth, depth: 2, height: backHeight },
      position: [0, (seatHeight + backHeight / 2) * S / 1000, -seatDepth * S / 2000]
    })
  } else if (categoryId.includes('table') || categoryId.includes('desk')) {
    const width = dimensions.tableWidth || dimensions.deskWidth || dimensions.width || 60
    const depth = dimensions.tableDepth || dimensions.deskDepth || dimensions.depth || 30
    const height = dimensions.tableHeight || dimensions.deskHeight || dimensions.height || 30

    geometry.push({
      type: 'box',
      dimensions: { width, depth, height: 1.5 },
      position: [0, height * S / 1000, 0]
    })

    const legSize = 2
    const legPositions = [
      [-width / 2 + legSize, 0, -depth / 2 + legSize],
      [width / 2 - legSize, 0, -depth / 2 + legSize],
      [-width / 2 + legSize, 0, depth / 2 - legSize],
      [width / 2 - legSize, 0, depth / 2 - legSize]
    ]

    for (const pos of legPositions) {
      geometry.push({
        type: 'box',
        dimensions: { width: legSize, depth: legSize, height: height - 1.5 },
        position: [pos[0] * S / 1000, (height - 1.5) * S / 2000, pos[2] * S / 1000]
      })
    }
  } else {
    const width = dimensions.width || dimensions.overallWidth || 24
    const depth = dimensions.depth || dimensions.overallDepth || 24
    const height = dimensions.height || dimensions.overallHeight || 24

    geometry.push({
      type: 'box',
      dimensions: { width, depth, height },
      position: [0, height * S / 2000, 0]
    })
  }

  let ifcClassification: IFCClassification | undefined
  if (classification?.omniClass) {
    ifcClassification = {
      system: 'OmniClass',
      code: classification.omniClass,
      name: name
    }
  } else if (classification?.uniclass) {
    ifcClassification = {
      system: 'Uniclass 2015',
      code: classification.uniclass,
      name: name
    }
  }

  return {
    guid: generateGUID(),
    name,
    description: `Generated ${name} furniture element`,
    ifcClass: 'IFCFURNISHINGELEMENT',
    geometry,
    properties,
    classification: ifcClassification
  }
}

function formatPropertyName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

export function downloadIFC(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/x-step' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.ifc') ? filename : `${filename}.ifc`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
