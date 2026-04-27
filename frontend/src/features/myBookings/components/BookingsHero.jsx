import SectionShell from '../../../components/ui/SectionShell'
import SectionHeader from '../../../components/ui/SectionHeader'

export default function BookingsHero() {
  return (
    <SectionShell padding="hero">
      <SectionHeader
        title="My bookings"
        description="Keep track of your upcoming trips, booking requests, completed stays, and any cancellations in one place."
      />
    </SectionShell>
  )
}
