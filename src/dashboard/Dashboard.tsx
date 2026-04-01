import { useEffect, useRef, useState } from 'react'
import { navItems, type ViewId } from './data'
import { MobileNav, Sidebar } from './components'
import { areaPath, createChartPoints, linePath } from './helpers'
import Icon from './Icon'

const viewCopy: Record<ViewId, { title: string; subtitle: string }> = {
  'client-data': {
    title: 'CSV Data',
    subtitle: 'Manual CSV uploads, mapped records, and file-based revenue performance.',
  },
  'api-data': {
    title: 'Adscribe Data',
    subtitle: 'Live synced Adscribe revenue, order activity, and connected source performance.',
  },
}

const clientOptions = ['Client 1', 'Client 2', 'Client 3'] as const

type ClientOption = (typeof clientOptions)[number]
type SourceKey = 'adscribe' | 'csv'

const sourceSections: Record<
  SourceKey,
  {
    title: string
    subtitle: string
    accent: string
    accentSoft: string
    label: string
    defaults: { client: ClientOption; startDate: string; endDate: string }
    clients: Record<
      ClientOption,
      {
        metrics: Array<[string, string]>
        trendSeries: readonly number[]
        items: Array<[string, string]>
      }
    >
  }
> = {
  adscribe: {
    title: 'Adscribe Data',
    subtitle: 'Live synced performance and monetization directly from Adscribe.',
    accent: '#004bca',
    accentSoft: '#eef3ff',
    label: 'Adscribe',
    defaults: {
      client: 'Client 1',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
    },
    clients: {
      'Client 1': {
        metrics: [
          ['Revenue', '$52.6K'],
          ['Orders', '742'],
          ['Status', 'Live Sync'],
        ],
        trendSeries: [18, 24, 21, 35, 32, 44, 60],
        items: [
          ['Morning Pulse', 'Last synced 8 mins ago'],
          ['Finance Flow', 'Last synced 16 mins ago'],
          ['Tech Weekly', 'Retry resolved 21 mins ago'],
        ],
      },
      'Client 2': {
        metrics: [
          ['Revenue', '$24.8K'],
          ['Orders', '336'],
          ['Status', 'Live Sync'],
        ],
        trendSeries: [14, 19, 27, 25, 29, 37, 41],
        items: [
          ['Retail Burst', 'Last synced 6 mins ago'],
          ['Weekend Deals', 'Last synced 13 mins ago'],
          ['Spring Push', 'Last synced 24 mins ago'],
        ],
      },
      'Client 3': {
        metrics: [
          ['Revenue', '$63.9K'],
          ['Orders', '901'],
          ['Status', 'Live Sync'],
        ],
        trendSeries: [20, 28, 30, 38, 42, 48, 57],
        items: [
          ['Daily Roundup', 'Last synced 5 mins ago'],
          ['Late Night Promo', 'Last synced 11 mins ago'],
          ['Design Diaries', 'Last synced 19 mins ago'],
        ],
      },
    },
  },
  csv: {
    title: 'CSV Data',
    subtitle: 'Manual file uploads mapped into the reporting workspace.',
    accent: '#2563eb',
    accentSoft: '#f4f7ff',
    label: 'CSV',
    defaults: {
      client: 'Client 1',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
    },
    clients: {
      'Client 1': {
        metrics: [
          ['Revenue', '$31.6K'],
          ['Orders', '545'],
          ['Status', 'Batch Ready'],
        ],
        trendSeries: [10, 16, 18, 22, 27, 25, 33],
        items: [
          ['October Client Batch.csv', 'Uploaded 12 mins ago'],
          ['Retail_Podcast_Orders.xlsx', 'Uploaded 38 mins ago'],
          ['Northstar_Apr_Q2.csv', 'Uploaded 1 hr ago'],
        ],
      },
      'Client 2': {
        metrics: [
          ['Revenue', '$37.0K'],
          ['Orders', '598'],
          ['Status', 'Batch Ready'],
        ],
        trendSeries: [13, 18, 24, 23, 27, 34, 39],
        items: [
          ['Client2_Weekly_Upload.csv', 'Uploaded 6 mins ago'],
          ['Client2_Backfill_Q4.xlsx', 'Uploaded 29 mins ago'],
          ['Regional_Sales_Import.csv', 'Uploaded 52 mins ago'],
        ],
      },
      'Client 3': {
        metrics: [
          ['Revenue', '$29.6K'],
          ['Orders', '561'],
          ['Status', 'Batch Ready'],
        ],
        trendSeries: [11, 15, 17, 24, 28, 26, 31],
        items: [
          ['Client3_Live_Recon.csv', 'Uploaded 9 mins ago'],
          ['April_Adjustments.xlsx', 'Uploaded 41 mins ago'],
          ['Broadcast_Returns.csv', 'Uploaded 1 hr ago'],
        ],
      },
    },
  },
}

