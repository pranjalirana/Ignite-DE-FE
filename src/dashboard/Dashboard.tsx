import { useEffect, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type {
  AdscribeAnalyticsDetail,
  CsvAnalyticsResponse,
} from '../store/api/analyticsApi'
import {
  useGetAdscribeAnalyticsQuery,
  useGetCsvAnalyticsQuery,
} from '../store/api/analyticsApi'
import { navItems, type ViewId } from './data'
import {
  DashboardCard,
  EmptyState,
  ErrorState,
  LoadingState,
  MetricTile,
  MobileNav,
  Sidebar,
} from './components'
import {
  cx,
  formatCurrency,
  formatDateArray,
  formatNumber,
  formatPercent,
  safeDivide,
  safeNumber,
  toDisplayLabel,
} from './helpers'
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
  upload: {
    title: 'Upload',
    subtitle: 'Send client files through a presigned upload flow and push them directly to storage.',
  },
}

const csvClientOptions = ['alpha', 'beta', 'gamma'] as const
const uploadClientOptions = ['alpha', 'beta','gamma'] as const

type SourceKey = 'adscribe' | 'csv' | 'upload'

const sourceAppearance: Record<
  SourceKey,
  {
    title: string
    subtitle: string
    accent: string
    accentSoft: string
    label: string
  }
> = {
  adscribe: {
    title: 'Adscribe Data',
    subtitle: 'Live synced performance and monetization directly from Adscribe.',
    accent: '#004bca',
    accentSoft: '#eef3ff',
    label: 'Adscribe',
  },
  csv: {
    title: 'CSV Data',
    subtitle: 'Manual file uploads mapped into the reporting workspace.',
    accent: '#2563eb',
    accentSoft: '#f4f7ff',
    label: 'CSV',
  },
  upload: {
    title: 'Upload',
    subtitle: 'Request a presigned URL, then send the selected client file directly to S3.',
    accent: '#14532d',
    accentSoft: '#ecfdf3',
    label: 'Upload',
  },
}

const piePalette = ['#0f2d6b', '#1445a0', '#1d5fd0', '#2d76ee', '#5a97ff']

type NamedRevenueItem = {
  client?: string | null
  clientName?: string | null
  show?: string | null
  showName?: string | null
  revenue?: number | null
}

type ChartDatum = {
  label: string
  value: number
}

type TableColumn<T> = {
  key: keyof T
  label: string
  align?: 'left' | 'right'
  render?: (row: T) => string
}

type CsvDetailRow = {
  orderDate: string
  code: string
  orders: string
  revenue: string
  revenuePerOrder: string
}

type AdscribeDetailRow = Record<string, string>
type UploadUrlResponse = {
  presignedUrl?: string
  uploadUrl?: string
  url?: string
  fileKey?: string
  requiredHeaders?: Record<string, string>
}

function parseS3ErrorMessage(responseText: string) {
  const codeMatch = responseText.match(/<Code>(.*?)<\/Code>/)
  const messageMatch = responseText.match(/<Message>(.*?)<\/Message>/)

  if (!codeMatch && !messageMatch) {
    return responseText.trim()
  }

  const code = codeMatch?.[1]?.trim()
  const message = messageMatch?.[1]?.trim()

  return [code, message].filter(Boolean).join(': ')
}

function mapRevenueSeries(
  series: Array<{ date?: unknown; month?: unknown; revenue?: number | null }>,
  labelOptions?: Intl.DateTimeFormatOptions,
) {
  return series
    .map((item) => {
      const rawDate = item.date ?? item.month

      return {
        rawDate,
        value: safeNumber(item.revenue),
      }
    })
    .filter((item) => {
      if (!item.rawDate) return false
      if (Array.isArray(item.rawDate) && item.rawDate.length < 3) return false
      return true
    })
    .map((item) => ({
      label: formatDateArray(item.rawDate, labelOptions),
      value: item.value,
    }))
}

function mapCsvDetails(rows: CsvAnalyticsResponse['detail']): CsvDetailRow[] {
  return rows
    .filter((row) => {
      if (!row.orderDate) return false

      if (Array.isArray(row.orderDate) && row.orderDate.length < 3) return false

      return true
    })
    .map((row) => ({
      orderDate: formatDateArray(row.orderDate),
      code: row.code?.trim() || 'Unknown',
      orders: formatNumber(row.orders),
      revenue: formatCurrency(row.revenue),
      revenuePerOrder: formatCurrency(row.revenuePerOrder),
    }))
}

