//DashboardPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TitleBar from '../components/TitleBar.jsx'

/* ── Nav item definitions ── */
const NAV_ITEMS = [
  {
    key: 'dashboard', label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
      </svg>
    ),
  },
  {
    key: 'exams', label: 'Exams',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
        <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z"/>
        <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
      </svg>
    ),
  },
  {
    key: 'students', label: 'Students',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zm5 2a2 2 0 11-4 0 2 2 0 014 0zM2 8a2 2 0 114 0 2 2 0 01-4 0zm-.5 8a1 1 0 01-1-1 6 6 0 0112 0 1 1 0 01-1 1h-10z"/>
      </svg>
    ),
  },
  {
    key: 'halls', label: 'Exam Halls',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1a1 1 0 000 2h2a1 1 0 100-2H7zm0 4a1 1 0 000 2h2a1 1 0 100-2H7zm6-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 100 2h.01a1 1 0 100-2H12z" clipRule="evenodd"/>
      </svg>
    ),
  },
  {
    key: 'seating', label: 'Seating Plans',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zm6-8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z"/>
      </svg>
    ),
  },
  {
    key: 'reports', label: 'Reports',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
      </svg>
    ),
  },
]

const STAT_CARDS = [
  {
    key: 'exams', label: 'Total Exams', value: '0', trend: '—', trendType: 'neutral',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20 }}>
      <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z"/>
    </svg>,
    accent: true,
  },
  {
    key: 'students', label: 'Enrolled Students', value: '0', trend: '—', trendType: 'neutral',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20 }}>
      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zm5 2a2 2 0 11-4 0 2 2 0 014 0zM2 8a2 2 0 114 0 2 2 0 01-4 0zm-.5 8a1 1 0 01-1-1 6 6 0 0112 0 1 1 0 01-1 1h-10z"/>
    </svg>,
  },
  {
    key: 'halls', label: 'Exam Halls', value: '0', trend: '—', trendType: 'neutral',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20 }}>
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" clipRule="evenodd"/>
    </svg>,
  },
  {
    key: 'seating', label: 'Seating Plans', value: '0', trend: '—', trendType: 'neutral',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20 }}>
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zm6 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z"/>
    </svg>,
  },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState('dashboard')
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const now = new Date()
    setCurrentDate(now.toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
    }))
  }, [])

  function handleLogout() {
    if (window.esms) window.esms.navigate('login')
    else navigate('/login')
  }

  const trendColors = {
    neutral: { bg: 'rgba(255,255,255,0.05)', color: 'var(--clr-text-dim)' },
    up:      { bg: 'rgba(52,211,153,0.12)',  color: 'var(--clr-success)' },
    down:    { bg: 'rgba(248,113,113,0.12)', color: 'var(--clr-error)' },
  }

  return (
    <>
      <TitleBar title="ESMS — Dashboard" />

      <div
        className="flex w-screen h-screen overflow-hidden"
        style={{ paddingTop: 36 }}
      >
        {/* ── Sidebar ── */}
        <aside
          style={{
            width: 240, flexShrink: 0,
            background: 'var(--clr-surface)',
            borderRight: '1px solid var(--clr-border)',
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
            animation: 'fadeLeft 0.4s both',
          }}
        >
          {/* Brand */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '20px 20px 16px',
            borderBottom: '1px solid var(--clr-border)',
          }}>
            <div style={{ width: 32, height: 32, color: 'var(--clr-accent)', flexShrink: 0 }}>
              <svg viewBox="0 0 32 32" fill="none" style={{ width: '100%', height: '100%' }}>
                <rect x="2"  y="2"  width="12" height="12" rx="3" fill="currentColor" opacity=".9"/>
                <rect x="18" y="2"  width="12" height="12" rx="3" fill="currentColor" opacity=".5"/>
                <rect x="2"  y="18" width="12" height="12" rx="3" fill="currentColor" opacity=".5"/>
                <rect x="18" y="18" width="12" height="12" rx="3" fill="currentColor" opacity=".25"/>
              </svg>
            </div>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800,
              letterSpacing: '0.1em',
              background: 'linear-gradient(135deg, #a78bfa, #6366f1)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              ESMS
            </span>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }} role="navigation" aria-label="Main navigation">
            {NAV_ITEMS.map(item => {
              const isActive = activePage === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setActivePage(item.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: isActive ? 'var(--clr-accent-soft)' : 'none',
                    color: isActive ? 'var(--clr-accent-2)' : 'var(--clr-text-muted)',
                    fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: isActive ? 600 : 500,
                    textAlign: 'left', width: '100%', position: 'relative', overflow: 'hidden',
                    transition: 'background 140ms, color 140ms, transform 140ms',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--clr-accent-soft)'
                      e.currentTarget.style.color = 'var(--clr-text)'
                      e.currentTarget.style.transform = 'translateX(2px)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'none'
                      e.currentTarget.style.color = 'var(--clr-text-muted)'
                      e.currentTarget.style.transform = ''
                    }
                  }}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div style={{
                      position: 'absolute', left: 0, top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3, height: '60%',
                      background: 'var(--clr-accent)',
                      borderRadius: '0 2px 2px 0',
                    }}/>
                  )}
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Logout */}
          <div style={{ padding: '12px 10px', borderTop: '1px solid var(--clr-border)' }}>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 14px',
                border: 'none', background: 'none', borderRadius: 10,
                color: 'var(--clr-text-muted)', fontFamily: 'var(--font-body)',
                fontSize: 14, fontWeight: 500, cursor: 'pointer',
                transition: 'background 140ms, color 140ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = 'var(--clr-error)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--clr-text-muted)' }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main
          className="main-content-scroll"
          style={{
            flex: 1,
            background: 'var(--clr-bg)',
            padding: '28px 32px',
            display: 'flex', flexDirection: 'column', gap: 24,
            animation: 'fadeRight 0.4s both',
          }}
        >
          {/* Page header */}
          <header style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            animation: 'fadeUp 0.4s 0.05s both',
          }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800,
                color: 'var(--clr-text)', letterSpacing: '-0.02em',
              }}>
                {NAV_ITEMS.find(n => n.key === activePage)?.label || 'Dashboard'}
              </h1>
              <p style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginTop: 4 }}>
                Welcome back, Admin. Here's your overview.
              </p>
            </div>
            <div style={{
              fontSize: 13, color: 'var(--clr-text-dim)',
              background: 'var(--clr-surface)',
              border: '1px solid var(--clr-border)',
              padding: '6px 14px', borderRadius: 10,
            }}>
              {currentDate}
            </div>
          </header>

          {/* Stat cards */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
            }}
            aria-label="Overview statistics"
          >
            {STAT_CARDS.map((card, i) => (
              <div
                key={card.key}
                style={{
                  background: card.accent
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(167,139,250,0.06))'
                    : 'var(--clr-surface)',
                  border: card.accent
                    ? '1px solid var(--clr-border-glow)'
                    : '1px solid var(--clr-border)',
                  borderRadius: 16, padding: 20,
                  display: 'flex', alignItems: 'center', gap: 16,
                  transition: 'transform 220ms, box-shadow 220ms, border-color 220ms',
                  animation: `fadeUp 0.4s ${i * 0.05 + 0.05}s both`,
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.55)'
                  e.currentTarget.style.borderColor = 'var(--clr-border-glow)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.boxShadow = ''
                  e.currentTarget.style.borderColor = card.accent ? 'var(--clr-border-glow)' : 'var(--clr-border)'
                }}
              >
                <div style={{
                  width: 40, height: 40,
                  background: 'var(--clr-accent-soft)',
                  borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--clr-accent-2)',
                }}>
                  {card.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.07em',
                    textTransform: 'uppercase', color: 'var(--clr-text-muted)',
                    display: 'block',
                  }}>
                    {card.label}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
                    color: 'var(--clr-text)', display: 'block', lineHeight: 1.1, marginTop: 4,
                  }}>
                    {card.value}
                  </span>
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 600, padding: '3px 8px', borderRadius: 24,
                  flexShrink: 0,
                  background: trendColors[card.trendType].bg,
                  color: trendColors[card.trendType].color,
                }}>
                  {card.trend}
                </div>
              </div>
            ))}
          </section>

          {/* Placeholder content */}
          <section style={{
            flex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 16,
            background: 'var(--clr-surface)',
            border: '1px dashed var(--clr-border)',
            borderRadius: 24, minHeight: 260,
            textAlign: 'center', padding: 36,
            animation: 'fadeUp 0.4s 0.25s both',
          }}>
            <div style={{ color: 'var(--clr-accent)', opacity: 0.4, animation: 'float 5s ease-in-out infinite' }}>
              <svg viewBox="0 0 64 64" fill="none" style={{ width: 64, height: 64 }}>
                <rect x="8"  y="8"  width="20" height="20" rx="4" fill="currentColor" opacity=".5"/>
                <rect x="36" y="8"  width="20" height="20" rx="4" fill="currentColor" opacity=".3"/>
                <rect x="8"  y="36" width="20" height="20" rx="4" fill="currentColor" opacity=".3"/>
                <rect x="36" y="36" width="20" height="20" rx="4" fill="currentColor" opacity=".15"/>
              </svg>
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
              color: 'var(--clr-text-muted)',
            }}>
              {NAV_ITEMS.find(n => n.key === activePage)?.label} content goes here
            </h3>
            <p style={{ fontSize: 13, color: 'var(--clr-text-dim)', maxWidth: 340, lineHeight: 1.7 }}>
              Add charts, tables, recent activity, and more in{' '}
              <code style={{
                fontFamily: 'Courier New, monospace',
                background: 'var(--clr-accent-soft)',
                border: '1px solid var(--clr-border-glow)',
                color: 'var(--clr-accent-2)',
                padding: '1px 6px', borderRadius: 4, fontSize: 12,
              }}>
                DashboardPage.jsx
              </code>
            </p>
          </section>
        </main>
      </div>
    </>
  )
}
