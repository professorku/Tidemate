import { Link } from 'react-router-dom'
import DesktopSearch from './DesktopSearch'
import NotificationBell from './NotificationBell'
import UserMenu from './UserMenu'
import { useNavbar } from '../hooks/useNavbar'
import { useAuth } from '../../../context/useAuth'

export default function Navbar() {
  const { isAuthenticated, loading } = useAuth()
  const { query, setQuery, handleSearch } = useNavbar()

  return (
    <header className="sticky top-0 z-[2000] border-b border-navy/60 bg-navy text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 text-xl font-bold text-white"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-base text-navy">
            ⚓
          </div>
          TideMate
        </Link>

        <DesktopSearch
          query={query}
          setQuery={setQuery}
          handleSearch={handleSearch}
        />

        <div className="flex items-center gap-2">
          {!loading && isAuthenticated ? (
            <>
              <NotificationBell />

              <Link
                to="/add-boat"
                className="hidden rounded-full bg-gold px-4 py-2 text-sm font-semibold text-navy transition hover:brightness-95 md:inline-flex"
              >
                Add boat
              </Link>

              <UserMenu />
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Log in
              </Link>

              <Link
                to="/signup"
                className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-navy transition hover:brightness-95"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}