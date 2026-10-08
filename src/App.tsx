import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
} from 'react-router'

import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budget from './pages/Budget'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <aside className="sidebar">
          <Link className="brand" to="/">
            <span className="brand-mark" aria-hidden="true">P</span>
            <span>
              PocketTrack
              <small>Your everyday money companion</small>
            </span>
          </Link>

          <nav className="navigation" aria-label="Main navigation">
            <NavLink to="/" end>
              <span aria-hidden="true">▦</span>
              Dashboard
            </NavLink>

            <NavLink to="/transactions">
              <span aria-hidden="true">↔</span>
              Transactions
            </NavLink>

            <NavLink to="/budget">
              <span aria-hidden="true">◎</span>
              Monthly budget
            </NavLink>
          </nav>

          <div className="sidebar-note">
            <strong>Build better habits.</strong>
            <p>Every little transaction tells a story.</p>
          </div>
        </aside>

        <div className="main-area">
          <header className="topbar">
            <span>Personal finance, made simple.</span>
            <span className="currency-badge">LKR · Sri Lankan rupees</span>
          </header>

          <main className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budget" element={<Budget />} />

              <Route
                path="*"
                element={
                  <section className="panel welcome-panel">
                    <h1>Page not found</h1>
                    <p>Choose a page from the navigation.</p>
                    <Link className="text-link" to="/">
                      Go to dashboard →
                    </Link>
                  </section>
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App