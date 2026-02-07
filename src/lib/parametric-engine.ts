export interface Parameter {
  id: string
  name: string
  label: string
  value: number | string | boolean
  dataType: 'number' | 'text' | 'boolean' | 'angle' | 'material'
  group: 'Dimensions' | 'Identity' | 'Appearance' | 'Structural' | 'MEP' | 'Other'
  formula?: string
  min?: number
  max?: number
  unit?: string
  isInstance?: boolean
}

export interface Constraint {
  id: string
  name: string
  expression: string
  severity: 'error' | 'warning' | 'info'
  message?: string
}

export interface ValidationResult {
  valid: boolean
  errors: ConstraintViolation[]
  warnings: ConstraintViolation[]
  infos: ConstraintViolation[]
}

export interface ConstraintViolation {
  constraintId: string
  constraintName: string
  message: string
  affectedParameters: string[]
}

export interface DependencyNode {
  parameterId: string
  dependsOn: string[]
  dependents: string[]
}

const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  in: { in: 1, ft: 1/12, mm: 25.4, cm: 2.54, m: 0.0254 },
  ft: { in: 12, ft: 1, mm: 304.8, cm: 30.48, m: 0.3048 },
  mm: { in: 1/25.4, ft: 1/304.8, mm: 1, cm: 0.1, m: 0.001 },
  cm: { in: 1/2.54, ft: 1/30.48, mm: 10, cm: 1, m: 0.01 },
  m: { in: 39.3701, ft: 3.28084, mm: 1000, cm: 100, m: 1 }
}

export function convertUnit(value: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return value
  const conversions = UNIT_CONVERSIONS[fromUnit]
  if (!conversions || !conversions[toUnit]) {
    console.warn(`Unknown unit conversion: ${fromUnit} to ${toUnit}`)
    return value
  }
  return value * conversions[toUnit]
}

