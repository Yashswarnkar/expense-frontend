import type {
  TransactionsResponse,
  SummaryResponse,
  PatchCategoryResponse,
  TransactionFilters,
} from '../types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<TransactionsResponse> {
  const params = new URLSearchParams()
  if (filters.category)  params.set('category', filters.category)
  if (filters.source)    params.set('source', filters.source)
  if (filters.from)      params.set('from', filters.from)
  if (filters.to)        params.set('to', filters.to)
  if (filters.search)    params.set('search', filters.search)
  if (filters.limit != null)  params.set('limit', String(filters.limit))
  if (filters.offset != null) params.set('offset', String(filters.offset))

  const qs = params.toString()
  return request<TransactionsResponse>(`/api/transactions${qs ? `?${qs}` : ''}`)
}

export async function patchTransactionCategory(
  id: string,
  category: string
): Promise<PatchCategoryResponse> {
  return request<PatchCategoryResponse>(`/api/transactions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ category }),
  })
}

export async function getSummary(): Promise<SummaryResponse> {
  return request<SummaryResponse>('/api/summary')
}

export async function getCategories(): Promise<string[]> {
  return request<string[]>('/api/categories')
}
