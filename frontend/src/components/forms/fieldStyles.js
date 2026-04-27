export function inputClassName(extra = '') {
  return [
    'w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-navy',
    extra,
  ]
    .filter(Boolean)
    .join(' ')
}
