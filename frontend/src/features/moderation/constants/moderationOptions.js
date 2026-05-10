export const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
]

export const TARGET_OPTIONS = [
  { value: '', label: 'All targets' },
  { value: 'listing', label: 'Listings' },
  { value: 'user', label: 'Users' },
  { value: 'review', label: 'Reviews' },
  { value: 'message', label: 'Messages' },
]

export const REASON_OPTIONS = [
  { value: '', label: 'All reasons' },
  { value: 'scam', label: 'Scam or fraud' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'harassment', label: 'Harassment or abuse' },
  { value: 'safety', label: 'Safety concern' },
  { value: 'wrong_info', label: 'Wrong or misleading information' },
  { value: 'spam', label: 'Spam' },
  { value: 'other', label: 'Other' },
]

export const STATUS_CLASSES = {
  pending: 'border-amber-300/40 bg-amber-400/15 text-amber-100',
  reviewing: 'border-sky-300/40 bg-sky-400/15 text-sky-100',
  resolved: 'border-emerald-300/40 bg-emerald-400/15 text-emerald-100',
  dismissed: 'border-slate-300/30 bg-white/10 text-white/70',
}