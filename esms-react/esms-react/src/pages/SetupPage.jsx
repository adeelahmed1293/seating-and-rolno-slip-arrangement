//SetupPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import TitleBar from '../components/TitleBar.jsx'
import BrandPanel from '../components/BrandPanel.jsx'

const REQS = [
  { key: 'len',     label: 'At least 8 characters',  test: p => p.length >= 8 },
  { key: 'upper',   label: 'One uppercase letter',    test: p => /[A-Z]/.test(p) },
  { key: 'num',     label: 'One number',              test: p => /[0-9]/.test(p) },
  { key: 'special', label: 'One special character',   test: p => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
]

const LEVELS = [
  { label: '—',      color: 'transparent', pct: 0   },
  { label: 'Weak',   color: '#f87171',     pct: 25  },
  { label: 'Fair',   color: '#fbbf24',     pct: 50  },
  { label: 'Good',   color: '#34d399',     pct: 75  },
  { label: 'Strong', color: '#4a8fd4',     pct: 100 },
]

function EyeShowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
    </svg>
  )
}
function EyeHideIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
    </svg>
  )
}

export default function SetupPage() {
  const navigate = useNavigate()

  const [newPass, setNewPass]       = useState('')
  const [confPass, setConfPass]     = useState('')
  const [showNew, setShowNew]       = useState(false)
  const [showConf, setShowConf]     = useState(false)
  const [alert, setAlert]           = useState({ msg: '', type: '', visible: false })
  const [loading, setLoading]       = useState(false)
  const [step, setStep]             = useState(1) // 1, 2, 3
  const [confErr, setConfErr]       = useState('')

  const newPassRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => newPassRef.current?.focus(), 300)
    return () => clearTimeout(t)
  }, [])

  const metReqs = REQS.map(r => r.test(newPass))
  const allMet = metReqs.every(Boolean)
  const strength = newPass.length === 0 ? 0 : Math.max(1, metReqs.filter(Boolean).length)
  const lvl = LEVELS[strength]
  const btnDisabled = !allMet || newPass !== confPass || newPass.length === 0 || loading

  function showAlert(msg, type = 'error') {
    setAlert({ msg, type, visible: true })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (newPass !== confPass) {
      setConfErr('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      let result
      if (window.esms) {
        result = await window.esms.setup({ password: newPass })
      } else {
        // Demo mode
        await new Promise(r => setTimeout(r, 900))
        result = { success: true }
      }
      if (result.success) {
        setStep(2)
        showAlert('Password saved successfully! Redirecting to login…', 'success')
        setTimeout(() => {
          if (window.esms) window.esms.navigate('login')
          else navigate('/login')
        }, 1500)
      } else {
        showAlert(result.message || 'Setup failed. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      showAlert('An unexpected error occurred.')
      console.error('[Setup]', err)
      setLoading(false)
    }
  }

  const inputBase = {
    width: '100%',
    height: 42,
    background: 'var(--clr-navy-mid)',
    border: '1px solid rgba(74,127,181,0.2)',
    borderRadius: 10,
    color: 'var(--clr-text)',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    padding: '0 40px',
    outline: 'none',
    transition: 'border-color 220ms, box-shadow 220ms, background 220ms',
    caretColor: 'var(--clr-steel-light)',
  }

  return (
    <>
      <TitleBar title="ESMS — First-Time Setup" />

      <main className="flex w-screen h-screen overflow-hidden" style={{ paddingTop: 34 }}>
        <BrandPanel />

        <section
          className="flex-1 flex items-center justify-center overflow-y-auto"
          style={{
            background: 'var(--clr-navy-dark)',
            borderLeft: '1px solid rgba(74,127,181,0.18)',
            padding: '24px 28px',
            animation: 'fadeRight 0.38s both',
          }}
        >
          <div
            className="w-full flex flex-col gap-[12px]"
            style={{ maxWidth: 340, animation: 'fadeUp 0.5s 0.12s both' }}
          >
            {/* Brand header */}
            <div className="flex items-center gap-2">
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--clr-steel)',
                boxShadow: '0 0 8px var(--clr-steel-glow)',
                animation: 'pulseRing 2.5s ease-in-out infinite',
              }}/>
              <span className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--clr-steel-light)' }}>
                One-Time Setup
              </span>
            </div>

            {/* Step indicator */}
            <div className="flex items-center" aria-label="Setup steps">
              {[
                { n: 1, label: 'Set Password' },
                { n: 2, label: 'Confirm' },
                { n: 3, label: 'Done' },
              ].map((s, i) => (
                <React.Fragment key={s.n}>
                  <div className="flex flex-col items-center gap-[3px]">
                    <div
                      style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: step > s.n ? 'var(--clr-success)' : step === s.n ? 'var(--clr-steel)' : 'var(--clr-navy-mid)',
                        border: `1.5px solid ${step > s.n ? 'var(--clr-success)' : step === s.n ? 'var(--clr-steel)' : 'rgba(74,127,181,0.25)'}`,
                        color: step >= s.n ? '#fff' : 'var(--clr-text-dim)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
                        boxShadow: step === s.n ? '0 0 10px rgba(74,127,181,0.45)' : 'none',
                        transition: 'all 220ms',
                      }}
                    >
                      {step > s.n ? '✓' : s.n}
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 600, letterSpacing: '0.06em',
                      textTransform: 'uppercase', whiteSpace: 'nowrap',
                      color: step === s.n ? 'var(--clr-steel-light)' : 'var(--clr-text-dim)',
                      transition: 'color 220ms',
                    }}>{s.label}</span>
                  </div>
                  {i < 2 && (
                    <div style={{
                      flex: 1, height: 1.5, background: 'rgba(74,127,181,0.2)',
                      margin: '0 6px', marginBottom: 16, maxWidth: 50,
                    }}/>
                  )}
                </React.Fragment>
              ))}
            </div>

            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
              color: 'var(--clr-text)', letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 2,
            }}>
              Create Admin Password
            </h2>
            <p style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: -6, lineHeight: 1.6 }}>
              Stored securely via bcrypt. Username is fixed as{' '}
              <code style={{
                fontFamily: 'Courier New, monospace',
                background: 'var(--clr-steel-soft)',
                border: '1px solid rgba(74,127,181,0.25)',
                color: 'var(--clr-steel-light)',
                padding: '1px 5px', borderRadius: 4, fontSize: 11,
              }}>admin</code>.
            </p>

            {/* Alert */}
            {alert.visible && (
              <div
                role="alert"
                className="flex items-center gap-2 text-[12px] font-medium"
                style={{
                  padding: '9px 12px', borderRadius: 10,
                  background: alert.type === 'success' ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.1)',
                  border: alert.type === 'success' ? '1px solid rgba(52,211,153,0.28)' : '1px solid rgba(248,113,113,0.28)',
                  color: alert.type === 'success' ? 'var(--clr-success)' : 'var(--clr-error)',
                  animation: 'fadeUp 220ms both',
                }}
              >
                <svg style={{ width: 15, height: 15, flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9v4a1 1 0 11-2 0V9a1 1 0 112 0zm0-4a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd"/>
                </svg>
                <span>{alert.msg}</span>
              </div>
            )}

            <form className="flex flex-col gap-[12px]" onSubmit={handleSubmit} noValidate>

              {/* New Password */}
              <div className="flex flex-col gap-[5px]">
                <label htmlFor="newPassword" className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--clr-text-muted)' }}>
                  New Password
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-0 flex items-center justify-center pointer-events-none" style={{ width: 38, color: newPass ? 'var(--clr-steel)' : 'var(--clr-text-dim)' }}>
                    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  </span>
                  <input
                    id="newPassword" ref={newPassRef}
                    type={showNew ? 'text' : 'password'}
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    placeholder="Minimum 8 characters"
                    aria-required="true"
                    className="field-input"
                    style={inputBase}
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)} aria-label="Toggle password"
                    className="absolute right-0 flex items-center justify-center border-none cursor-pointer"
                    style={{ width: 38, height: '100%', background: 'none', color: 'var(--clr-text-dim)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-steel-light)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--clr-text-dim)'}
                  >
                    {showNew ? <EyeHideIcon /> : <EyeShowIcon />}
                  </button>
                </div>

                {/* Strength bar */}
                <div className="flex items-center gap-2 mt-[2px]" aria-hidden="true">
                  <div style={{ flex: 1, height: 3, background: 'rgba(74,127,181,0.15)', borderRadius: 2, overflow: 'hidden' }}>
                    <div className="strength-fill" style={{ width: `${lvl.pct}%`, background: lvl.color }}/>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: lvl.color, width: 44, textAlign: 'right', transition: 'color 0.4s' }}>
                    {lvl.label}
                  </span>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-[5px]">
                <label htmlFor="confirmPassword" className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--clr-text-muted)' }}>
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-0 flex items-center justify-center pointer-events-none" style={{ width: 38, color: confPass ? 'var(--clr-steel)' : 'var(--clr-text-dim)' }}>
                    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </span>
                  <input
                    id="confirmPassword"
                    type={showConf ? 'text' : 'password'}
                    value={confPass}
                    onChange={e => { setConfPass(e.target.value); setConfErr('') }}
                    placeholder="Re-enter your password"
                    aria-required="true"
                    className={`field-input${confErr ? ' field-input--error' : ''}`}
                    style={inputBase}
                  />
                  <button type="button" onClick={() => setShowConf(v => !v)} aria-label="Toggle confirm password"
                    className="absolute right-0 flex items-center justify-center border-none cursor-pointer"
                    style={{ width: 38, height: '100%', background: 'none', color: 'var(--clr-text-dim)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-steel-light)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--clr-text-dim)'}
                  >
                    {showConf ? <EyeHideIcon /> : <EyeShowIcon />}
                  </button>
                </div>
                <span style={{ fontSize: 11, color: 'var(--clr-error)', minHeight: 14 }}>{confErr}</span>
              </div>

              {/* Requirements checklist */}
              <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }} aria-label="Password requirements">
                {REQS.map((r, i) => {
                  const met = metReqs[i]
                  return (
                    <li key={r.key} className="flex items-center gap-[5px]" style={{ fontSize: 11, color: met ? 'var(--clr-text-muted)' : 'var(--clr-text-dim)', transition: 'color 140ms' }}>
                      <span style={{
                        fontSize: 9, fontWeight: 700,
                        width: 14, height: 14, borderRadius: '50%',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        background: met ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
                        color: met ? 'var(--clr-success)' : 'var(--clr-error)',
                        flexShrink: 0, transition: 'all 220ms',
                      }}>
                        {met ? '✓' : '✕'}
                      </span>
                      {r.label}
                    </li>
                  )
                })}
              </ul>

              {/* Submit */}
              <button
                type="submit"
                disabled={btnDisabled}
                className="btn-primary flex items-center justify-center gap-2 border-none cursor-pointer"
                style={{
                  marginTop: 4, height: 44, width: '100%',
                  background: 'linear-gradient(135deg, #2a5fa0, #3d7abf, #4a8fd4)',
                  backgroundSize: '200% 200%',
                  borderRadius: 10, color: '#fff',
                  fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
                  letterSpacing: '0.06em',
                  transition: 'transform 220ms, box-shadow 220ms',
                  boxShadow: '0 4px 18px rgba(42,95,160,0.45)',
                  opacity: btnDisabled ? 0.45 : 1,
                  cursor: btnDisabled ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e => { if (!btnDisabled) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(42,95,160,0.55)' } }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 18px rgba(42,95,160,0.45)' }}
              >
                {loading ? (
                  <>
                    <svg style={{ width: 18, height: 18, animation: 'spin 0.75s linear infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" strokeOpacity=".25"/>
                      <path d="M12 2a10 10 0 0110 10"/>
                    </svg>
                    <span>Saving…</span>
                  </>
                ) : (
                  <>
                    <span>Save Password &amp; Continue</span>
                    <svg style={{ width: 16, height: 16, flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </>
                )}
              </button>

            </form>

            <p className="text-center text-[11px] pt-[8px]" style={{ color: 'var(--clr-text-dim)', borderTop: '1px solid var(--clr-border)' }}>
              Authorized personnel only &bull; ESMS v1.0
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
