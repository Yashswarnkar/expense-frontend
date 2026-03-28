import { sourceLabel } from '../utils'

export interface FilterState {
  search: string
  category: string
  source: string
  from: string
  to: string
}

interface Props {
  filters: FilterState
  categories: string[]
  onChange: (filters: FilterState) => void
  onClear: () => void
}

const SOURCES = ['au_bank', 'hdfc_cc', 'amazon_pay_cc']

export default function Filters({ filters, categories, onChange, onClear }: Props) {
  function set<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    onChange({ ...filters, [key]: value })
  }

  const hasFilters =
    filters.search || filters.category || filters.source || filters.from || filters.to

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search */}
      <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
        <label className="text-xs text-slate-400 font-medium">Search</label>
        <input
          type="text"
          placeholder="Filter by description…"
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600"
        />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-1 min-w-[160px]">
        <label className="text-xs text-slate-400 font-medium">Category</label>
        <select
          value={filters.category}
          onChange={(e) => set('category', e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-600"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Source */}
      <div className="flex flex-col gap-1 min-w-[140px]">
        <label className="text-xs text-slate-400 font-medium">Source</label>
        <select
          value={filters.source}
          onChange={(e) => set('source', e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-600"
        >
          <option value="">All sources</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>{sourceLabel(s)}</option>
          ))}
        </select>
      </div>

      {/* From date */}
      <div className="flex flex-col gap-1 min-w-[140px]">
        <label className="text-xs text-slate-400 font-medium">From</label>
        <input
          type="date"
          value={filters.from}
          onChange={(e) => set('from', e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-600 [color-scheme:dark]"
        />
      </div>

      {/* To date */}
      <div className="flex flex-col gap-1 min-w-[140px]">
        <label className="text-xs text-slate-400 font-medium">To</label>
        <input
          type="date"
          value={filters.to}
          onChange={(e) => set('to', e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-600 [color-scheme:dark]"
        />
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700 transition-colors self-end"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>
      )}
    </div>
  )
}
