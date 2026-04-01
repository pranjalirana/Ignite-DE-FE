import type { IconName, KpiCard, Transaction, ViewId } from './data'
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
          <p className="text-[11px] text-muted">
            Precision workspace
          </p>
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

export function KpiPanel({ card }: { card: KpiCard }) {
  const isSuccess = card.tone === 'success'
  const bars = card.bars

  return (
    <article className="rounded-[28px] bg-surface-card p-5 shadow-ambient ring-1 ring-white/80 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-muted">
            {card.label}
          </p>
          <h3 className="mt-3 font-display text-[2rem] font-extrabold tracking-[-0.04em] text-ink">
            {card.value}
          </h3>
        </div>
        <span
          className={cx(
            'rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.18em]',
            isSuccess
              ? 'bg-success-soft text-success'
              : 'bg-primary-soft text-primary',
          )}
        >
          {card.delta}
        </span>
      </div>

      {bars ? (
        <div className="mt-6 flex h-12 items-end gap-1.5">
          {bars.map((bar, index) => (
            <div
              key={`${card.label}-${index + 1}`}
              className={cx(
                'flex-1 rounded-t-full',
                index >= bars.length - 2 ? 'bg-primary' : 'bg-primary/18',
              )}
              style={{ height: `${bar}%` }}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 flex items-center gap-3 rounded-[22px] bg-surface-low px-4 py-3">
          <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-surface-panel text-primary">
            <Icon name="layers" className="size-5" />
          </div>
          <p className="text-sm text-muted">{card.caption}</p>
        </div>
      )}

      {bars ? <p className="mt-4 text-sm text-muted">{card.caption}</p> : null}
    </article>
  )
}

export function MiniMetric({
  icon,
  label,
  value,
  caption,
}: {
  icon: IconName
  label: string
  value: string
  caption: string
}) {
  return (
    <article className="rounded-[28px] bg-surface-card p-5 shadow-ambient ring-1 ring-white/80">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-muted">
            {label}
          </p>
          <h3 className="mt-3 font-display text-[1.9rem] font-extrabold tracking-[-0.04em] text-ink">
            {value}
          </h3>
        </div>
        <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-surface-panel text-primary">
          <Icon name={icon} className="size-5" />
        </span>
      </div>
      <p className="mt-3 text-sm text-muted">{caption}</p>
    </article>
  )
}

export function StatusPill({ status }: { status: Transaction['status'] }) {
  const syncing = status === 'SYNCED'

  return (
    <span
      className={cx(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.18em]',
        syncing ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning',
      )}
    >
      <span
        className={cx('h-2 w-2 rounded-full', syncing ? 'bg-success' : 'bg-warning')}
      />
      {status}
    </span>
  )
}
