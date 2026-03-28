import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { SpendingCategory } from '../types'
import { categoryChartColor, formatCurrency } from '../utils'

interface Props {
  data: SpendingCategory[]
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-slate-300 font-medium mb-1">{label}</p>
      <p className="text-slate-100 font-bold">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export default function SpendingBarChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        No spending data for this period.
      </div>
    )
  }

  const sorted = [...data]
    .filter((c) => c.total_debit > 0)
    .sort((a, b) => b.total_debit - a.total_debit)

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={sorted} margin={{ top: 8, right: 16, left: 8, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="category"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          angle={-35}
          textAnchor="end"
          interval={0}
          height={70}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
        <Bar dataKey="total_debit" radius={[4, 4, 0, 0]}>
          {sorted.map((entry) => (
            <Cell key={entry.category} fill={categoryChartColor(entry.category)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
