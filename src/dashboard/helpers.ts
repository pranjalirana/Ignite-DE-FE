export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function createChartPoints(
  values: number[],
  width = 700,
  height = 250,
  padding = 20,
) {
  const max = Math.max(...values) + 8
  const step = (width - padding * 2) / (values.length - 1)

  return values.map((value, index) => {
    const x = padding + index * step
    const y = height - padding - (value / max) * (height - padding * 2)

    return { x, y }
  })
}

export function linePath(points: Array<{ x: number; y: number }>) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
}

export function areaPath(points: Array<{ x: number; y: number }>, height: number) {
  const first = points[0]
  const last = points[points.length - 1]

  return `${linePath(points)} L ${last.x} ${height - 20} L ${first.x} ${height - 20} Z`
}
