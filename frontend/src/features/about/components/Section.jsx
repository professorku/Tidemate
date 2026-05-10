export default function Section({ title, children }) {
  return (
    <section className="border-t border-white/10 py-9">
      <h2 className="text-2xl font-extrabold tracking-tight text-white">
        {title}
      </h2>

      <div className="mt-4 max-w-4xl space-y-4 text-base leading-8 text-white/72">
        {children}
      </div>
    </section>
  )
}
