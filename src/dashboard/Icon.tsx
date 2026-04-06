import type { IconName } from './data'

function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {name === 'analytics' ? (
        <>
          <path d="M4 19h16" />
          <path d="M7 16V9" />
          <path d="M12 16V5" />
          <path d="M17 16v-4" />
        </>
      ) : null}

      {name === 'dashboard' ? (
        <>
          <rect x="4" y="4" width="7" height="7" rx="2" />
          <rect x="13" y="4" width="7" height="5" rx="2" />
          <rect x="13" y="11" width="7" height="9" rx="2" />
          <rect x="4" y="13" width="7" height="7" rx="2" />
        </>
      ) : null}

      {name === 'database' ? (
        <>
          <ellipse cx="12" cy="6" rx="7" ry="3" />
          <path d="M5 6v8c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
          <path d="M5 10c0 1.7 3.1 3 7 3s7-1.3 7-3" />
        </>
      ) : null}

      {name === 'api' ? (
        <>
          <path d="M8 8 5 12l3 4" />
          <path d="m16 8 3 4-3 4" />
          <path d="m13 5-2 14" />
        </>
      ) : null}

      {name === 'upload' ? (
        <>
          <path d="M12 16V5" />
          <path d="m8 9 4-4 4 4" />
          <path d="M5 19h14" />
          <path d="M7 19a2 2 0 0 1-2-2v-2" />
          <path d="M17 19a2 2 0 0 0 2-2v-2" />
        </>
      ) : null}

      {name === 'refresh' ? (
        <>
          <path d="M20 11a8 8 0 0 0-14-5" />
          <path d="M4 4v5h5" />
          <path d="M4 13a8 8 0 0 0 14 5" />
          <path d="M20 20v-5h-5" />
        </>
      ) : null}

      {name === 'bell' ? (
        <>
          <path d="M15 17H5.5a1 1 0 0 1-.8-1.6L6 13.5V10a6 6 0 1 1 12 0v3.5l1.3 1.9a1 1 0 0 1-.8 1.6H15" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </>
      ) : null}

      {name === 'filter' ? (
        <>
          <path d="M4 6h16" />
          <path d="M7 12h10" />
          <path d="M10 18h4" />
        </>
      ) : null}

      {name === 'chevron-down' ? <path d="m6 9 6 6 6-6" /> : null}

      {name === 'spark' ? (
        <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
      ) : null}

      {name === 'search' ? (
        <>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </>
      ) : null}

      {name === 'download' ? (
        <>
          <path d="M12 4v10" />
          <path d="m8 10 4 4 4-4" />
          <path d="M5 19h14" />
        </>
      ) : null}

      {name === 'chevron-right' ? <path d="m9 6 6 6-6 6" /> : null}

      {name === 'flash' ? <path d="M13 2 6 13h5l-1 9 8-12h-5V2Z" /> : null}

      {name === 'trend' ? (
        <>
          <path d="M4 16 9 11l4 4 7-8" />
          <path d="M14 7h6v6" />
        </>
      ) : null}

      {name === 'layers' ? (
        <>
          <path d="m12 4 8 4-8 4-8-4 8-4Z" />
          <path d="m4 12 8 4 8-4" />
          <path d="m4 16 8 4 8-4" />
        </>
      ) : null}
    </svg>
  )
}

export default Icon
