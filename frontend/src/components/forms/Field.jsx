import { inputClassName } from './fieldStyles'

export function Field({ label, htmlFor, children, className = '' }) {
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-slate-700">
          {label}
        </label>
      ) : null}
      {children}
    </div>
  )
}

export function Input({ className = '', ...props }) {
  return <input {...props} className={inputClassName(className)} />
}

export function Select({ className = '', ...props }) {
  return <select {...props} className={inputClassName(className)} />
}

export function Textarea({ className = '', ...props }) {
  return <textarea {...props} className={inputClassName(className)} />
}
