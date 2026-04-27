import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Input } from './Field'

export default function SearchField({ value, onChange, placeholder, className = '' }) {
  return (
    <div className={className}>
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="rounded-full bg-slate-50 py-3 pl-11 pr-4 focus:bg-white"
        />
      </div>
    </div>
  )
}
