import { furnitureCategories, type FurnitureCategory } from '../data/furniture-categories'

export function analyzeImage(imageUrl: string): Promise<FurnitureCategory> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const s = 64
      canvas.width = s
      canvas.height = s
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, s, s)
      const data = ctx.getImageData(0, 0, s, s).data

      const ar = img.naturalWidth / img.naturalHeight
      const n = s * s
      let rSum = 0, gSum = 0, bSum = 0
      let warm = 0, dark = 0, bright = 0
      let topBr = 0, botBr = 0
      let centerMass = 0, edgeMass = 0

      for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
          const i = (y * s + x) * 4
          const r = data[i], g = data[i + 1], b = data[i + 2]
          rSum += r; gSum += g; bSum += b
          const br = (r + g + b) / 3
          if (br < 60) dark++
          if (br > 200) bright++
          if (r > b + 20 && r > 100) warm++
          if (y < s / 2) topBr += br; else botBr += br

          const dx = Math.abs(x - s / 2) / (s / 2)
          const dy = Math.abs(y - s / 2) / (s / 2)
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 0.5) centerMass += br; else edgeMass += br
        }
      }

      const avgBr = (rSum + gSum + bSum) / (n * 3)
      const warmR = warm / n
      const darkR = dark / n
      const brightR = bright / n
      const topAvg = topBr / (n / 2)
      const botAvg = botBr / (n / 2)
      const centerRatio = centerMass / (centerMass + edgeMass + 1)

      const sc: Record<string, number> = {}
      furnitureCategories.forEach(c => { sc[c.id] = 0 })

      if (ar > 1.6) {
        sc['sofa-lounge'] += 5
        sc['dining-table'] += 3
        sc['office-desk'] += 2
      } else if (ar > 1.2) {
        sc['dining-table'] += 3
        sc['office-desk'] += 3
        sc['sofa-lounge'] += 3
      } else if (ar > 0.85) {
        sc['office-chair'] += 3
        sc['storage-cabinet'] += 2
        sc['office-desk'] += 1
      } else {
        sc['storage-cabinet'] += 5
        sc['pendant-light'] += 3
      }

      if (warmR > 0.35) {
        sc['sofa-lounge'] += 4
        sc['dining-table'] += 2
      } else if (warmR > 0.2) {
        sc['dining-table'] += 2
        sc['sofa-lounge'] += 2
      }

      if (darkR > 0.5) {
        sc['office-chair'] += 3
        sc['storage-cabinet'] += 1
      }

      if (brightR > 0.35) {
        sc['pendant-light'] += 3
        sc['dining-table'] += 1
      }

      if (topAvg > botAvg + 30) {
        sc['pendant-light'] += 3
      }

      if (botAvg > topAvg + 20) {
        sc['dining-table'] += 1
        sc['office-chair'] += 1
      }

      if (avgBr > 120 && avgBr < 180 && warmR > 0.15) {
        sc['sofa-lounge'] += 3
      }

      if (centerRatio > 0.55) {
        sc['pendant-light'] += 2
        sc['office-chair'] += 1
      }

      let best = furnitureCategories[0]
      let bestScore = -1
      furnitureCategories.forEach(c => {
        if (sc[c.id] > bestScore) {
          bestScore = sc[c.id]
          best = c
        }
      })

      resolve(best)
    }
    img.onerror = () => resolve(furnitureCategories[0])
    img.src = imageUrl
  })
}
