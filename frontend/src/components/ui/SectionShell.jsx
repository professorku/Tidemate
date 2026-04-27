function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

const variants = {
  default: 'rounded-[28px] border border-slate-200 bg-white shadow-sm',
  soft: 'rounded-[28px] bg-white shadow-soft',
}

const paddings = {
  default: 'p-6 md:p-8',
  compact: 'p-4 md:p-5',
  hero: 'px-6 py-7 md:px-8 md:py-8',
}

export default function SectionShell({
  as = 'section',
  children,
  className = '',
  variant = 'default',
  padding = 'default',
}) {
  const Tag = as

  return <Tag className={cn(variants[variant], paddings[padding], className)}>{children}</Tag>
}
