import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  formatMoney,
  getToday,
  isValidDate,
  useFinance,
} from '../context/FinanceContext'
import './Transactions.css'

const incomeCategories = ['Salary', 'Freelance', 'Gift', 'Other']
const expenseCategories = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Health',
  'Entertainment',
  'Other',
]

export default function Transactions() {
  const {
    transactions,
    storageError,
    storageBlocked,
    addTransaction,
    deleteTransaction,
  } = useFinance()

  const [title, setTitle] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [category, setCategory] = useState('Food')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(getToday)
  const [formError, setFormError] = useState('')
  const [message, setMessage] = useState('')

  const categories =
    type === 'income' ? incomeCategories : expenseCategories

  const sortedTransactions = [...transactions].sort(
    (a, b) => b.date.localeCompare(a.date),
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    setMessage('')

    if (!title.trim()) {
      setFormError('Please enter a transaction title.')
      return
    }

    if (!/^\d+(\.\d{1,2})?$/.test(amount.trim())) {
      setFormError('Enter an amount with up to two decimal places.')
      return
    }

    const amountInCents = Math.round(Number(amount) * 100)

    if (
      !Number.isSafeInteger(amountInCents) ||
      amountInCents <= 0 ||
      amountInCents > 100_000_000_000
    ) {
      setFormError('Enter an amount between LKR 0.01 and LKR 1 billion.')
      return
    }

    if (!isValidDate(date) || date > getToday()) {
      setFormError('Choose a valid date on or before today.')
      return
    }

    const saved = addTransaction({
      title: title.trim(),
      type,
      category,
      amount: amountInCents,
      date,
    })

    if (saved) {
      setTitle('')
      setAmount('')
      setMessage('Transaction saved successfully!')
    }
  }

  function handleDelete(id: string, transactionTitle: string) {
    if (!window.confirm(`Delete "${transactionTitle}"?`)) return

    setMessage('')
    setFormError('')

    if (deleteTransaction(id)) {
      setMessage('Transaction deleted.')
    }
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">MAKE EVERY TRANSACTION COUNT</p>
          <h1>Transactions</h1>
          <p className="subtitle">
            Record your income and expenses in one place.
          </p>
        </div>

        <span className="transaction-count">
          {transactions.length} saved entries
        </span>
      </div>

      {storageError && (
        <p className="storage-error" role="alert">
          {storageError}
        </p>
      )}

      {message && (
        <p className="success-message" role="status">
          {message}
        </p>
      )}

      <div className="transactions-layout">
        <article className="panel transaction-form-panel">
          <h2>✨ Add a transaction</h2>
          <p className="form-intro">
            A small update keeps your money story clear.
          </p>

          <form onSubmit={handleSubmit}>
            <fieldset disabled={storageBlocked} className="transaction-fields">
              <div className="form-field">
                <label htmlFor="transaction-title">Title</label>
                <input
                  id="transaction-title"
                  type="text"
                  placeholder="Lunch, salary, bus fare..."
                  maxLength={100}
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="transaction-type">Transaction type</label>
                <select
                  id="transaction-type"
                  value={type}
                  onChange={(event) => {
                    const nextType =
                      event.target.value === 'income' ? 'income' : 'expense'

                    setType(nextType)
                    setCategory(nextType === 'income' ? 'Salary' : 'Food')
                  }}
                >
                  <option value="expense">Expense — money going out</option>
                  <option value="income">Income — money coming in</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="transaction-category">Category</label>
                <select
                  id="transaction-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="transaction-amount">Amount in LKR</label>
                <input
                  id="transaction-amount"
                  type="number"
                  min="0.01"
                  max="1000000000"
                  step="0.01"
                  placeholder="0.00"
                  required
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="transaction-date">Date</label>
                <input
                  id="transaction-date"
                  type="date"
                  min="1900-01-01"
                  max={getToday()}
                  required
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </div>

              {formError && (
                <p className="storage-error" role="alert">{formError}</p>
              )}

              <button className="primary-button save-button" type="submit">
                Save transaction
              </button>
            </fieldset>
          </form>
        </article>

        <article className="panel transaction-history">
          <h2>Your money story</h2>
          <p className="form-intro">All entries, with the latest dates first.</p>

          {sortedTransactions.length === 0 ? (
            <div className="transaction-empty">
              <span aria-hidden="true">🌱</span>
              <h3>Your story starts here</h3>
              <p>Add your first income or expense using the form.</p>
            </div>
          ) : (
            <ul className="transaction-list">
              {sortedTransactions.map((transaction) => (
                <li className="transaction-item" key={transaction.id}>
                  <span
                    className={`transaction-icon ${transaction.type}`}
                    aria-hidden="true"
                  >
                    {transaction.type === 'income' ? '↗' : '↘'}
                  </span>

                  <div className="transaction-description">
                    <h3>{transaction.title}</h3>
                    <p>
                      {transaction.category} ·{' '}
                      <time dateTime={transaction.date}>{transaction.date}</time>
                    </p>
                    <span className={`type-label ${transaction.type}`}>
                      {transaction.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </div>

                  <div className="transaction-actions">
                    <strong className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '−'}
                      {formatMoney(transaction.amount)}
                    </strong>

                    <button
                      type="button"
                      className="delete-button"
                      disabled={storageBlocked}
                      aria-label={`Delete ${transaction.title}`}
                      onClick={() =>
                        handleDelete(transaction.id, transaction.title)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  )
}