import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { SpendingCategory } from '../types'
import { categoryChartColor, formatCurrency } from '../utils'

interface Props {
  data: SpendingCategory[]
}

function CustomTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-slate-300 font-medium mb-1">{payload[0].name}</p>
      <p className="text-slate-100 font-bold">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload) return null
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-slate-400 truncate max-w-[100px]">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function SpendingPieChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        No spending data for this period.
      </div>
    )
  }

  // Top 12 categories + "Other" (exclude zero/negative net_spend — Recharts drops them silently)
  const sorted = [...data]
    .filter((c) => c.net_spend > 0)
    .sort((a, b) => b.net_spend - a.net_spend)
  const top = sorted.slice(0, 12)
  const otherTotal = sorted.slice(12).reduce((s, c) => s + c.net_spend, 0)
  const chartData = otherTotal > 0
    ? [...top, { category: 'Other', net_spend: otherTotal } as SpendingCategory]
    : top

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="net_spend"
          nameKey="category"
          cx="50%"
          cy="42%"
          outerRadius={90}
          innerRadius={44}
          strokeWidth={2}
          stroke="#0f172a"
        >
          {chartData.map((entry) => (
            <Cell key={entry.category} fill={categoryChartColor(entry.category)} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
