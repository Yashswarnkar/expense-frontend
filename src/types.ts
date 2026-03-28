export interface Transaction {
  id: string
  source: string
  transaction_date: string
  value_date: string
  description: string
  reference_no: string
  amount: number
  type: 'debit' | 'credit'
  balance: number
  category: string
  hash: string
  created_at: string
}

export interface TransactionsResponse {
  transactions: Transaction[]
  total: number
}

export interface SpendingCategory {
  category: string
  total_debit: number
  total_credit: number
  net_spend: number
  count: number
}

export interface SummaryResponse {
  spending: SpendingCategory[]
  cc_payments: SpendingCategory[]
}

export interface PatchCategoryResponse {
  id: string
  category: string
}

export interface TransactionFilters {
  category?: string
  source?: string
  from?: string
  to?: string
  search?: string
  limit?: number
  offset?: number
}
