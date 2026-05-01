import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../../context/useAuth'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const navLinkClass =
    'block rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white'

  const hasListedBoats = Number(user?.stats?.boats_listed || 0) > 0

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-white shadow-sm transition hover:bg-white/20"
      >
        {open ? (
          <XMarkIcon className="h-5 w-5" />
        ) : (
          <Bars3Icon className="h-5 w-5" />
        )}
        <span className="hidden text-sm font-semibold md:inline">Menu</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2.5 w-72 overflow-hidden rounded-2xl border border-gold/20 bg-navy p-2 shadow-xl">
          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            <UserCircleIcon className="h-5 w-5 text-gold" />
            {user?.username ? `${user.username}'s profile` : 'My profile'}
          </Link>

          <div className="my-2 border-t border-gold/15" />

          <Link
            to="/my-bookings"
            className={navLinkClass}
            onClick={() => setOpen(false)}
          >
            My bookings
          </Link>

          {hasListedBoats ? (
            <Link
              to="/host-bookings"
              className={navLinkClass}
              onClick={() => setOpen(false)}
            >
              Host bookings
            </Link>
          ) : null}

          <div className="my-2 border-t border-gold/15" />

          <Link
            to="/messages"
            className={navLinkClass}
            onClick={() => setOpen(false)}
          >
            Messages
          </Link>

          <Link
            to="/favorites"
            className={navLinkClass}
            onClick={() => setOpen(false)}
          >
            Favorites
          </Link>

          <Link
            to="/my-boats"
            className={navLinkClass}
            onClick={() => setOpen(false)}
          >
            My boats
          </Link>

          <Link
            to="/add-boat"
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gold transition hover:bg-white/10 md:hidden"
            onClick={() => setOpen(false)}
          >
            Add boat
          </Link>

          <div className="my-2 border-t border-gold/15" />

          <button
            type="button"
            onClick={handleLogout}
            className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-300 transition hover:bg-red-400/10 hover:text-red-200"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}