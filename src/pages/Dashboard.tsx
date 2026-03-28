import { useEffect, useState } from 'react'
import { getSummary } from '../api/client'
import type { SummaryResponse } from '../types'
import MonthSelector from '../components/MonthSelector'
import SpendingBarChart from '../components/SpendingBarChart'
import SpendingPieChart from '../components/SpendingPieChart'
import { formatCurrency, monthBounds, monthLabel } from '../utils'

function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string
  value: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-900 border-slate-800'}`}>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ? 'text-emerald-400' : 'text-slate-100'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const { from, to } = monthBounds(year, month)
    getSummary(from, to)
      .then((data) => {
        setSummary(data)
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load summary')
        setLoading(false)
      })
  }, [year, month])

  const totalSpend = summary?.spending.reduce((s, c) => s + c.net_spend, 0) ?? 0
  const totalCC = summary?.cc_payments.reduce((s, c) => s + c.net_spend, 0) ?? 0
  const totalCCCount = summary?.cc_payments.reduce((s, c) => s + c.count, 0) ?? 0
  const categoryCount = summary?.spending.length ?? 0

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Spending overview · {monthLabel(year, month)}</p>
        </div>
        <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m) }} />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-rose-950/50 border border-rose-800 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-slate-800 h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Spend"
            value={formatCurrency(totalSpend)}
            sub={`${monthLabel(year, month)} · ${categoryCount} categories`}
          />
          <StatCard
            label="CC Payments"
            value={formatCurrency(totalCC)}
            sub={`${totalCCCount} payment${totalCCCount !== 1 ? 's' : ''}`}
            accent
          />
          <div className="rounded-xl border bg-slate-900 border-slate-800 p-5">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">
              CC Payment breakdown
            </p>
            {summary?.cc_payments.length ? (
              <ul className="space-y-1.5 mt-2">
                {summary.cc_payments.map((p) => (
                  <li key={p.category} className="flex justify-between text-sm">
                    <span className="text-slate-400 truncate max-w-[160px]">{p.category}</span>
                    <span className="text-slate-200 font-medium">{formatCurrency(p.net_spend)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 mt-2">No CC payments found.</p>
            )}
          </div>
        </div>
      )}

      {/* Charts */}
      {!loading && summary && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Bar chart */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Spending by Category</h2>
            <SpendingBarChart data={summary.spending} />
          </div>

          {/* Pie chart */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Category Distribution</h2>
            <SpendingPieChart data={summary.spending} />
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-pulse">
          <div className="rounded-xl bg-slate-800 h-80" />
          <div className="rounded-xl bg-slate-800 h-80" />
        </div>
      )}
    </div>
  )
}