function Dashboard() {
  const [activeView, setActiveView] = useState<ViewId>('client-data')
  const activeNavLabel = navItems.find((item) => item.id === activeView)?.label ?? 'CSV Data'
  const activeCopy = viewCopy[activeView]

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface text-ink">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-0 h-80 w-80 rounded-full bg-primary-soft/60 blur-3xl" />
        <div className="absolute right-0 top-32 h-[28rem] w-[28rem] rounded-full bg-surface-highest blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1720px]">
        <Sidebar activeView={activeView} onChangeView={setActiveView} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 bg-surface/75 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1360px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:px-10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-[2.4rem]">
                      {activeCopy.title}
                    </h1>
                    <span className="inline-flex items-center gap-2 rounded-full bg-surface-panel px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-muted">
                      <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_0_4px_rgba(22,154,90,0.12)]" />
                      {activeNavLabel}
                    </span>
                  </div>
                  <p className="max-w-2xl text-sm text-muted sm:text-[0.95rem]">
                    {activeCopy.subtitle}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-surface-card px-4 py-2 text-sm font-semibold text-primary shadow-ambient ring-1 ring-white/80 transition hover:-translate-y-0.5"
                  >
                    <Icon name="refresh" className="size-4" />
                    Refresh Data
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#004bca_0%,#0061ff_100%)] px-5 py-2 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(0,75,202,0.22)] transition hover:-translate-y-0.5"
                  >
                    <Icon name="download" className="size-4" />
                    Export Report
                  </button>
                  <button
                    type="button"
                    className="inline-flex size-10 items-center justify-center rounded-full bg-surface-card text-muted shadow-ambient ring-1 ring-white/80 transition hover:text-ink"
                    aria-label="Notifications"
                  >
                    <Icon name="bell" className="size-5" />
                  </button>
                </div>
              </div>

              <MobileNav activeView={activeView} onChangeView={setActiveView} />
            </div>
          </header>

          <main className="flex-1 px-4 pb-10 sm:px-6 lg:px-8 xl:px-10">
            <div className="mx-auto max-w-[1360px] space-y-6 pt-2 sm:space-y-8 sm:pt-4">
              {activeView === 'client-data' ? (
                <SourceSectionView source="csv" />
              ) : null}

              {activeView === 'api-data' ? (
                <SourceSectionView source="adscribe" />
              ) : null}

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function SourceSectionView({ source }: { source: SourceKey }) {
  const config = sourceSections[source]
  const [filters, setFilters] = useState(config.defaults)
  const currentClient = config.clients[filters.client]
  const [animatedSeries, setAnimatedSeries] = useState<number[]>([
    ...currentClient.trendSeries,
  ])
  const previousSeriesRef = useRef<number[]>([...currentClient.trendSeries])

  useEffect(() => {
    const fromSeries = previousSeriesRef.current
    const toSeries = [...currentClient.trendSeries]

    if (fromSeries.every((value, index) => value === toSeries[index])) {
      return
    }

    const durationMs = 850
    const startTime = performance.now()
    let frameId = 0

    const tick = (now: number) => {
      const elapsed = Math.min((now - startTime) / durationMs, 1)
      const eased = 1 - Math.pow(1 - elapsed, 3)

      setAnimatedSeries(
        toSeries.map((target, index) => {
          const from = fromSeries[index] ?? target
          return from + (target - from) * eased
        }),
      )

      if (elapsed < 1) {
        frameId = requestAnimationFrame(tick)
        return
      }

      previousSeriesRef.current = toSeries
    }

    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
  }, [currentClient.trendSeries, filters.client])

  const trendPoints = createChartPoints(animatedSeries, 620, 220, 22)

  const updateFilter = (
    field: 'client' | 'startDate' | 'endDate',
    value: string,
  ) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }))
  }

  return (
    <article className="rounded-[30px] bg-surface-card p-5 shadow-ambient ring-1 ring-white/80 sm:p-6">
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-muted">
            Source Section
          </p>
          <div className="mt-2 flex items-center gap-3">
            <h2 className="font-display text-[1.8rem] font-extrabold tracking-[-0.03em] text-ink">
              {config.title}
            </h2>
            <span
              className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
              style={{ backgroundColor: config.accent }}
            >
              {config.label}
            </span>
          </div>
          <p className="mt-2 max-w-xl text-sm text-muted">{config.subtitle}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="rounded-[22px] bg-surface-low px-4 py-3">
            <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted">
              Client
            </span>
            <select
              value={filters.client}
              onChange={(event) => updateFilter('client', event.target.value)}
              className="mt-2 w-full bg-transparent text-sm font-semibold text-ink outline-none"
            >
              {clientOptions.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </label>

          <label className="rounded-[22px] bg-surface-low px-4 py-3">
            <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted">
              Start Date
            </span>
            <input
              type="date"
              value={filters.startDate}
              onChange={(event) => updateFilter('startDate', event.target.value)}
              className="mt-2 w-full bg-transparent text-sm font-semibold text-ink outline-none"
            />
          </label>

          <label className="rounded-[22px] bg-surface-low px-4 py-3">
            <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted">
              End Date
            </span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(event) => updateFilter('endDate', event.target.value)}
              className="mt-2 w-full bg-transparent text-sm font-semibold text-ink outline-none"
            />
          </label>
        </div>

        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {currentClient.metrics.map(([label, value]) => (
              <div
                key={label}
                className="rounded-[22px] px-4 py-4"
                style={{ backgroundColor: config.accentSoft }}
              >
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted">
                  {label}
                </p>
                <p className="mt-2 text-lg font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>

          <div
            className="rounded-[26px] px-4 pt-5 sm:px-5"
            style={{ backgroundColor: config.accentSoft }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-extrabold tracking-[-0.03em] text-ink">
                  Revenue Trend
                </h3>
                <p className="mt-1 text-sm text-muted">
                  Revenue trend for {filters.client.toLowerCase()} between {filters.startDate} and {filters.endDate}.
                </p>
              </div>
              <span
                className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
                style={{ backgroundColor: config.accent }}
              >
                Trend
              </span>
            </div>

            <svg
              viewBox="0 0 620 220"
              key={`${source}-${filters.client}`}
              className="mt-5 h-[250px] w-full"
              role="img"
              aria-label={`${config.title} revenue trend`}
            >
              <defs>
                <linearGradient id={`fill-${source}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={config.accent} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={config.accent} stopOpacity="0" />
                </linearGradient>
              </defs>
            <path d={areaPath(trendPoints, 220)} fill={`url(#fill-${source})`} />
            <path
              d={linePath(trendPoints)}
              fill="none"
              stroke={config.accent}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {trendPoints.map((point, index) => (
              <circle
                key={`${source}-point-${index + 1}`}
                cx={point.x}
                cy={point.y}
                r="4.5"
                fill="#ffffff"
                stroke={config.accent}
                strokeWidth="2.5"
              />
            ))}
          </svg>

            <div className="grid grid-cols-7 pb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              <span>Mar 01</span>
              <span>Mar 05</span>
              <span>Mar 10</span>
              <span>Mar 15</span>
              <span>Mar 20</span>
              <span>Mar 25</span>
              <span>Mar 31</span>
            </div>
          </div>

          <div className="rounded-[24px] bg-surface-low p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-lg font-extrabold tracking-[-0.03em] text-ink">
                Recent Activity
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                {currentClient.items.length} items
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {currentClient.items.map(([title, meta]) => (
                <div key={title} className="rounded-[18px] bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="mt-1 text-xs text-muted">{meta}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default Dashboard
