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

export const navItems: NavItem[] = [
  { id: 'client-data', icon: 'database', label: 'CSV Data' },
  { id: 'api-data', icon: 'api', label: 'Adscribe Data' },
]
