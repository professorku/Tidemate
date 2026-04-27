import { UserCircleIcon } from '@heroicons/react/24/outline'
import PageContainer from '../../../../components/layout/PageContainer'
import ErrorState from '../../../../components/ui/ErrorState'
import LoadingState from '../../../../components/ui/LoadingState'

export function PublicProfileLoadingState() {
  return (
    <PageContainer className="py-6 md:py-8">
      <LoadingState
        icon={<UserCircleIcon className="h-8 w-8" />}
        title="Loading profile"
        text="We are fetching this member’s profile, public boats, and reviews."
      />
    </PageContainer>
  )
}

export function PublicProfileErrorState({ error, onRetry }) {
  return (
    <PageContainer size="narrow" className="py-6 md:py-8">
      <ErrorState
        title="Profile unavailable"
        message={error || 'Could not load this user.'}
        onRetry={onRetry}
      />
    </PageContainer>
  )
}
