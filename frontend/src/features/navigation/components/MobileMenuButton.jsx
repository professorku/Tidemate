import { Bars3Icon } from '@heroicons/react/24/outline'

export default function MobileMenuButton() {
  return (
    <button
      type="button"
      className="rounded-full border border-white/15 bg-white/10 p-2 text-white md:hidden"
    >
      <Bars3Icon className="h-5 w-5" />
    </button>
  )
}