import { Link } from 'react-router-dom'
import { LifebuoyIcon } from '@heroicons/react/24/outline'
import PageContainer from '../../../components/layout/PageContainer'
import StatePanel from '../../../components/ui/StatePanel'

export default function NotFoundPage() {
  return (
    <PageContainer size="narrow" className="py-8 md:py-10">
      <StatePanel
        icon={<LifebuoyIcon className="h-8 w-8" />}
        title="Page not found"
        text="The page you are looking for may have moved, been removed, or never existed."
        actionLabel="Back to home"
        actionTo="/"
        compact={false}
        tone="subtle"
      />

      <div className="mt-4 text-center text-sm text-slate-600">
        Looking for your account pages?{' '}
        <Link to="/login" className="font-semibold text-ocean">
          Log in
        </Link>
      </div>
    </PageContainer>
  )
}
