import { UserCircleIcon } from '@heroicons/react/24/outline'

const SIZE_CLASSES = {
  sm: { wrapper: 'h-9 w-9', icon: 'h-5 w-5' },
  md: { wrapper: 'h-11 w-11', icon: 'h-6 w-6' },
  lg: { wrapper: 'h-14 w-14', icon: 'h-7 w-7' },
  xl: { wrapper: 'h-12 w-12', icon: 'h-7 w-7' },
}

export default function Avatar({ avatar, username, size = 'md', className = '' }) {
  const styles = SIZE_CLASSES[size] || SIZE_CLASSES.md

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={username || 'User'}
        loading="lazy"
        decoding="async"
        className={`${styles.wrapper} rounded-full object-cover ${className}`.trim()}
      />
    )
  }

  return (
    <div
      className={`flex ${styles.wrapper} items-center justify-center rounded-full bg-slate-200 text-slate-500 ${className}`.trim()}
    >
      <UserCircleIcon className={styles.icon} />
    </div>
  )
}
