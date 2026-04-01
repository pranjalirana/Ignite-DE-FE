import { useDeferredValue, useState } from 'react'
import {
  chartLabels,
  currentSeries,
  filters,
  kpiCards,
  navItems,
  previousSeries,
  sourceMix,
  transactions,
  type ViewId,
} from './data'
import { MiniMetric, MobileNav, KpiPanel, Sidebar, StatusPill } from './components'
import { areaPath, createChartPoints, linePath } from './helpers'
import Icon from './Icon'

const viewCopy: Record<ViewId, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Client Upload Data',
    subtitle: 'Manage, analyze your client upload dataset with a quick view of upload volume, revenue, and incoming records.',
  },
  'client-data': {
    title: 'Client Data',
    subtitle: 'Profiles, delivery health, and account performance across your portfolio.',
  },
  'api-data': {
    title: 'API (Adscribe) Data',
    subtitle: 'Editorial-grade monitoring for revenue, order sync, and client-side delivery performance.',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Controls for notifications, exports, and sync cadence.',
  },
}

function Dashboard() {
  const [activeView, setActiveView] = useState<ViewId>('dashboard')
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const query = deferredSearch.trim().toLowerCase()

  const filteredTransactions = transactions.filter((transaction) => {
    if (!query) {
      return true
    }

    return [transaction.client, transaction.show, transaction.date]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })

  const currentPoints = createChartPoints(currentSeries)
  const previousPoints = createChartPoints(previousSeries)
  const activeNavLabel = navItems.find((item) => item.id === activeView)?.label ?? 'API Data'
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
              {activeView === 'dashboard' ? (
                <DashboardOverview />
              ) : null}

              {activeView === 'client-data' ? (
                <ClientDataView />
              ) : null}

              {activeView === 'api-data' ? (
                <>
              <section className="rounded-[28px] bg-surface-card/80 p-4 shadow-ambient ring-1 ring-white/80 backdrop-blur-xl sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="flex items-center gap-3 text-muted">
                    <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-surface-panel text-primary">
                      <Icon name="filter" className="size-5" />
                    </span>
                    <div>
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em]">
                        Filters
                      </p>
                      <p className="text-sm">Snapshot controls for the live dashboard.</p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-wrap gap-3">
                    {filters.map((filter) => (
                      <button
                        key={filter.label}
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full bg-surface-panel px-4 py-2.5 text-left text-sm font-medium text-ink transition hover:bg-surface-high"
                      >
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                          {filter.label}
                        </span>
                        <span>{filter.value}</span>
                        <Icon name="chevron-down" className="size-4 text-muted" />
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="flex flex-col gap-4 rounded-[30px] bg-surface-panel p-5 shadow-ambient ring-1 ring-white/40 sm:flex-row sm:items-center sm:p-6">
                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-surface-card text-primary shadow-ambient">
                  <Icon name="spark" className="size-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink sm:text-[0.95rem]">
                    Insight:
                    <span className="font-bold"> Adscribe revenue increased 18%</span>
                    {' '}
                    after the API v3 update reached full sync stability.
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Current uplift is strongest across enterprise morning shows and finance categories.
                  </p>
                </div>
                <button type="button" className="text-sm font-bold text-primary">
                  View Details
                </button>
              </section>

              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {kpiCards.map((card) => (
                  <KpiPanel key={card.label} card={card} />
                ))}
              </section>

              <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
                <div className="rounded-[30px] bg-surface-card p-5 shadow-ambient ring-1 ring-white/80 sm:p-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-muted">
                        Performance Curve
                      </p>
                      <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.03em] text-ink">
                        Revenue Trends
                      </h2>
                      <p className="mt-2 text-sm text-muted">
                        Real-time API synchronized revenue compared with the previous window.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                        Current
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-outline-soft" />
                        Previous
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,rgba(229,238,255,0.58)_0%,rgba(255,255,255,0.92)_100%)] px-4 pb-5 pt-4 sm:px-6">
                    <svg
                      viewBox="0 0 700 250"
                      className="h-[260px] w-full"
                      role="img"
                      aria-label="Revenue trend chart"
                    >
                      <defs>
                        <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#004bca" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#004bca" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {[45, 95, 145, 195].map((y) => (
                        <line
                          key={y}
                          x1="10"
                          x2="690"
                          y1={y}
                          y2={y}
                          stroke="rgba(194,198,217,0.35)"
                          strokeDasharray="4 10"
                        />
                      ))}

                      <path d={areaPath(currentPoints, 250)} fill="url(#chart-fill)" />
                      <path
                        d={linePath(previousPoints)}
                        fill="none"
                        stroke="rgba(194,198,217,0.95)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d={linePath(currentPoints)}
                        fill="none"
                        stroke="#004bca"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {currentPoints.map((point, index) => (
                        <circle
                          key={chartLabels[index]}
                          cx={point.x}
                          cy={point.y}
                          r="5"
                          fill="#ffffff"
                          stroke="#004bca"
                          strokeWidth="3"
                        />
                      ))}
                    </svg>

                    <div className="mt-4 grid grid-cols-7 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted">
                      {chartLabels.map((label) => (
                        <span key={label}>{label}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[30px] bg-surface-card p-5 shadow-ambient ring-1 ring-white/80 sm:p-7">
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-muted">
                      Source Balance
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.03em] text-ink">
                      Source Mix
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      Orders grouped by the platforms feeding the API layer.
                    </p>

                    <div className="mt-7 space-y-5">
                      {sourceMix.map((item) => (
                        <div key={item.label} className="space-y-2.5">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium text-ink">{item.label}</span>
                            <span className="font-bold text-primary">{item.value}</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-surface-panel">
                            <div
                              className="h-full rounded-full bg-[linear-gradient(90deg,#004bca_0%,#2d79ff_100%)]"
                              style={{ width: item.width }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <MiniMetric
                      icon="flash"
                      label="Sync Health"
                      value="98.7%"
                      caption="Endpoint acknowledgements completed without delay."
                    />
                    <MiniMetric
                      icon="trend"
                      label="Throughput"
                      value="342/min"
                      caption="Peak order ingestion during the current reporting window."
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-[30px] bg-surface-card p-5 shadow-ambient ring-1 ring-white/80 sm:p-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-muted">
                      Transaction Stream
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.03em] text-ink">
                      Live Transaction Feed
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      Search the latest synchronized rows across clients and shows.
                    </p>
                  </div>

                  <label className="relative block w-full max-w-sm">
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted">
                      <Icon name="search" className="size-4" />
                    </span>
                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search show or client..."
                      className="w-full rounded-full bg-surface-panel py-3 pl-11 pr-4 text-sm text-ink outline-none ring-1 ring-transparent transition placeholder:text-muted focus:ring-primary/35"
                    />
                  </label>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2.5">
                    <thead>
                      <tr className="text-left text-[0.68rem] font-bold uppercase tracking-[0.22em] text-muted">
                        <th className="px-4 pb-2">Date</th>
                        <th className="px-4 pb-2">Client</th>
                        <th className="px-4 pb-2">Show</th>
                        <th className="px-4 pb-2">Revenue</th>
                        <th className="px-4 pb-2">Orders</th>
                        <th className="px-4 pb-2 text-center">API Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr key={`${transaction.date}-${transaction.show}`} className="group">
                          <td className="rounded-l-[22px] bg-surface-low px-4 py-4 text-sm font-medium text-ink transition group-hover:bg-surface-panel">
                            {transaction.date}
                          </td>
                          <td className="bg-surface-low px-4 py-4 text-sm font-medium text-muted transition group-hover:bg-surface-panel">
                            {transaction.client}
                          </td>
                          <td className="bg-surface-low px-4 py-4 text-sm font-semibold text-ink transition group-hover:bg-surface-panel">
                            {transaction.show}
                          </td>
                          <td className="bg-surface-low px-4 py-4 text-sm font-bold text-ink transition group-hover:bg-surface-panel">
                            {transaction.revenue}
                          </td>
                          <td className="bg-surface-low px-4 py-4 text-sm text-ink transition group-hover:bg-surface-panel">
                            {transaction.orders}
                          </td>
                          <td className="rounded-r-[22px] bg-surface-low px-4 py-4 text-center transition group-hover:bg-surface-panel">
                            <StatusPill status={transaction.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredTransactions.length === 0 ? (
                  <div className="mt-6 rounded-[24px] bg-surface-low px-5 py-10 text-center text-sm text-muted">
                    No transactions matched your search.
                  </div>
                ) : null}

                <div className="mt-5 flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Showing 1-{filteredTransactions.length} of {transactions.length} transactions
                  </span>
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex size-9 items-center justify-center rounded-full bg-surface-low text-muted"
                      aria-label="Previous page"
                    >
                      <Icon name="chevron-right" className="size-4 rotate-180" />
                    </button>
                    <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      1
                    </span>
                    <button
                      type="button"
                      className="inline-flex size-9 items-center justify-center rounded-full bg-surface-low text-sm font-semibold text-muted"
                    >
                      2
                    </button>
                    <button
                      type="button"
                      className="inline-flex size-9 items-center justify-center rounded-full bg-surface-low text-sm font-semibold text-muted"
                    >
                      3
                    </button>
                    <button
                      type="button"
                      className="inline-flex size-9 items-center justify-center rounded-full bg-surface-low text-muted"
                      aria-label="Next page"
                    >
                      <Icon name="chevron-right" className="size-4" />
                    </button>
                  </div>
                </div>
              </section>
                </>
              ) : null}

              {activeView === 'settings' ? (
                <SettingsView />
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function DashboardOverview() {
  const trendPoints = createChartPoints([18, 24, 21, 35, 32, 44, 60], 620, 220, 22)
  const volumePoints = createChartPoints([8, 15, 13, 19, 27, 26, 31], 360, 190, 18)
  const uploadItems = [
    ['October Client Batch.csv', 'Uploaded 12 mins ago', 'Ready'],
    ['Retail_Podcast_Orders.xlsx', 'Uploaded 38 mins ago', 'Processing'],
    ['Northstar_Apr_Q2.csv', 'Uploaded 1 hr ago', 'Ready'],
  ]
  const statCards = [
    ['Total Revenue', '$84.2K'],
    ['Total Orders', '1,287'],
    ['Impressions', '2.4M'],
    ['Rev. Per Order', '$65.46'],
  ]

  return (
    <>
      <section className="flex items-start justify-end">
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-xl bg-surface-card text-muted shadow-ambient ring-1 ring-white/80"
          aria-label="Open date controls"
        >
          <Icon name="filter" className="size-4" />
        </button>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_320px]">
        <div className="space-y-5">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map(([label, value]) => (
              <article
                key={label}
                className="rounded-[24px] bg-surface-card px-5 py-5 shadow-ambient ring-1 ring-white/80"
              >
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.22em] text-muted">
                  {label}
                </p>
                <p className="mt-4 font-display text-[2rem] font-extrabold tracking-[-0.04em] text-ink">
                  {value}
                </p>
              </article>
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_300px]">
            <article className="rounded-[28px] bg-surface-card p-5 shadow-ambient ring-1 ring-white/80 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-extrabold tracking-[-0.03em] text-ink">
                    Revenue Trends
                  </h2>
                  <p className="mt-1 max-w-lg text-sm text-muted">
                    Daily performance pattern for uploaded records and synced monetization.
                  </p>
                </div>
                <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[11px] font-semibold text-primary">
                  Daily
                </span>
              </div>

              <div className="mt-6 overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#f9fbff_0%,#eef3ff_100%)] px-4 pt-6">
                <svg viewBox="0 0 620 220" className="h-[260px] w-full" role="img" aria-label="Revenue trend">
                  <defs>
                    <linearGradient id="dashboard-trend-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#dbe4ff" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#dbe4ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath(trendPoints, 220)} fill="url(#dashboard-trend-fill)" />
                  <path
                    d={linePath(trendPoints)}
                    fill="none"
                    stroke="#c9d6fb"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={linePath(trendPoints)}
                    fill="none"
                    stroke="#9fb5ef"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="grid grid-cols-7 pb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                  <span>Oct 01</span>
                  <span>Oct 05</span>
                  <span>Oct 09</span>
                  <span>Oct 13</span>
                  <span>Oct 17</span>
                  <span>Oct 21</span>
                  <span>Oct 24</span>
                </div>
              </div>
            </article>

            <article className="rounded-[28px] bg-[#eef4ff] p-5 shadow-ambient ring-1 ring-white/80 sm:p-6">
              <h2 className="font-display text-xl font-extrabold tracking-[-0.03em] text-ink">
                Order Volume by Source
              </h2>
              <p className="mt-1 text-sm text-muted">
                Total orders distributed by upload source.
              </p>

              <div className="mt-6 rounded-[22px] bg-surface-card px-4 py-5">
                <svg viewBox="0 0 360 190" className="h-[210px] w-full" role="img" aria-label="Order volume chart">
                  {[40, 85, 130].map((y) => (
                    <line
                      key={y}
                      x1="12"
                      x2="348"
                      y1={y}
                      y2={y}
                      stroke="rgba(194,198,217,0.4)"
                      strokeDasharray="4 8"
                    />
                  ))}
                  {[0, 1, 2, 3, 4, 5, 6].map((index) => {
                    const point = volumePoints[index]
                    return (
                      <rect
                        key={index}
                        x={point.x - 14}
                        y={point.y}
                        width="28"
                        height={172 - point.y}
                        rx="8"
                        fill={index === 6 ? '#004bca' : '#bfd0fb'}
                      />
                    )
                  })}
                </svg>
                <div className="mt-2 grid grid-cols-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                  <span>API</span>
                  <span>CSV</span>
                  <span>XLS</span>
                  <span>FTP</span>
                  <span>ZIP</span>
                  <span>XML</span>
                  <span>JSON</span>
                </div>
              </div>
            </article>
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_300px]">
            <article className="rounded-[28px] bg-surface-card p-5 shadow-ambient ring-1 ring-white/80 sm:p-6">
              <h2 className="font-display text-xl font-extrabold tracking-[-0.03em] text-ink">
                Recent Data Uploads
              </h2>
              <p className="mt-1 text-sm text-muted">
                Detailed view of the latest individual upload transactions and incoming records.
              </p>

              <div className="mt-6 space-y-3">
                {uploadItems.map(([name, meta, status]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between gap-4 rounded-[22px] bg-surface-low px-4 py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">{name}</p>
                      <p className="mt-1 text-xs text-muted">{meta}</p>
                    </div>
                    <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[28px] bg-[#eef4ff] p-5 shadow-ambient ring-1 ring-white/80 sm:p-6">
              <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-surface-card text-primary shadow-ambient">
                <Icon name="database" className="size-5" />
              </div>
              <h2 className="mt-5 font-display text-xl font-extrabold tracking-[-0.03em] text-ink">
                More data coming soon...
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                We&apos;re processing the remaining upload files in 24 uploads queue. New records will appear here automatically.
              </p>
            </article>
          </section>
        </div>

        <aside className="space-y-5">
          <article className="rounded-[28px] bg-surface-card p-5 shadow-ambient ring-1 ring-white/80 sm:p-6">
            <p className="text-[0.64rem] font-bold uppercase tracking-[0.22em] text-muted">
              Upload Health
            </p>
            <p className="mt-3 font-display text-[2.1rem] font-extrabold tracking-[-0.04em] text-ink">
              97.8%
            </p>
            <p className="mt-2 text-sm text-muted">
              Successful upload validations completed automatically across the latest batch.
            </p>
          </article>

          <article className="rounded-[28px] bg-surface-card p-5 shadow-ambient ring-1 ring-white/80 sm:p-6">
            <p className="text-[0.64rem] font-bold uppercase tracking-[0.22em] text-muted">
              Avg. Upload Velocity
            </p>
            <p className="mt-3 font-display text-[2.1rem] font-extrabold tracking-[-0.04em] text-ink">
              14/min
            </p>
            <p className="mt-2 text-sm text-muted">
              Average upload acceptance rate across all active sources this morning.
            </p>
          </article>
        </aside>
      </section>
    </>
  )
}

function ClientDataView() {
  const clients = [
    ['Enterprise A', 'Prime', '$54.2K', '99.1%'],
    ['Global Media Corp', 'Growing', '$28.6K', '98.4%'],
    ['Luxe Living', 'Stable', '$12.9K', '97.8%'],
    ['Northstar Studios', 'Watch', '$18.4K', '96.9%'],
  ]

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric icon="layers" label="Active Clients" value="26" caption="Accounts currently feeding data into the reporting layer." />
        <MiniMetric icon="trend" label="Avg. Growth" value="+12.6%" caption="Median week-over-week client revenue change." />
        <MiniMetric icon="flash" label="Healthy Syncs" value="24" caption="Clients with no active retry or schema issues." />
        <MiniMetric icon="analytics" label="Top Vertical" value="Finance" caption="Highest revenue contribution during the latest window." />
      </section>

      <section className="rounded-[30px] bg-surface-card p-5 shadow-ambient ring-1 ring-white/80 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-muted">Client Accounts</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.03em] text-ink">
              Portfolio Snapshot
            </h2>
          </div>
          <span className="rounded-full bg-surface-panel px-4 py-2 text-sm font-semibold text-primary">
            4 priority clients
          </span>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2.5">
            <thead>
              <tr className="text-left text-[0.68rem] font-bold uppercase tracking-[0.22em] text-muted">
                <th className="px-4 pb-2">Client</th>
                <th className="px-4 pb-2">Tier</th>
                <th className="px-4 pb-2">Revenue</th>
                <th className="px-4 pb-2">Sync Health</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(([name, tier, revenue, health]) => (
                <tr key={name}>
                  <td className="rounded-l-[22px] bg-surface-low px-4 py-4 text-sm font-semibold text-ink">{name}</td>
                  <td className="bg-surface-low px-4 py-4 text-sm text-muted">{tier}</td>
                  <td className="bg-surface-low px-4 py-4 text-sm font-bold text-ink">{revenue}</td>
                  <td className="rounded-r-[22px] bg-surface-low px-4 py-4 text-sm font-semibold text-primary">{health}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function SettingsView() {
  const settings = [
    ['Sync refresh cadence', 'Every 5 minutes'],
    ['Report export format', 'CSV + PDF summary'],
    ['Error alert channel', 'Email and in-app'],
    ['Timezone', 'Asia/Calcutta'],
  ]

  return (
    <section className="rounded-[30px] bg-surface-card p-5 shadow-ambient ring-1 ring-white/80 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-surface-panel text-primary">
          <Icon name="settings" className="size-6" />
        </span>
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-muted">Workspace Controls</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.03em] text-ink">
            System Preferences
          </h2>
        </div>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {settings.map(([label, value]) => (
          <div key={label} className="rounded-[24px] bg-surface-low p-5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-muted">{label}</p>
            <p className="mt-3 text-lg font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Dashboard
