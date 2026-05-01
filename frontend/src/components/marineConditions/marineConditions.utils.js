import {
  SunIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/solid'

export function conditionMeta(label) {
  if (label === 'Good') {
    return {
      label: 'Calm',
      Icon: SunIcon,
      classes: 'bg-emerald-400/10 text-emerald-100 ring-1 ring-emerald-300/20',
    }
  }

  if (label === 'Fair') {
    return {
      label: 'Moderate',
      Icon: CloudIcon,
      classes: 'bg-gold/10 text-gold ring-1 ring-gold/25',
    }
  }

  if (label === 'Rough') {
    return {
      label: 'Choppy',
      Icon: ExclamationTriangleIcon,
      classes: 'bg-red-400/10 text-red-200 ring-1 ring-red-300/20',
    }
  }

  return {
    label: 'Unknown',
    Icon: QuestionMarkCircleIcon,
    classes: 'bg-[#071d32]/80 text-white/75 ring-1 ring-gold/20',
  }
}

export function formatHour(value) {
  try {
    return new Date(value).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}