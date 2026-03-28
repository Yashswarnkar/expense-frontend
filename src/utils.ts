/**
 * Format a number as Indian Rupees using Indian number formatting.
 */
export function formatCurrency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Map source identifier to a human-readable label.
 */
export function sourceLabel(source: string): string {
  switch (source) {
    case 'au_bank':
      return 'AU Bank'
    case 'hdfc_cc':
      return 'HDFC CC'
    case 'amazon_pay_cc':
      return 'Amazon Pay'
    default:
      return source
  }
}

/**
 * Return a consistent Tailwind background + text color class for a category.
 */
export function categoryColor(category: string): { bg: string; text: string } {
  const palette: Array<{ bg: string; text: string }> = [
    { bg: 'bg-blue-900/50',    text: 'text-blue-300' },
    { bg: 'bg-emerald-900/50', text: 'text-emerald-300' },
    { bg: 'bg-violet-900/50',  text: 'text-violet-300' },
    { bg: 'bg-rose-900/50',    text: 'text-rose-300' },
    { bg: 'bg-amber-900/50',   text: 'text-amber-300' },
    { bg: 'bg-cyan-900/50',    text: 'text-cyan-300' },
    { bg: 'bg-pink-900/50',    text: 'text-pink-300' },
    { bg: 'bg-teal-900/50',    text: 'text-teal-300' },
    { bg: 'bg-orange-900/50',  text: 'text-orange-300' },
    { bg: 'bg-indigo-900/50',  text: 'text-indigo-300' },
    { bg: 'bg-lime-900/50',    text: 'text-lime-300' },
    { bg: 'bg-fuchsia-900/50', text: 'text-fuchsia-300' },
  ]

  if (!category || category === 'Uncategorized' || category === '') {
    return { bg: 'bg-yellow-900/60', text: 'text-yellow-300' }
  }

  // Hash the category name to get a consistent index
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0
  }
  return palette[hash % palette.length]
}

/**
 * Return a hex color for Recharts charts (consistent per category).
 */
export function categoryChartColor(category: string): string {
  const colors = [
    '#60a5fa', // blue-400
    '#34d399', // emerald-400
    '#a78bfa', // violet-400
    '#fb7185', // rose-400
    '#fbbf24', // amber-400
    '#22d3ee', // cyan-400
    '#f472b6', // pink-400
    '#2dd4bf', // teal-400
    '#fb923c', // orange-400
    '#818cf8', // indigo-400
    '#a3e635', // lime-400
    '#e879f9', // fuchsia-400
  ]
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0
  }
  return colors[hash % colors.length]
}

/**
 * Format a date string (YYYY-MM-DD) to a more readable form.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const m = parseInt(month, 10) - 1
  return `${parseInt(day, 10)} ${months[m]} ${year}`
}

/**
 * Return the first and last day of the given month as YYYY-MM-DD strings.
 */
export function monthBounds(year: number, month: number): { from: string; to: string } {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { from, to }
}

/**
 * Display a month as "Dec 2025".
 */
export function monthLabel(year: number, month: number): string {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[month - 1]} ${year}`
}
