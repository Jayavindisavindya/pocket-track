import { Link } from 'react-router'
import {
  formatMoney,
  getToday,
  useFinance,
} from '../context/FinanceContext'

export default function Dashboard() {
  const { transactions, storageError, storageBlocked } = useFinance()

  const currentMonth = getToday().slice(0, 7)

  const monthlyTransactions = transactions.filter(
    (transaction) => transaction.date.startsWith(currentMonth),
  )

  const income = monthlyTransactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0)

  const expenses = monthlyTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0)

  const balance = income - expenses

  return (
    <section>
      {storageError && (
        <p className="storage-error" role="alert">
          {storageError}
        </p>
      )}

      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR MONEY. YOUR POSSIBILITIES.</p>

          <h1>My money overview</h1>

          <p className="subtitle">
            Make today a little smarter and tomorrow a little brighter.
          </p>
        </div>

        <Link className="primary-button" to="/transactions">
          + Add transaction
        </Link>
      </div>

      <section
        className="dashboard-hero"
        aria-labelledby="hero-heading"
      >
        <div className="hero-copy">
          <span className="hero-badge">
            ✨ A fresh start for your finances
          </span>

          <h2 id="hero-heading">
            Little habits.
            <br />
            Big possibilities.
          </h2>

          <p>
            Bring your income, spending, and monthly plans together
            in one happy place.
          </p>

          <Link className="hero-button" to="/transactions">
            Explore transactions
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="hero-picture">
          <span className="picture-fallback" aria-hidden="true">
            🌿
          </span>

          <img
            src="https://images.unsplash.com/photo-1762831063004-bbd3ea38ba3a?auto=format&fit=crop&w=900&q=85"
            alt="A calculator and notebook arranged on a desk with a plant"
            width={900}
            height={900}
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />

          <span className="picture-caption">
            A little planning goes a long way.
          </span>
        </div>
      </section>

      <div className="summary-grid">
        <article className="summary-card income-card">
          <div className="card-top">
            <span className="card-icon" aria-hidden="true">
              ↗
            </span>

            <span className="card-tag">INCOME</span>
          </div>

          <p>Monthly income</p>

          <h2>
            {storageBlocked ? '—' : formatMoney(income)}
          </h2>

          <small>Every little earning counts</small>
        </article>

        <article className="summary-card expense-card">
          <div className="card-top">
            <span className="card-icon" aria-hidden="true">
              ↘
            </span>

            <span className="card-tag">EXPENSES</span>
          </div>

          <p>Monthly expenses</p>

          <h2>
            {storageBlocked ? '—' : formatMoney(expenses)}
          </h2>

          <small>Know where your money goes</small>
        </article>

        <article className="summary-card balance-card">
          <div className="card-top">
            <span className="card-icon" aria-hidden="true">
              ◎
            </span>

            <span className="card-tag">BALANCE</span>
          </div>

          <p>Monthly balance</p>

          <h2>
            {storageBlocked ? '—' : formatMoney(balance)}
          </h2>

          <small>Income minus expenses</small>
        </article>
      </div>

      <div className="dashboard-bottom">
        <article className="panel welcome-panel">
          <span className="welcome-icon" aria-hidden="true">
            🧾
          </span>

          <h2>Every transaction tells a story</h2>

          <p>
            Your cards show income, expenses, and balance for the
            current month. Visit Transactions to see your complete
            history.
          </p>

          <Link className="text-link" to="/transactions">
            Visit transactions →
          </Link>
        </article>

        <article className="budget-promo">
          <div className="promo-picture">
            <span className="picture-fallback" aria-hidden="true">
              🐷
            </span>

            <img
              src="https://images.unsplash.com/photo-1768839721719-c5ed97c1fd58?auto=format&fit=crop&w=700&q=85"
              alt="Coins falling into a white piggy bank"
              width={700}
              height={500}
              loading="lazy"
              decoding="async"
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
            />
          </div>

          <div className="promo-copy">
            <span className="eyebrow">PLAN WITH PURPOSE</span>

            <h2>Make room for your dreams.</h2>

            <p>
              Give your monthly spending a clear direction.
            </p>

            <Link className="text-link" to="/budget">
              Explore your budget →
            </Link>
          </div>
        </article>
      </div>

      <p className="photo-credit">
        Photography from{' '}
        <a
          href="https://unsplash.com"
          target="_blank"
          rel="noreferrer"
        >
          Unsplash
        </a>
      </p>
    </section>
  )
}