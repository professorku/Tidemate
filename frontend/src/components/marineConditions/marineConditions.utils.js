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
      classes: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
    }
  }

  if (label === 'Fair') {
    return {
      label: 'Moderate',
      Icon: CloudIcon,
      classes: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
    }
  }

  if (label === 'Rough') {
    return {
      label: 'Choppy',
      Icon: ExclamationTriangleIcon,
      classes: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    }
  }

  return {
    label: 'Unknown',
    Icon: QuestionMarkCircleIcon,
    classes: 'bg-slate-50 text-slate-600 ring-1 ring-slate-200',
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