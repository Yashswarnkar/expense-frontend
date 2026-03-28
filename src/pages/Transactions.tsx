import { useCallback, useEffect, useRef, useState } from 'react'
import { getCategories, getTransactions, patchTransactionCategory } from '../api/client'
import type { Transaction } from '../types'
import CategoryBadge from '../components/CategoryBadge'
import Filters, { type FilterState } from '../components/Filters'
import { formatCurrency, formatDate, sourceLabel } from '../utils'

const PAGE_SIZE = 25

type SortField = 'transaction_date' | 'amount'
type SortDir = 'asc' | 'desc'

const EMPTY_FILTERS: FilterState = {
  search: '',
  category: '',
  source: '',
  from: '',
  to: '',
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [sortField, setSortField] = useState<SortField>('transaction_date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setDebouncedSearch(filters.search), 350)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [filters.search])

  // Load categories once
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {/* non-fatal */})
  }, [])

  // Fetch transactions whenever filters/page/sort change
  useEffect(() => {
    setLoading(true)
    setError(null)
    getTransactions({
      category: filters.category || undefined,
      source: filters.source || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      search: debouncedSearch || undefined,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    })
      .then((res) => {
        setTransactions(res.transactions ?? [])
        setTotal(res.total ?? 0)
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load transactions')
        setLoading(false)
      })
  }, [filters.category, filters.source, filters.from, filters.to, debouncedSearch, page])

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [filters, debouncedSearch])

  // Optimistic category update — use functional updater so we don't need
  // `transactions` in the dep array; we only need it to read `prev` before
  // the update, which is fine since it captures the current closure.
  const handleCategoryChange = useCallback(async (id: string, newCategory: string) => {
    let prev = ''
    setTransactions((ts) => {
      prev = ts.find((t) => t.id === id)?.category ?? ''
      return ts.map((t) => (t.id === id ? { ...t, category: newCategory } : t))
    })
    try {
      await patchTransactionCategory(id, newCategory)
    } catch {
      // Revert on error
      setTransactions((ts) =>
        ts.map((t) => (t.id === id ? { ...t, category: prev } : t))
      )
    }
  }, [])

  // Client-side sort (server doesn't expose sort params in spec)
  const sorted = [...transactions].sort((a, b) => {
    let cmp = 0
    if (sortField === 'transaction_date') {
      cmp = a.transaction_date.localeCompare(b.transaction_date)
    } else {
      cmp = a.amount - b.amount
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const showing = Math.min(page * PAGE_SIZE + transactions.length, total)

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) {
      return (
        <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortDir === 'asc' ? (
      <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100">Transactions</h1>
        <p className="text-sm text-slate-500 mt-0.5">Browse and categorise your transactions</p>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <Filters
          filters={filters}
          categories={categories}
          onChange={(f) => setFilters(f)}
          onClear={() => setFilters(EMPTY_FILTERS)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-rose-950/50 border border-rose-800 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Count bar */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          {loading ? (
            'Loading…'
          ) : (
            <>
              Showing <span className="text-slate-300 font-medium">{showing}</span> of{' '}
              <span className="text-slate-300 font-medium">{total}</span> transactions
            </>
          )}
        </span>
        {totalPages > 1 && (
          <span>
            Page {page + 1} of {totalPages}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <button
                    onClick={() => toggleSort('transaction_date')}
                    className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
                  >
                    Date <SortIcon field="transaction_date" />
                  </button>
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Description
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <button
                    onClick={() => toggleSort('amount')}
                    className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
                  >
                    Amount <SortIcon field="amount" />
                  </button>
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Type
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Category
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Source
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-800 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                sorted.map((tx) => {
                  const uncategorized = !tx.category || tx.category === 'Uncategorized'
                  return (
                    <tr
                      key={tx.id}
                      className={`transition-colors hover:bg-slate-800/40 ${
                        uncategorized ? 'bg-yellow-950/20' : ''
                      }`}
                    >
                      {/* Date */}
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">
                        {formatDate(tx.transaction_date)}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 text-slate-200 max-w-xs">
                        <span className="truncate block" title={tx.description}>
                          {tx.description}
                        </span>
                        {tx.reference_no && (
                          <span className="text-xs text-slate-600 block truncate">{tx.reference_no}</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className={`px-4 py-3 font-medium whitespace-nowrap ${
                        tx.type === 'credit' ? 'text-emerald-400' : 'text-slate-100'
                      }`}>
                        {tx.type === 'credit' ? '+' : '−'}{formatCurrency(tx.amount)}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          tx.type === 'credit'
                            ? 'bg-emerald-900/50 text-emerald-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {tx.type}
                        </span>
                      </td>

                      {/* Category — inline edit */}
                      <td className="px-4 py-3">
                        <CategoryBadge
                          category={tx.category || 'Uncategorized'}
                          categories={categories}
                          onSave={(cat) => handleCategoryChange(tx.id, cat)}
                          editable={categories.length > 0}
                        />
                      </td>

                      {/* Source */}
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {sourceLabel(tx.source)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {/* Page numbers — show a window around current page */}
          {Array.from({ length: totalPages }).map((_, i) => {
            if (i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 2) {
              return (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    i === page
                      ? 'bg-slate-700 text-slate-100'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {i + 1}
                </button>
              )
            }
            if (Math.abs(i - page) === 3) {
              return <span key={i} className="text-slate-600">…</span>
            }
            return null
          })}

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
