export type IconName =
  | 'analytics'
  | 'dashboard'
  | 'database'
  | 'api'
  | 'refresh'
  | 'bell'
  | 'filter'
  | 'chevron-down'
  | 'spark'
  | 'search'
  | 'download'
  | 'chevron-right'
  | 'flash'
  | 'trend'
  | 'layers'

export type ViewId = 'client-data' | 'api-data'

export type NavItem = {
  id: ViewId
  icon: IconName
  label: string
}

export type KpiCard = {
  label: string
  value: string
  delta: string
  tone: 'success' | 'stable'
  caption: string
  bars?: number[]
}

export type SourceItem = {
  label: string
  value: string
  width: string
}

export type Transaction = {
  date: string
  client: string
  show: string
  revenue: string
  orders: string
  status: 'SYNCED' | 'RETRYING'
}

export const navItems: NavItem[] = [
  { id: 'client-data', icon: 'database', label: 'CSV Data' },
  { id: 'api-data', icon: 'api', label: 'Adscribe Data' },
]

export const filters = [
  { label: 'Date', value: 'Today' },
  { label: 'Client', value: 'Enterprise A' },
  { label: 'Source', value: 'API' },
]

export const kpiCards: KpiCard[] = [
  {
    label: 'Total Revenue',
    value: '$122.8K',
    delta: '+18%',
    tone: 'success',
    caption: 'Adscribe endpoints outperformed plan by 12.4%.',
    bars: [32, 48, 41, 60, 74, 90, 100],
  },
  {
    label: 'Total Orders',
    value: '3,450',
    delta: '+10%',
    tone: 'success',
    caption: 'Matched 98.4% of target throughput.',
  },
  {
    label: 'Impressions',
    value: '8.4M',
    delta: '+15%',
    tone: 'success',
    caption: 'Global API delivery footprint stayed ahead all day.',
  },
  {
    label: 'Rev. Per Order',
    value: '$35.60',
    delta: 'Stable',
    tone: 'stable',
    caption: 'Basket value held steady during the v3 rollout.',
  },
]

export const sourceMix: SourceItem[] = [
  { label: 'Amazon API', value: '1,240', width: '75%' },
  { label: 'Shopify Direct', value: '942', width: '55%' },
  { label: 'Walmart Connect', value: '628', width: '40%' },
  { label: 'Custom API', value: '640', width: '42%' },
]

export const transactions: Transaction[] = [
  {
    date: 'Oct 24, 09:42',
    client: 'Enterprise A',
    show: 'Morning Pulse',
    revenue: '$12,402.00',
    orders: '342',
    status: 'SYNCED',
  },
  {
    date: 'Oct 24, 09:15',
    client: 'Global Media Corp',
    show: 'The Daily Digest',
    revenue: '$8,120.50',
    orders: '215',
    status: 'SYNCED',
  },
  {
    date: 'Oct 24, 08:55',
    client: 'Enterprise A',
    show: 'Tech Weekly',
    revenue: '$15,840.00',
    orders: '489',
    status: 'RETRYING',
  },
  {
    date: 'Oct 24, 08:30',
    client: 'Luxe Living',
    show: 'Design Diaries',
    revenue: '$4,300.00',
    orders: '102',
    status: 'SYNCED',
  },
  {
    date: 'Oct 24, 08:12',
    client: 'Enterprise A',
    show: 'Finance Flow',
    revenue: '$22,900.00',
    orders: '610',
    status: 'SYNCED',
  },
  {
    date: 'Oct 24, 07:54',
    client: 'Northstar Studios',
    show: 'Market Signal',
    revenue: '$11,220.00',
    orders: '301',
    status: 'SYNCED',
  },
]

export const chartLabels = [
  '08:00',
  '10:00',
  '12:00',
  '14:00',
  '16:00',
  '18:00',
  '20:00',
]

export const currentSeries = [22, 31, 28, 43, 39, 54, 62]
export const previousSeries = [18, 24, 23, 32, 30, 39, 47]
