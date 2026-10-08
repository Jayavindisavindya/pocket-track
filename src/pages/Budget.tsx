import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import {
  formatMoney,
  getToday,
  useFinance,
} from '../context/FinanceContext'
import './Budget.css'

type BudgetMap = Record<string, number>

const STORAGE_KEY = 'pockettrack-budgets-v1'

function loadBudgets(): { budgets: BudgetMap; error: string } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved === null) {
      return { budgets: {}, error: '' }
    }

    const parsed: unknown = JSON.parse(saved)

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      throw new Error('Invalid budget data')
    }

    const valid = Object.entries(parsed).every(([month, amount]) => {
      return (
        /^\d{4}-(0[1-9]|1[0-2])$/.test(month) &&
        typeof amount === 'number' &&
        Number.isSafeInteger(amount) &&
        amount > 0 &&
        amount <= 100_000_000_000
      )
    })

    if (!valid) {
      throw new Error('Invalid saved budget')
    }

    return { budgets: parsed as BudgetMap, error: '' }
  } catch {
    return {
      budgets: {},
      error:
        'Saved budgets could not be loaded. Saving is disabled to protect existing data. Please check browser storage and reload.',
    }
  }
}

export default function Budget() {
  const { transactions, storageError, storageBlocked } = useFinance()

  const [initial] = useState(loadBudgets)
  const [budgets, setBudgets] = useState(initial.budgets)

  const currentMonth = getToday().slice(0, 7)
  const budget = budgets[currentMonth]

  const [amount, setAmount] = useState(() => {
    const savedBudget = initial.budgets[currentMonth]
    return savedBudget === undefined ? '' : (savedBudget / 100).toFixed(2)
  })

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const monthLabel = new Date(`${currentMonth}-01T12:00:00`)
    .toLocaleDateString('en-LK', {
      month: 'long',
      year: 'numeric',
    })

  const spent = transactions
    .filter(
      transaction =>
        transaction.type === 'expense' &&
        transaction.date.startsWith(currentMonth),
    )
    .reduce((total, transaction) => total + transaction.amount, 0)

  const unavailable = Boolean(initial.error) || storageBlocked
  const hasBudget = budget !== undefined
  const remaining = hasBudget ? budget - spent : 0
  const percentage = hasBudget ? (spent / budget) * 100 : 0
  const overBudget = hasBudget && remaining < 0

  const statusClass = overBudget
    ? 'budget-danger'
    : percentage >= 80
      ? 'budget-warning'
      : 'budget-safe'

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (unavailable) return

    const value = amount.trim()

    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
      setError('Enter a positive amount with up to two decimal places.')
      return
    }

    const cents = Math.round(Number(value) * 100)

    if (
      !Number.isSafeInteger(cents) ||
      cents <= 0 ||
      cents > 100_000_000_000
    ) {
      setError('Enter an amount between LKR 0.01 and LKR 1 billion.')
      return
    }

    const nextBudgets = {
      ...budgets,
      [currentMonth]: cents,
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBudgets))
      setBudgets(nextBudgets)
      setAmount((cents / 100).toFixed(2))
      setMessage(`Your budget for ${monthLabel} has been saved!`)
    } catch {
      setError('Your budget could not be saved. Please try again.')
    }
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">MAKE ROOM FOR WHAT MATTERS</p>
          <h1>Monthly budget</h1>
          <p className="subtitle">
            A little planning today. More freedom tomorrow.
          </p>
        </div>

        <span className="budget-month">{monthLabel}</span>
      </div>

      {storageError && (
        <p className="storage-error" role="alert">
          {storageError}
        </p>
      )}

      {initial.error && (
        <p className="storage-error" role="alert">
          {initial.error}
        </p>
      )}

      {message && (
        <p className="success-message" role="status">
          {message}
        </p>
      )}

      <div className="budget-layout">
        <article className="panel budget-editor">
          <span className="budget-illustration" aria-hidden="true">
            🎯
          </span>

          <h2>Give your money a plan</h2>
          <p>
            Choose how much you want to spend this month.
            You can update your limit whenever you need.
          </p>

          <form onSubmit={handleSave}>
            <label htmlFor="budget-amount">
              Monthly spending limit in LKR
            </label>

            <input
              id="budget-amount"
              type="text"
              inputMode="decimal"
              placeholder="For example, 10000"
              value={amount}
              onChange={event => setAmount(event.target.value)}
              maxLength={20}
              disabled={unavailable}
              required
            />

            {error && (
              <p className="storage-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="primary-button budget-save"
              disabled={unavailable}
            >
              {hasBudget ? 'Update budget' : 'Save budget'}
            </button>
          </form>

          <p className="budget-storage-note">
            Your monthly limits are saved in this browser.
          </p>
        </article>

        <article className={`panel budget-overview ${statusClass}`}>
          <div className="budget-overview-heading">
            <div>
              <p className="eyebrow">YOUR MONTH AT A GLANCE</p>
              <h2>Stay on track</h2>
            </div>

            <span aria-hidden="true">🌿</span>
          </div>

          {unavailable ? (
            <p className="budget-empty">
              Budget progress is unavailable until your saved data
              can be loaded.
            </p>
          ) : !hasBudget ? (
            <div className="budget-empty">
              <span aria-hidden="true">✨</span>
              <h3>A fresh plan starts here</h3>
              <p>
                Save your monthly limit to see your spending progress.
              </p>
              <p>
                Expenses recorded this month: <strong>{formatMoney(spent)}</strong>
              </p>
            </div>
          ) : (
            <>
              <div className="budget-numbers">
                <div>
                  <p>Monthly limit</p>
                  <strong>{formatMoney(budget)}</strong>
                </div>

                <div>
                  <p>Spent so far</p>
                  <strong>{formatMoney(spent)}</strong>
                </div>
              </div>

              <div className="budget-progress-label">
                <span>Budget used</span>
                <strong>{percentage.toFixed(1)}%</strong>
              </div>

              <progress
                className="budget-progress"
                value={Math.min(spent, budget)}
                max={budget}
                aria-label={`Monthly budget used: ${percentage.toFixed(1)} percent`}
              />

              <div className="budget-remaining">
                <p>{overBudget ? 'Over your budget by' : 'Remaining allowance'}</p>
                <h3>{formatMoney(Math.abs(remaining))}</h3>
              </div>

              <p className="budget-status">
                {overBudget
                  ? 'You have passed your limit. Review your expenses and adjust your plan.'
                  : remaining === 0
                    ? 'You have reached your monthly spending limit.'
                    : percentage >= 80
                      ? 'You are getting close to your limit. Keep an eye on your next expenses.'
                      : 'You are within your budget. Keep building those good habits!'}
              </p>
            </>
          )}

          <Link className="text-link" to="/transactions">
            View your transactions →
          </Link>
        </article>
      </div>
    </section>
  )
}