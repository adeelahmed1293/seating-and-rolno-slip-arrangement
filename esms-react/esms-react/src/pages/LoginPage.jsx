//Login Page.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import TitleBar from '../components/TitleBar.jsx'
import BrandPanel from '../components/BrandPanel.jsx'

/* ── Eye icons ── */
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

export default function LoginPage() {
  const navigate = useNavigate()

  const [username, setUsername]         = useState('')
  const [password, setPassword]         = useState('')
  const [showPass, setShowPass]         = useState(false)
  const [usernameErr, setUsernameErr]   = useState('')
  const [passwordErr, setPasswordErr]   = useState('')
  const [alert, setAlert]               = useState({ msg: '', type: '', visible: false })
  const [loading, setLoading]           = useState(false)
  const [shake, setShake]               = useState(false)

  const usernameRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => usernameRef.current?.focus(), 400)
    return () => clearTimeout(t)
  }, [])

  const triggerShake = useCallback(() => {
    setShake(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setShake(true)))
    setTimeout(() => setShake(false), 400)
  }, [])

  function showAlert(msg, type = 'error') {
    setAlert({ msg, type, visible: true })
  }

  function validate() {
    let valid = true
    setUsernameErr('')
    setPasswordErr('')
    if (!username.trim()) { setUsernameErr('Username is required.'); valid = false }
    if (!password)        { setPasswordErr('Password is required.'); valid = false }
    return valid
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setAlert({ msg: '', type: '', visible: false })

    if (!validate()) { triggerShake(); return }

    setLoading(true)
    try {
      // In Electron: window.esms.login(...)
      // In browser demo: simulate auth
      let result
      if (window.esms) {
        result = await window.esms.login({ username: username.trim(), password })
      } else {
        // Demo mode — accept admin / admin
        await new Promise(r => setTimeout(r, 800))
        result = (username.trim().toLowerCase() === 'admin' && password === 'admin')
          ? { success: true }
          : { success: false, message: 'Invalid credentials. Please try again.' }
      }

      if (result.success) {
        showAlert('Authentication successful. Redirecting…', 'success')
        setTimeout(() => navigate('/dashboard'), 800)
      } else {
        showAlert(result.message || 'Invalid credentials. Please try again.')
        setPassword('')
        triggerShake()
      }
    } catch (err) {
      showAlert('An unexpected error occurred. Please restart the application.')
      console.error('[Login]', err)
    } finally {
      setLoading(false)
    }
  }

  // Input styles
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
      <TitleBar title="Exam Seating Management System" />

      <main
        className="flex w-screen h-screen overflow-hidden"
        style={{ paddingTop: 34 }}
      >
        {/* Left Brand Panel */}
        <BrandPanel />

        {/* Right Form Panel */}
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
            className="w-full flex flex-col gap-[14px]"
            style={{
              maxWidth: 320,
              animation: shake ? 'shake 0.38s both' : 'fadeUp 0.5s 0.12s both',
            }}
          >
            {/* Mini brand header */}
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: 'var(--clr-steel)',
                  boxShadow: '0 0 8px var(--clr-steel-glow)',
                  animation: 'pulseRing 2.5s ease-in-out infinite',
                }}
              />
              <span
                className="text-[11px] font-semibold tracking-[0.12em] uppercase"
                style={{ color: 'var(--clr-steel-light)' }}
              >
                Admin Portal
              </span>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 26,
                fontWeight: 800,
                color: 'var(--clr-text)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                marginTop: -2,
              }}
            >
              Sign In
            </h2>
            <p style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: -8 }}>
              Exam Seating Management System
            </p>

            {/* Alert */}
            {alert.visible && (
              <div
                role="alert"
                className="flex items-center gap-2 text-[12px] font-medium"
                style={{
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: alert.type === 'success'
                    ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.1)',
                  border: alert.type === 'success'
                    ? '1px solid rgba(52,211,153,0.28)' : '1px solid rgba(248,113,113,0.28)',
                  color: alert.type === 'success'
                    ? 'var(--clr-success)' : 'var(--clr-error)',
                  animation: 'fadeUp 220ms both',
                }}
              >
                <svg style={{ width: 15, height: 15, flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9v4a1 1 0 11-2 0V9a1 1 0 112 0zm0-4a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd"/>
                </svg>
                <span>{alert.msg}</span>
              </div>
            )}

            {/* Form */}
            <form className="flex flex-col gap-[14px]" onSubmit={handleSubmit} noValidate>

              {/* Username */}
              <div className="flex flex-col gap-[5px]">
                <label
                  htmlFor="username"
                  className="text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors"
                  style={{ color: 'var(--clr-text-muted)' }}
                >
                  Username
                </label>
                <div className="relative flex items-center">
                  <span
                    className="absolute left-0 flex items-center justify-center pointer-events-none transition-colors"
                    style={{ width: 38, color: username ? 'var(--clr-steel)' : 'var(--clr-text-dim)' }}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                  </span>
                  <input
                    id="username"
                    ref={usernameRef}
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setUsernameErr('') }}
                    placeholder="admin"
                    autoComplete="off"
                    spellCheck={false}
                    aria-required="true"
                    className={`field-input${usernameErr ? ' field-input--error' : ''}`}
                    style={inputBase}
                  />
                </div>
                <span style={{ fontSize: 11, color: 'var(--clr-error)', minHeight: 14, display: 'block' }}>
                  {usernameErr}
                </span>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-[5px]">
                <label
                  htmlFor="password"
                  className="text-[11px] font-semibold tracking-[0.08em] uppercase"
                  style={{ color: 'var(--clr-text-muted)' }}
                >
                  Password
                </label>
                <div className="relative flex items-center">
                  <span
                    className="absolute left-0 flex items-center justify-center pointer-events-none"
                    style={{ width: 38, color: password ? 'var(--clr-steel)' : 'var(--clr-text-dim)' }}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setPasswordErr('') }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-required="true"
                    className={`field-input${passwordErr ? ' field-input--error' : ''}`}
                    style={inputBase}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    className="absolute right-0 flex items-center justify-center border-none cursor-pointer rounded transition-colors"
                    style={{
                      width: 38, height: '100%',
                      background: 'none',
                      color: 'var(--clr-text-dim)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-steel-light)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--clr-text-dim)'}
                  >
                    {showPass ? <EyeHideIcon /> : <EyeShowIcon />}
                  </button>
                </div>
                <span style={{ fontSize: 11, color: 'var(--clr-error)', minHeight: 14, display: 'block' }}>
                  {passwordErr}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center justify-center gap-2 border-none cursor-pointer"
                style={{
                  marginTop: 6,
                  height: 44,
                  width: '100%',
                  background: 'linear-gradient(135deg, #2a5fa0, #3d7abf, #4a8fd4)',
                  backgroundSize: '200% 200%',
                  borderRadius: 10,
                  color: '#fff',
                  fontFamily: 'var(--font-display)',
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  transition: 'transform 220ms, box-shadow 220ms',
                  boxShadow: '0 4px 18px rgba(42,95,160,0.45)',
                  opacity: loading ? 0.65 : 1,
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(42,95,160,0.55)' } }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 18px rgba(42,95,160,0.45)' }}
                onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {loading ? (
                  <>
                    <svg style={{ width: 18, height: 18, animation: 'spin 0.75s linear infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" strokeOpacity=".25"/>
                      <path d="M12 2a10 10 0 0110 10"/>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg style={{ width: 16, height: 16, transition: 'transform 220ms', flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </>
                )}
              </button>

            </form>

            <p
              className="text-center text-[11px] pt-[10px]"
              style={{
                color: 'var(--clr-text-dim)',
                borderTop: '1px solid var(--clr-border)',
              }}
            >
              Authorized personnel only &bull; ESMS v1.0
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
