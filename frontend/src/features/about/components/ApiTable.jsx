function getRouteLabel(group, endpoint) {
  if (!endpoint || endpoint === '/') {
    return group.basePath
  }

  if (endpoint.startsWith('/api/') || endpoint.startsWith('/ws/')) {
    return endpoint
  }

  return `${group.basePath}${endpoint}`
}

export default function ApiTable({ group }) {
  return (
    <section className="border-t border-white/10 py-9">
      <div className="max-w-4xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold">
          {group.basePath}
        </p>

        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
          {group.title}
        </h2>

        <p className="mt-4 text-base leading-8 text-white/72">
          {group.description}
        </p>
      </div>

      <div className="mt-5 max-w-6xl overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.16em] text-white/45">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 font-extrabold">
                Method
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-extrabold">
                Route
              </th>
              <th className="min-w-[320px] px-4 py-3 font-extrabold">
                Purpose
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-extrabold">
                Access
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10 text-white/72">
            {group.rows.map(([method, endpoint, purpose, access]) => (
              <tr key={`${group.title}-${method}-${endpoint || group.basePath}`}>
                <td className="whitespace-nowrap px-4 py-3 align-top font-extrabold text-gold">
                  {method}
                </td>

                <td className="whitespace-nowrap px-4 py-3 align-top">
                  <code className="rounded-lg bg-white/10 px-2 py-1 text-xs text-white">
                    {getRouteLabel(group, endpoint)}
                  </code>
                </td>

                <td className="px-4 py-3 align-top leading-6">
                  {purpose}
                </td>

                <td className="whitespace-nowrap px-4 py-3 align-top text-white/55">
                  {access}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