function mapAdscribeDetails(rows: AdscribeAnalyticsDetail[]): AdscribeDetailRow[] {
  return rows.map((row) => {
    const preferredKeys = [
      'orderDate',
      'date',
      'client',
      'show',
      'orders',
      'impressions',
      'revenue',
      'revenuePerOrder',
      'avgRevenuePerOrder',
      'avgRevenuePerImpression',
      'avgImpressionsPerOrder',
    ]
    const discoveredKeys = Object.keys(row).filter((key) => !preferredKeys.includes(key))
    const orderedKeys = [...preferredKeys.filter((key) => key in row), ...discoveredKeys]

    return orderedKeys.reduce<AdscribeDetailRow>((result, key) => {
      const value = row[key]

      if (key.toLowerCase().includes('date')) {
        result[key] = formatDateArray(value)
        return result
      }

      if (key.toLowerCase().includes('revenue')) {
        result[key] = formatCurrency(value)
        return result
      }

      if (key.toLowerCase().includes('impression')) {
        const numericValue = safeNumber(value)
        result[key] = key === 'avgRevenuePerImpression'
          ? formatCurrency(numericValue, { maximumFractionDigits: 4 })
          : formatNumber(numericValue)
        return result
      }

      if (typeof value === 'number') {
        result[key] = formatNumber(value)
        return result
      }

      result[key] = typeof value === 'string' && value.trim() ? value : 'N/A'
      return result
    }, {})
  })
}

function createAdscribeColumns(rows: AdscribeDetailRow[]): Array<TableColumn<AdscribeDetailRow>> {
  const firstRow = rows[0]

  if (!firstRow) {
    return []
  }

  return Object.keys(firstRow).map((key) => ({
    key,
    label: toDisplayLabel(key),
    align:
      key.toLowerCase().includes('revenue') ||
      key.toLowerCase().includes('orders') ||
      key.toLowerCase().includes('impression')
        ? 'right'
        : 'left',
  }))
}