export function parseFormula(formula: string): { variables: string[], evaluate: (context: Record<string, number>) => number } {
  const variableRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g
  const reservedWords = ['Math', 'PI', 'E', 'abs', 'sqrt', 'pow', 'min', 'max', 'floor', 'ceil', 'round', 'sin', 'cos', 'tan', 'if', 'else', 'true', 'false']
  const variables: string[] = []
  let match
  while ((match = variableRegex.exec(formula)) !== null) {
    const varName = match[1]
    if (!reservedWords.includes(varName) && !variables.includes(varName)) {
      variables.push(varName)
    }
  }

  const evaluate = (context: Record<string, number>): number => {
    try {
      let processedFormula = formula
      for (const v of variables) {
        const value = context[v]
        if (value === undefined) {
          throw new Error(`Variable '${v}' not found in context`)
        }
        processedFormula = processedFormula.replace(new RegExp(`\\b${v}\\b`, 'g'), String(value))
      }
      processedFormula = processedFormula
        .replace(/\bPI\b/g, String(Math.PI))
        .replace(/\bE\b/g, String(Math.E))
        .replace(/\babs\(/g, 'Math.abs(')
        .replace(/\bsqrt\(/g, 'Math.sqrt(')
        .replace(/\bpow\(/g, 'Math.pow(')
        .replace(/\bmin\(/g, 'Math.min(')
        .replace(/\bmax\(/g, 'Math.max(')
        .replace(/\bfloor\(/g, 'Math.floor(')
        .replace(/\bceil\(/g, 'Math.ceil(')
        .replace(/\bround\(/g, 'Math.round(')
        .replace(/\bsin\(/g, 'Math.sin(')
        .replace(/\bcos\(/g, 'Math.cos(')
        .replace(/\btan\(/g, 'Math.tan(')

      const fn = new Function(`return ${processedFormula}`)
      return fn()
    } catch (err) {
      console.error('Formula evaluation error:', err)
      return 0
    }
  }

  return { variables, evaluate }
}

export function buildDependencyGraph(parameters: Parameter[]): Map<string, DependencyNode> {
  const graph = new Map<string, DependencyNode>()

  for (const param of parameters) {
    graph.set(param.name, {
      parameterId: param.id,
      dependsOn: [],
      dependents: []
    })
  }

  for (const param of parameters) {
    if (param.formula) {
      const { variables } = parseFormula(param.formula)
      const node = graph.get(param.name)!
      node.dependsOn = variables.filter(v => graph.has(v))

      for (const dep of node.dependsOn) {
        const depNode = graph.get(dep)
        if (depNode) {
          depNode.dependents.push(param.name)
        }
      }
    }
  }

  return graph
}

export function getEvaluationOrder(parameters: Parameter[]): string[] {
  const graph = buildDependencyGraph(parameters)
  const visited = new Set<string>()
  const order: string[] = []

  function visit(name: string, path: Set<string> = new Set()) {
    if (path.has(name)) {
      throw new Error(`Circular dependency detected: ${[...path, name].join(' -> ')}`)
    }
    if (visited.has(name)) return

    const node = graph.get(name)
    if (!node) return

    path.add(name)
    for (const dep of node.dependsOn) {
      visit(dep, new Set(path))
    }
    path.delete(name)

    visited.add(name)
    order.push(name)
  }

  for (const param of parameters) {
    visit(param.name)
  }

  return order
}

export function evaluateParameters(
  parameters: Parameter[],
  overrides: Record<string, number> = {}
): Record<string, number | string | boolean> {
  const order = getEvaluationOrder(parameters)
  const context: Record<string, number> = {}
  const results: Record<string, number | string | boolean> = {}

  const paramMap = new Map(parameters.map(p => [p.name, p]))

  for (const name of order) {
    const param = paramMap.get(name)
    if (!param) continue

    if (param.dataType !== 'number' && param.dataType !== 'angle') {
      results[name] = param.value
      continue
    }

    let value: number

    if (overrides[name] !== undefined) {
      value = overrides[name]
    } else if (param.formula) {
      const { evaluate } = parseFormula(param.formula)
      value = evaluate(context)
    } else {
      value = typeof param.value === 'number' ? param.value : 0
    }

    if (param.min !== undefined && value < param.min) {
      value = param.min
    }
    if (param.max !== undefined && value > param.max) {
      value = param.max
    }

    context[name] = value
    results[name] = value
  }

  return results
}

export function validateConstraints(
  constraints: Constraint[],
  parameterValues: Record<string, number | string | boolean>
): ValidationResult {
  const errors: ConstraintViolation[] = []
  const warnings: ConstraintViolation[] = []
  const infos: ConstraintViolation[] = []

  for (const constraint of constraints) {
    try {
      const { variables, evaluate } = parseFormula(constraint.expression)
      const numericContext: Record<string, number> = {}
      const affectedParameters: string[] = []

      for (const v of variables) {
        const value = parameterValues[v]
        if (typeof value === 'number') {
          numericContext[v] = value
          affectedParameters.push(v)
        } else if (typeof value === 'boolean') {
          numericContext[v] = value ? 1 : 0
          affectedParameters.push(v)
        }
      }

      const result = evaluate(numericContext)

      if (!result || result === 0) {
        const violation: ConstraintViolation = {
          constraintId: constraint.id,
          constraintName: constraint.name,
          message: constraint.message || `Constraint "${constraint.name}" violated`,
          affectedParameters
        }

        switch (constraint.severity) {
          case 'error':
            errors.push(violation)
            break
          case 'warning':
            warnings.push(violation)
            break
          case 'info':
            infos.push(violation)
            break
        }
      }
    } catch (err) {
      console.error(`Error evaluating constraint "${constraint.name}":`, err)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    infos
  }
}

export function generateTypeVariants(
  baseParameters: Parameter[],
  variantConfig: { name: string; multipliers: Record<string, number> }[]
): Record<string, Record<string, number>> {
  const variants: Record<string, Record<string, number>> = {}
  const baseValues = evaluateParameters(baseParameters) as Record<string, number>

  for (const config of variantConfig) {
    const variantValues: Record<string, number> = {}

    for (const [paramName, baseValue] of Object.entries(baseValues)) {
      if (typeof baseValue === 'number') {
        const multiplier = config.multipliers[paramName] ?? 1
        variantValues[paramName] = baseValue * multiplier
      }
    }

    variants[config.name] = variantValues
  }

  return variants
}

export const DEFAULT_VARIANTS = [
  { name: 'Small', multipliers: { width: 0.8, height: 0.9, depth: 0.8 } },
  { name: 'Standard', multipliers: {} },
  { name: 'Large', multipliers: { width: 1.2, height: 1.1, depth: 1.2 } },
  { name: 'Extra Large', multipliers: { width: 1.4, height: 1.2, depth: 1.4 } }
]

export function formatParameterValue(value: number, unit: string, precision = 2): string {
  const formatted = value.toFixed(precision).replace(/\.?0+$/, '')
  return `${formatted}${unit}`
}

export function suggestParameterRange(
  categoryId: string,
  parameterName: string
): { min: number; max: number; default: number } | null {
  const ranges: Record<string, Record<string, { min: number; max: number; default: number }>> = {
    'single-door': {
      width: { min: 24, max: 48, default: 36 },
      height: { min: 72, max: 96, default: 84 },
      thickness: { min: 1.375, max: 2.25, default: 1.75 }
    },
    'casement-window': {
      width: { min: 18, max: 60, default: 36 },
      height: { min: 24, max: 72, default: 48 },
      sillHeight: { min: 24, max: 48, default: 36 }
    },
    'accent-chair': {
      seatHeight: { min: 14, max: 20, default: 17 },
      seatWidth: { min: 18, max: 28, default: 22 },
      seatDepth: { min: 16, max: 24, default: 21 }
    },
    'office-desk': {
      deskHeight: { min: 26, max: 32, default: 29 },
      deskWidth: { min: 48, max: 84, default: 60 },
      deskDepth: { min: 24, max: 36, default: 30 }
    }
  }

  return ranges[categoryId]?.[parameterName] ?? null
}
