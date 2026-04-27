const SIZE_CLASSES = {
  page: 'max-w-5xl',
  wide: 'max-w-7xl',
  content: 'max-w-4xl',
  narrow: 'max-w-3xl',
  compact: 'max-w-2xl',
  auth: 'max-w-md',
}

export default function PageContainer({
  children,
  size = 'page',
  className = '',
  contentClassName = '',
  as = 'main',
}) {
  const widthClass = SIZE_CLASSES[size] || SIZE_CLASSES.page
  const Tag = as

  return (
    <Tag
      className={`mx-auto w-full ${widthClass} px-3 py-4 md:px-4 md:py-5 xl:px-5 ${className}`.trim()}
    >
      <div className={`space-y-4 md:space-y-5 ${contentClassName}`.trim()}>{children}</div>
    </Tag>
  )
}