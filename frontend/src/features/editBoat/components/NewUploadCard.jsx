import { TrashIcon } from '@heroicons/react/24/outline'

export default function NewUploadCard({ item, index, onRemove }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200">
      <img src={item.url} alt={item.file.name} className="h-44 w-full object-cover" />

      <div className="p-4">
        <p className="truncate text-sm font-medium text-slate-700">{item.file.name}</p>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
        >
          <TrashIcon className="h-4 w-4" />
          Remove
        </button>
      </div>
    </div>
  )
}
