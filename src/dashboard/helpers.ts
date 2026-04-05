export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function safeNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return fallback
}

export function safeDivide(dividend: unknown, divisor: unknown, fallback = 0) {
  const numerator = safeNumber(dividend)
  const denominator = safeNumber(divisor)

  if (denominator === 0) {
    return fallback
  }

  return numerator / denominator
}

export function formatCurrency(value: unknown, options?: Intl.NumberFormatOptions) {
  const amount = safeNumber(value)

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    ...options,
  }).format(amount)
}

export function formatNumber(value: unknown, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat('en-US', options).format(safeNumber(value))
}

export function formatPercent(value: unknown) {
  return `${safeNumber(value).toFixed(1)}%`
}

export function formatDateArray(
  value: unknown,
  options?: Intl.DateTimeFormatOptions,
) {
  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day] = value
    const safeYear = safeNumber(year, Number.NaN)
    const safeMonth = safeNumber(month, Number.NaN)
    const safeDay = safeNumber(day, Number.NaN)

    if (
      Number.isFinite(safeYear) &&
      Number.isFinite(safeMonth) &&
      Number.isFinite(safeDay)
    ) {
      const normalizedMonth = safeMonth <= 0 ? 1 : safeMonth
      const date = new Date(Date.UTC(safeYear, normalizedMonth - 1, safeDay))

      if (!Number.isNaN(date.getTime())) {
        if (options) {
          return new Intl.DateTimeFormat('en-US', {
            timeZone: 'UTC',
            ...options,
          }).format(date)
        }

        const yyyy = String(safeYear).padStart(4, '0')
        const mm = String(normalizedMonth).padStart(2, '0')
        const dd = String(safeDay).padStart(2, '0')

        return `${yyyy}-${mm}-${dd}`
      }
    }
  }

  if (typeof value === 'string' && value.trim()) {
    const date = new Date(value)

    if (!Number.isNaN(date.getTime())) {
      if (options) {
        return new Intl.DateTimeFormat('en-US', {
          timeZone: 'UTC',
          ...options,
        }).format(date)
      }

      return value
    }
  }

  return 'N/A'
}

export function toDisplayLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export type ChartDatum = {
  label: string
  value: number
}

export function createChartPoints(
  values: readonly number[],
  width = 700,
  height = 250,
  padding = 20,
) {
  if (values.length === 0) {
    return []
  }

  const max = Math.max(...values, 0) + 8
  const step = values.length === 1 ? 0 : (width - padding * 2) / (values.length - 1)

  return values.map((value, index) => {
    const x = padding + index * step
    const y = height - padding - (safeNumber(value) / max) * (height - padding * 2)

    return { x, y }
  })
}

export function linePath(points: Array<{ x: number; y: number }>) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
}

export function areaPath(points: Array<{ x: number; y: number }>, height: number) {
  if (points.length === 0) {
    return ''
  }

  const first = points[0]
  const last = points[points.length - 1]

  return `${linePath(points)} L ${last.x} ${height - 20} L ${first.x} ${height - 20} Z`
}
