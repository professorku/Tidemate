import { Link } from 'react-router-dom'
import { LifebuoyIcon } from '@heroicons/react/24/outline'
import PageContainer from '../../../components/layout/PageContainer'

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[#071d32]">
      <PageContainer size="narrow" className="py-8 md:py-10">
        <div className="rounded-[28px] border border-gold/20 bg-navy p-8 text-center shadow-soft md:p-10">
          <div className="mx-auto max-w-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold ring-1 ring-gold/20">
              <LifebuoyIcon className="h-8 w-8" />
            </div>

            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
              Page not found
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/70">
              The page you are looking for may have moved, been removed, or never existed.
            </p>

            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold/90"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-white/70">
          Looking for your account pages?{' '}
          <Link to="/login" className="font-semibold text-gold">
            Log in
          </Link>
        </div>
      </PageContainer>
    </main>
  )
}