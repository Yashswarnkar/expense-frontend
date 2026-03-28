import { useEffect, useRef, useState } from 'react'
import { categoryColor } from '../utils'

interface Props {
  category: string
  categories: string[]
  onSave: (newCategory: string) => Promise<void>
  editable?: boolean
}

export default function CategoryBadge({ category, categories, onSave, editable = true }: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { bg, text } = categoryColor(category)
  const label = category || 'Uncategorized'

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function handleSelect(cat: string) {
    if (cat === category) {
      setOpen(false)
      return
    }
    setSaving(true)
    setOpen(false)
    try {
      await onSave(cat)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        disabled={!editable || saving}
        onClick={() => editable && setOpen((o) => !o)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-opacity ${bg} ${text} ${
          editable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
        } ${saving ? 'opacity-50' : ''}`}
        title={editable ? 'Click to change category' : undefined}
      >
        {saving ? (
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : null}
        {label}
        {editable && !saving && (
          <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-52 max-h-64 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
          {categories.map((cat) => {
            const { bg: cbg, text: ctxt } = categoryColor(cat)
            return (
              <button
                key={cat}
                onClick={() => handleSelect(cat)}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700 flex items-center gap-2 ${
                  cat === category ? 'bg-slate-700/50' : ''
                }`}
              >
                <span className={`inline-block w-2 h-2 rounded-full ${cbg.replace('/50', '').replace('bg-', 'bg-')}`} />
                <span className={ctxt}>{cat}</span>
                {cat === category && (
                  <svg className="w-3 h-3 ml-auto text-slate-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
