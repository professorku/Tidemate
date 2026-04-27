import { Link } from 'react-router-dom'

export default function BaseBoatCard({
  to,
  className = '',
  bodyClassName = 'p-5',
  media,
  content,
  footer,
  actionSlot,
  children,
  ...rest
}) {
  return (
    <article
      {...rest}
      className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`.trim()}
    >
      {to ? (
        <Link
          to={to}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          {media}
          {(content || footer || children) ? (
            <div className={bodyClassName}>
              {content}
              {children}
              {footer}
            </div>
          ) : null}
        </Link>
      ) : (
        <>
          {media}
          {(content || footer || children) ? (
            <div className={bodyClassName}>
              {content}
              {children}
              {footer}
            </div>
          ) : null}
        </>
      )}

      {actionSlot}
    </article>
  )
}
