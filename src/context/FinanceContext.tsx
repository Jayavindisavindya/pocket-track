import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type Transaction = {
  id: string
  title: string
  type: 'income' | 'expense'
  category: string
  amount: number
  date: string
}

// Amounts are stored in cents to keep calculations accurate.
const STORAGE_KEY = 'pockettrack-transactions-v1'

export function getToday() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return (
    year >= 1900 &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

export function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

function isTransaction(value: unknown): value is Transaction {
  if (typeof value !== 'object' || value === null) return false

  const item = value as Record<string, unknown>

  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.title === 'string' &&
    item.title.trim().length > 0 &&
    item.title.length <= 100 &&
    (item.type === 'income' || item.type === 'expense') &&
    typeof item.category === 'string' &&
    item.category.length > 0 &&
    typeof item.amount === 'number' &&
    Number.isSafeInteger(item.amount) &&
    item.amount > 0 &&
    typeof item.date === 'string' &&
    isValidDate(item.date)
  )
}

function loadTransactions(): {
  transactions: Transaction[]
  error: string
} {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved === null) {
      return { transactions: [], error: '' }
    }

    const parsed: unknown = JSON.parse(saved)

    if (!Array.isArray(parsed) || !parsed.every(isTransaction)) {
      throw new Error('Invalid saved transactions')
    }

    if (new Set(parsed.map((item) => item.id)).size !== parsed.length) {
      throw new Error('Duplicate saved transactions')
    }

    return { transactions: parsed, error: '' }
  } catch {
    return {
      transactions: [],
      error:
        'Saved transactions could not be loaded. Changes are disabled to protect existing data. Check your browser storage and reload.',
    }
  }
}

type FinanceContextValue = {
  transactions: Transaction[]
  storageError: string
  storageBlocked: boolean
  addTransaction: (item: Omit<Transaction, 'id'>) => boolean
  deleteTransaction: (id: string) => boolean
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadTransactions)
  const [transactions, setTransactions] = useState(initial.transactions)
  const [storageError, setStorageError] = useState(initial.error)
  const storageBlocked = Boolean(initial.error)

  function saveTransactions(next: Transaction[]) {
    if (storageBlocked) return false

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setTransactions(next)
      setStorageError('')
      return true
    } catch {
      setStorageError(
        'Your changes could not be saved. Browser storage may be unavailable or full. Please try again.',
      )
      return false
    }
  }

  function addTransaction(item: Omit<Transaction, 'id'>) {
    const transaction = {
      ...item,
      id: crypto.randomUUID(),
    }

    if (!isTransaction(transaction)) return false

    return saveTransactions([transaction, ...transactions])
  }

  function deleteTransaction(id: string) {
    return saveTransactions(
      transactions.filter((transaction) => transaction.id !== id),
    )
  }

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        storageError,
        storageBlocked,
        addTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)

  if (!context) {
    throw new Error('useFinance must be used inside FinanceProvider')
  }

  return context
}