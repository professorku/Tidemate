import BookingCardMenuButton from '../../../components/bookings/BookingCardMenuButton'

export default function BookingCardActions({
  canDelete,
  revealed,
  toggle,
  hide,
  isDeleting,
  booking,
  onDelete,
}) {
  return (
    <BookingCardMenuButton
      canDelete={canDelete}
      revealed={revealed}
      isDeleting={isDeleting}
      showLabel="Show booking actions"
      onDelete={() => onDelete(booking)}
      onToggle={toggle}
      onHide={hide}
    />
  )
}
