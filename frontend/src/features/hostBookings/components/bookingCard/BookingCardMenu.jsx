import BookingCardMenuButton from '../../../../components/bookings/BookingCardMenuButton'

export default function BookingCardMenu({
  canDelete,
  revealed,
  isProcessing,
  booking,
  handleDelete,
  toggle,
  hide,
}) {
  return (
    <BookingCardMenuButton
      canDelete={canDelete}
      revealed={revealed}
      isDeleting={isProcessing}
      deleteLabel="Delete"
      showLabel="Show booking actions"
      onDelete={() => handleDelete(booking)}
      onToggle={toggle}
      onHide={hide}
    />
  )
}