function Dashboard() {
  const [activeView, setActiveView] = useState<ViewId>('client-data')
  const [refreshAction, setRefreshAction] = useState<(() => void) | null>(null)
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
                    onClick={() => refreshAction?.()}
                    className="inline-flex items-center gap-2 rounded-full bg-surface-card px-4 py-2 text-sm font-semibold text-primary shadow-ambient ring-1 ring-white/80 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!refreshAction}
                  >
                    <Icon name="refresh" className="size-4" />
                    Refresh Data
                  </button>
                </div>
              </div>

              <MobileNav activeView={activeView} onChangeView={setActiveView} />
            </div>
          </header>

          <main className="flex-1 px-4 pb-10 sm:px-6 lg:px-8 xl:px-10">
            <div className="mx-auto max-w-[1360px] space-y-6 pt-2 sm:space-y-8 sm:pt-4">
              {activeView === 'client-data' ? (
                <CsvSection onRefreshChange={setRefreshAction} />
              ) : null}

              {activeView === 'api-data' ? (
                <AdscribeSection onRefreshChange={setRefreshAction} />
              ) : null}

              {activeView === 'upload' ? (
                <UploadSection onRefreshChange={setRefreshAction} />
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function CsvSection({
  onRefreshChange,
}: {
  onRefreshChange: Dispatch<SetStateAction<(() => void) | null>>
}) {
  const [client, setClient] = useState<(typeof csvClientOptions)[number]>('beta')
  const appearance = sourceAppearance.csv
  const { data, error, isError, isFetching, isLoading, refetch } = useGetCsvAnalyticsQuery({
    client,
  })

  useEffect(() => {
    onRefreshChange(() => refetch)

    return () => onRefreshChange(null)
  }, [onRefreshChange, refetch])

  const kpis = data
    ? [
        ['Total Orders', formatNumber(data.kpi.totalOrders)],
        ['Total Revenue', formatCurrency(data.kpi.totalRevenue)],
        ['Avg. Revenue / Order', formatCurrency(data.kpi.avgRevenuePerOrder)],
      ]
    : []

  const dailySeries = data ? mapRevenueSeries(data.daily) : []
  const monthlySeries = data
    ? mapRevenueSeries(data.monthly, { month: 'short', year: 'numeric' })
    : []
  const codeSeries: ChartDatum[] = data
    ? data.byCode.map((item) => ({
        label: item.code?.trim() || 'Unknown',
        value: safeNumber(item.revenue),
      }))
    : []
  const detailRows = data ? mapCsvDetails(data.detail) : []

  return (
    <SourceSectionShell
      appearance={appearance}
      isFetching={isFetching}
      filters={
        <div className="grid gap-3 md:grid-cols-[minmax(0,320px)]">
          <label className="rounded-[22px] bg-surface-low px-4 py-3">
            <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted">
              Client
            </span>
            <select
              value={client}
              onChange={(event) =>
                setClient(event.target.value as (typeof csvClientOptions)[number])
              }
              className="mt-2 w-full bg-transparent text-sm font-semibold capitalize text-ink outline-none"
            >
              {csvClientOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      }
    >
      {isLoading && !data ? (
        <LoadingState label="CSV analytics" />
      ) : isError ? (
        <ErrorState
          title="CSV analytics could not be loaded"
          message={getErrorMessage(error)}
          onRetry={refetch}
        />
      ) : (
        <div className="space-y-5">
          <DashboardCard
            title="KPI Overview"
            subtitle={`Performance snapshot for ${client}.`}
            badge="Tile 1"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {kpis.map(([label, value]) => (
                <MetricTile
                  key={label}
                  label={label}
                  value={value}
                  accentSoft={appearance.accentSoft}
                />
              ))}
            </div>
          </DashboardCard>

          <div className="grid gap-5 xl:grid-cols-2">
            <DashboardCard
              title="Revenue Over Time"
              subtitle="Daily revenue from the CSV analytics feed."
              badge="Tile 2"
            >
              <RevenueLineChart
                data={dailySeries}
                accent={appearance.accent}
                emptyTitle="No daily revenue yet"
                emptyDescription="Revenue points will appear here when the daily API series returns data."
              />
            </DashboardCard>

            <DashboardCard
              title="Revenue Over Time"
              subtitle="Monthly revenue trend from uploaded CSV records."
              badge="Tile 3"
            >
              <RevenueLineChart
                data={monthlySeries}
                accent={appearance.accent}
                emptyTitle="No monthly revenue yet"
                emptyDescription="Monthly totals will appear here when the API returns data."
              />
            </DashboardCard>
          </div>

          <div className="grid gap-5">
            <DashboardCard
              title="Revenue by Code"
              subtitle="Revenue distribution by CSV code."
              badge="Tile 4"
            >
              <RevenueBarChart
                data={codeSeries}
                accent={appearance.accent}
                emptyTitle="No code-level revenue yet"
                emptyDescription="Code breakdowns will render here when the API returns revenue by code."
              />
            </DashboardCard>
          </div>

          <div className="grid gap-5">
            <DashboardCard
              title="Details"
              subtitle="CSV transaction-level detail rows."
              badge="Tile 5"
            >
              <DataTable<CsvDetailRow>
                rows={detailRows}
                columns={[
                  { key: 'orderDate', label: 'Order Date' },
                  { key: 'code', label: 'Code' },
                  { key: 'orders', label: 'Orders', align: 'right' },
                  { key: 'revenue', label: 'Revenue', align: 'right' },
                  { key: 'revenuePerOrder', label: 'Revenue / Order', align: 'right' },
                ]}
                emptyTitle="No CSV detail rows"
                emptyDescription="Detailed orders and revenue rows will appear here once the API returns data."
              />
            </DashboardCard>
          </div>
        </div>
      )}
    </SourceSectionShell>
  )
}

function UploadSection({
  onRefreshChange,
}: {
  onRefreshChange: Dispatch<SetStateAction<(() => void) | null>>
}) {
  const appearance = sourceAppearance.upload
  const [clientName, setClientName] =
    useState<(typeof uploadClientOptions)[number]>('alpha')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const resetUploadState = () => {
    setSuccessMessage('')
    setErrorMessage('')
  }

  useEffect(() => {
    onRefreshChange(null)

    return () => onRefreshChange(null)
  }, [onRefreshChange])

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please choose a file before uploading.')
      setSuccessMessage('')
      return
    }

    setIsUploading(true)
    resetUploadState()

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
      const uploadUrlResponse = await fetch(`${apiBaseUrl}/api/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          clientName,
        }),
      })

      if (!uploadUrlResponse.ok) {
        const backendErrorText = await uploadUrlResponse.text()
        console.error('Failed to create upload URL', {
          status: uploadUrlResponse.status,
          body: backendErrorText,
        })
        throw new Error(`Failed to create upload URL (${uploadUrlResponse.status}).`)
      }

      const uploadUrlPayload = (await uploadUrlResponse.json()) as UploadUrlResponse
      const presignedUrl = uploadUrlPayload.uploadUrl ?? uploadUrlPayload.presignedUrl ?? uploadUrlPayload.url
      const requiredHeaders = uploadUrlPayload.requiredHeaders ?? {}

      if (!presignedUrl) {
        throw new Error('Upload URL was not returned by the backend.')
      }

      console.info('Uploading file with presigned URL', {
        fileName: selectedFile.name,
        fileKey: uploadUrlPayload.fileKey,
        clientName,
        requiredHeaders,
      })

      const s3UploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: await selectedFile.arrayBuffer(),
        headers: requiredHeaders,
      })

      if (!s3UploadResponse.ok) {
        const s3ErrorText = await s3UploadResponse.text()
        const parsedError = parseS3ErrorMessage(s3ErrorText)
        console.error('S3 upload failed', {
          status: s3UploadResponse.status,
          fileName: selectedFile.name,
          fileKey: uploadUrlPayload.fileKey,
          requiredHeaders,
          responseBody: s3ErrorText,
        })
        throw new Error(
          parsedError
            ? `File upload failed (${s3UploadResponse.status}): ${parsedError}`
            : `File upload failed (${s3UploadResponse.status}).`,
        )
      }

      setSuccessMessage(
        `${selectedFile.name} uploaded successfully for client ${clientName}.`,
      )
      setSelectedFile(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Upload failed. Please try again.'
      setErrorMessage(message)
      setSuccessMessage('')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <SourceSectionShell
      appearance={appearance}
      isFetching={isUploading}
      filters={
        <div className="grid gap-3 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
          <label className="rounded-[22px] bg-surface-low px-4 py-3">
            <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted">
              Client
            </span>
            <select
              value={clientName}
              onChange={(event) =>
                setClientName(event.target.value as (typeof uploadClientOptions)[number])
              }
              className="mt-2 w-full bg-transparent text-sm font-semibold capitalize text-ink outline-none"
            >
              {uploadClientOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="rounded-[22px] bg-surface-low px-4 py-3">
            <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted">
              File
            </span>
            <input
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null
                setSelectedFile(file)
                setSuccessMessage('')
                setErrorMessage('')
              }}
              className="mt-2 block w-full text-sm font-medium text-ink file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary file:shadow-ambient"
            />
          </label>
        </div>
      }
    >
      <div className="space-y-5">
        <DashboardCard
          title="Direct Upload"
          subtitle="Choose a client and a local file, request a presigned URL, and upload the file straight to S3."
          badge="Uploader"
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="rounded-[24px] bg-white px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted">
                Selected File
              </p>
              <p className="mt-3 text-base font-semibold text-ink">
                {selectedFile?.name ?? 'No file selected'}
              </p>
              <p className="mt-1 text-sm text-muted">
                {selectedFile
                  ? `${formatNumber(selectedFile.size)} bytes • ${selectedFile.type || 'Unknown type'}`
                  : 'Pick a file from your local system to begin.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#14532d_0%,#1f7a45_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(20,83,45,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="upload" className="size-4" />
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>

          {successMessage ? (
            <div className="mt-4 rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {successMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-4 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}
        </DashboardCard>
      </div>
    </SourceSectionShell>
  )
}

function AdscribeSection({
  onRefreshChange,
}: {
  onRefreshChange: Dispatch<SetStateAction<(() => void) | null>>
}) {
  const [filters, setFilters] = useState({
    startDate: '2026-03-01',
    endDate: '2026-03-31',
  })
  const appearance = sourceAppearance.adscribe
  const { data, error, isError, isFetching, isLoading, refetch } =
    useGetAdscribeAnalyticsQuery({
      startDate: filters.startDate,
      endDate: filters.endDate || undefined,
    })

  useEffect(() => {
    onRefreshChange(() => refetch)

    return () => onRefreshChange(null)
  }, [onRefreshChange, refetch])

  const kpis = data
    ? [
        ['Total Revenue', formatCurrency(data.kpi.totalRevenue)],
        ['Total Orders', formatNumber(data.kpi.totalOrders)],
        ['Total Impressions', formatNumber(data.kpi.totalImpressions)],
        ['Avg. Revenue / Order', formatCurrency(data.kpi.avgRevenuePerOrder)],
        [
          'Avg. Revenue / Impression',
          formatCurrency(
            data.kpi.avgRevenuePerImpression ??
              safeDivide(data.kpi.totalRevenue, data.kpi.totalImpressions),
            { maximumFractionDigits: 4 },
          ),
        ],
        [
          'Avg. Impressions / Order',
          formatNumber(
            data.kpi.avgImpressionsPerOrder ??
              safeDivide(data.kpi.totalImpressions, data.kpi.totalOrders),
            { maximumFractionDigits: 2 },
          ),
        ],
      ]
    : []

  const dailySeries = data ? mapRevenueSeries(data.daily) : []
  const byClientSeries: ChartDatum[] = data
    ? data.byClient
        .map((item) => {
          const namedItem = item as NamedRevenueItem
          const value = Number(item.revenue)

          return {
            label: namedItem.clientName?.trim() || namedItem.client?.trim() || 'Unknown',
            value: isNaN(value) ? 0 : value,
          }
        })
        .filter((item) => item.value > 0)
    : []
  const topShowSeries: ChartDatum[] = data
    ? data.topShows.map((item) => {
        const namedItem = item as NamedRevenueItem

        return {
          label: namedItem.showName?.trim() || namedItem.show?.trim() || 'Unknown',
          value: safeNumber(item.revenue),
        }
      })
    : []
  const detailRows = data ? mapAdscribeDetails(data.detail) : []
  const detailColumns = createAdscribeColumns(detailRows)

  return (
    <SourceSectionShell
      appearance={appearance}
      isFetching={isFetching}
      filters={
        <div className="grid gap-3 md:grid-cols-2">
          <label className="rounded-[22px] bg-surface-low px-4 py-3">
            <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted">
              Start Date
            </span>
            <input
              type="date"
              value={filters.startDate}
              onChange={(event) =>
                setFilters((current) => ({ ...current, startDate: event.target.value }))
              }
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
              onChange={(event) =>
                setFilters((current) => ({ ...current, endDate: event.target.value }))
              }
              className="mt-2 w-full bg-transparent text-sm font-semibold text-ink outline-none"
            />
          </label>
        </div>
      }
    >
      {isLoading && !data ? (
        <LoadingState label="Adscribe analytics" />
      ) : isError ? (
        <ErrorState
          title="Adscribe analytics could not be loaded"
          message={getErrorMessage(error)}
          onRetry={refetch}
        />
      ) : (
        <div className="space-y-5">
          <DashboardCard
            title="KPI Overview"
            subtitle={`Live Adscribe metrics from ${filters.startDate} to ${filters.endDate || 'today'}.`}
            badge="Tile 1"
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {kpis.map(([label, value]) => (
                <MetricTile
                  key={label}
                  label={label}
                  value={value}
                  accentSoft={appearance.accentSoft}
                />
              ))}
            </div>
          </DashboardCard>

          <div className="grid gap-5 xl:grid-cols-2">
            <DashboardCard
              title="Revenue Over Time"
              subtitle="Daily Adscribe revenue across the selected date range."
              badge="Tile 2"
            >
              <RevenueLineChart
                data={dailySeries}
                accent={appearance.accent}
                emptyTitle="No Adscribe revenue yet"
                emptyDescription="Daily revenue points will render here when the API returns data."
              />
            </DashboardCard>

            <DashboardCard
              title="Revenue by Client"
              subtitle="Relative contribution by client."
              badge="Tile 3"
            >
              <RevenuePieChart
                data={byClientSeries}
                emptyTitle="No client revenue yet"
                emptyDescription="Client distribution will appear here when the API returns data."
              />
            </DashboardCard>
          </div>

          <div className="grid gap-5">
            <DashboardCard
              title="Top Shows"
              subtitle="Highest-revenue shows across the selected date range."
              badge="Tile 4"
            >
              <RevenueBarChart
                data={topShowSeries}
                accent={appearance.accent}
                emptyTitle="No top shows yet"
                emptyDescription="Show performance will render here when the API returns data."
              />
            </DashboardCard>
          </div>

          <div className="grid gap-5">
            <DashboardCard
              title="Details"
              subtitle="Detailed Adscribe records returned by the API."
              badge="Tile 5"
            >
              <DataTable<AdscribeDetailRow>
                rows={detailRows}
                columns={detailColumns}
                emptyTitle="No Adscribe detail rows"
                emptyDescription="Detailed records will appear here once the API returns data."
              />
            </DashboardCard>
          </div>
        </div>
      )}
    </SourceSectionShell>
  )
}

function SourceSectionShell({
  appearance,
  isFetching,
  filters,
  children,
}: {
  appearance: (typeof sourceAppearance)[SourceKey]
  isFetching: boolean
  filters: ReactNode
  children: ReactNode
}) {
  return (
    <article className="rounded-[30px] bg-surface-card p-5 shadow-ambient ring-1 ring-white/80 sm:p-6">
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-muted">
            Source Section
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="font-display text-[1.8rem] font-extrabold tracking-[-0.03em] text-ink">
              {appearance.title}
            </h2>
            <span
              className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
              style={{ backgroundColor: appearance.accent }}
            >
              {appearance.label}
            </span>
            <span
              className={cx(
                'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]',
                isFetching ? 'bg-primary-soft text-primary' : 'bg-success-soft text-success',
              )}
            >
              {isFetching ? 'Syncing' : 'Live'}
            </span>
          </div>
          <p className="mt-2 max-w-xl text-sm text-muted">{appearance.subtitle}</p>
        </div>

        {filters}

        {children}
      </div>
    </article>
  )
}

function RevenueLineChart({
  data,
  accent,
  emptyTitle,
  emptyDescription,
}: {
  data: ChartDatum[]
  accent: string
  emptyTitle: string
  emptyDescription: string
}) {
  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.18)" strokeDasharray="4 4" />
          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value: number) => formatCurrency(value, { maximumFractionDigits: 0 })}
            width={92}
          />
          <Tooltip
            formatter={(value) => formatCurrency(safeNumber(value))}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{
              borderRadius: '18px',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)',
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={accent}
            strokeWidth={4}
            dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
            activeDot={{ r: 6 }}
            isAnimationActive
            animationDuration={850}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function RevenueBarChart({
  data,
  accent,
  emptyTitle,
  emptyDescription,
}: {
  data: ChartDatum[]
  accent: string
  emptyTitle: string
  emptyDescription: string
}) {
  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={8} margin={{ top: 8, right: 12, left: 0, bottom: 28 }}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.18)" strokeDasharray="4 4" />
          <XAxis
            dataKey="label"
            interval={0}
            angle={-24}
            textAnchor="end"
            height={92}
            tick={{ fill: '#64748b', fontSize: 11 }}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value: number) => formatCurrency(value, { maximumFractionDigits: 0 })}
            width={92}
          />
          <Tooltip
            formatter={(value) => formatCurrency(safeNumber(value))}
            labelFormatter={(label) => `Label: ${label}`}
            contentStyle={{
              borderRadius: '18px',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)',
            }}
          />
          <Bar
            dataKey="value"
            radius={[16, 16, 6, 6]}
            fill={accent}
            isAnimationActive
            animationDuration={850}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function RevenuePieChart({
  data,
  emptyTitle,
  emptyDescription,
}: {
  data: ChartDatum[]
  emptyTitle: string
  emptyDescription: string
}) {
  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={104}
            paddingAngle={3}
            isAnimationActive
            animationDuration={850}
          >
            {data.map((entry, index) => (
              <Cell
                key={`${entry.label}-${index + 1}`}
                fill={piePalette[index % piePalette.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [
              `${formatCurrency(safeNumber(value))} (${formatPercent(
                safeDivide(safeNumber(value), total) * 100,
              )})`,
              'Revenue',
            ]}
            contentStyle={{
              borderRadius: '18px',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function DataTable<T extends Record<string, string>>({
  rows,
  columns,
  emptyTitle,
  emptyDescription,
}: {
  rows: T[]
  columns: Array<TableColumn<T>>
  emptyTitle: string
  emptyDescription: string
}) {
  if (rows.length === 0 || columns.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="overflow-hidden rounded-[22px] bg-white">
      <div className="max-h-[336px] overflow-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="sticky top-0 border-b border-slate-100 bg-slate-50/95 backdrop-blur">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cx(
                    'px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-muted',
                    column.align === 'right' ? 'text-right' : 'text-left',
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex + 1}`} className="border-b border-slate-100 last:border-b-0">
                {columns.map((column) => (
                  <td
                    key={`${String(column.key)}-${rowIndex + 1}`}
                    className={cx(
                      'px-4 py-3 text-sm text-ink',
                      column.align === 'right' ? 'text-right' : 'text-left',
                    )}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    const withStatus = error as { status?: number | string; data?: unknown; error?: string }

    if (typeof withStatus.error === 'string' && withStatus.error.trim()) {
      return withStatus.error
    }

    if (typeof withStatus.data === 'string' && withStatus.data.trim()) {
      return withStatus.data
    }

    if (withStatus.status) {
      return `Request failed with status ${withStatus.status}.`
    }
  }

  return 'Please try refreshing the dashboard again.'
}

export default Dashboard


