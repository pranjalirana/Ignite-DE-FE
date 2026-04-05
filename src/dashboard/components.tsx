import type { ReactNode } from 'react'
import type { ViewId } from './data'
import { navItems } from './data'
import { cx } from './helpers'
import Icon from './Icon'

export function Sidebar({
  activeView,
  onChangeView,
}: {
  activeView: ViewId
  onChangeView: (view: ViewId) => void
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[258px] shrink-0 flex-col bg-[#eef2ff] px-4 py-5 xl:flex">
      <div className="flex items-center gap-3 px-2">
        <div className="flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-white text-primary shadow-ambient">
          <Icon name="analytics" className="size-4" />
        </div>
        <div>
          <p className="font-display text-sm font-extrabold tracking-[-0.03em] text-primary">
            The Digital Curator
          </p>
          <p className="text-[11px] text-muted">Precision workspace</p>
        </div>
      </div>

      <nav className="mt-10 space-y-2">
        {navItems.map((item) => (
          <button
            type="button"
            key={item.label}
            onClick={() => onChangeView(item.id)}
            className={cx(
              'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[12px] font-medium transition',
              item.id === activeView
                ? 'bg-[#dfe3ff] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]'
                : 'text-ink/80 hover:bg-white/70 hover:text-ink',
            )}
          >
            <Icon name={item.icon} className="size-4" />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export function MobileNav({
  activeView,
  onChangeView,
}: {
  activeView: ViewId
  onChangeView: (view: ViewId) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 xl:hidden">
      {navItems.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onChangeView(item.id)}
          className={cx(
            'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold',
            item.id === activeView
              ? 'bg-primary-soft text-[#003ea8]'
              : 'bg-surface-card text-muted shadow-ambient ring-1 ring-white/80',
          )}
        >
          <Icon name={item.icon} className="size-4" />
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function DashboardCard({
  title,
  subtitle,
  badge,
  children,
  className,
}: {
  title: string
  subtitle?: string
  badge?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cx(
        'rounded-[26px] bg-surface-low p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:p-5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-extrabold tracking-[-0.03em] text-ink">
            {title}
          </h3>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </div>
        {badge ? (
          <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  )
}

export function MetricTile({
  label,
  value,
  accentSoft,
}: {
  label: string
  value: string
  accentSoft: string
}) {
  return (
    <div
      className="rounded-[22px] px-4 py-4 transition duration-300 hover:-translate-y-0.5"
      style={{ backgroundColor: accentSoft }}
    >
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-ink">{value}</p>
    </div>
  )
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-4 rounded-[22px] border border-dashed border-primary/20 bg-white/70 px-6 text-center">
      <div className="size-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      <div>
        <p className="text-sm font-semibold text-ink">Loading {label}</p>
        <p className="mt-1 text-sm text-muted">Fetching the latest analytics from the API.</p>
      </div>
    </div>
  )
}

export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-4 rounded-[22px] border border-rose-200 bg-rose-50/80 px-6 text-center">
      <div className="inline-flex size-11 items-center justify-center rounded-full bg-white text-rose-500 shadow-ambient">
        <Icon name="flash" className="size-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="mt-1 max-w-md text-sm text-muted">{message}</p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow-ambient ring-1 ring-primary/10 transition hover:-translate-y-0.5"
        >
          <Icon name="refresh" className="size-4" />
          Retry
        </button>
      ) : null}
    </div>
  )
}

export function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-[22px] border border-dashed border-primary/15 bg-white/70 px-6 text-center">
      <div className="inline-flex size-11 items-center justify-center rounded-full bg-surface-panel text-primary">
        <Icon name="layers" className="size-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="mt-1 max-w-md text-sm text-muted">{description}</p>
      </div>
    </div>
  )
}
