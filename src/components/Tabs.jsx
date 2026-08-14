export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 border-b border-ledger-line">
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative px-4 py-2.5 text-sm font-medium font-display tracking-wide transition-colors
              ${isActive ? 'text-ink' : 'text-slate hover:text-ink'}`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-[11px] font-mono ${
                  isActive ? 'bg-ink text-parchment' : 'bg-ledger-line text-ink'
                }`}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <span className="absolute left-0 right-0 -bottom-px h-[3px] bg-seal rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}
