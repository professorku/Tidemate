function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function FilterTabs({
  tabs,
  activeKey,
  onChange,
  showCount = false,
  className = '',
  buttonClassName = '',
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tabs.map((tab) => {
        const isActive = activeKey === tab.key

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              isActive
                ? 'bg-navy text-white shadow-sm ring-1 ring-navy'
                : 'bg-white/90 text-ocean ring-1 ring-navy/15 hover:bg-mist hover:text-navy',
              buttonClassName,
            )}
          >
            {tab.label}
            {showCount ? ` (${tab.count ?? 0})` : ''}
          </button>
        )
      })}
    </div>
  )
}