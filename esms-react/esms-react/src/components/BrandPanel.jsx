import React from 'react'
import logoImg from '../assets/logo.png'

export default function BrandPanel() {
  return (
    <section
      className="relative flex-none flex items-center justify-center overflow-hidden"
      style={{
        flex: '0 0 46%',
        background: 'linear-gradient(160deg, #1a3060 0%, #162548 40%, #0e1929 100%)',
        animation: 'fadeLeft 0.38s both',
      }}
      aria-hidden="true"
    >
      {/* Animated grid */}
      <div className="grid-overlay" />

      {/* Corner brackets */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 18, left: 18,
          width: 36, height: 36,
          borderColor: 'rgba(74,127,181,0.35)',
          borderStyle: 'solid',
          borderWidth: '2px 0 0 2px',
          borderRadius: '3px 0 0 0',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 18, right: 18,
          width: 36, height: 36,
          borderColor: 'rgba(74,127,181,0.35)',
          borderStyle: 'solid',
          borderWidth: '0 2px 2px 0',
          borderRadius: '0 0 3px 0',
        }}
      />

      {/* Right edge glow */}
      <div
        className="absolute right-0 pointer-events-none z-[2]"
        style={{
          top: '10%', bottom: '10%',
          width: 1,
          background: 'linear-gradient(to bottom, transparent, rgba(74,127,181,0.3), transparent)',
        }}
      />

      {/* Inner content */}
      <div
        className="relative z-[1] flex flex-col items-center gap-7 px-8 w-full"
        style={{ padding: 32 }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-center"
          style={{
            filter: 'drop-shadow(0 8px 32px rgba(74,127,181,0.35))',
            animation: 'scaleIn 0.65s 0.1s both',
          }}
        >
          <img
            src={logoImg}
            alt="Exam Seating Management System Logo"
            draggable={false}
            style={{
              width: '76%',
              maxWidth: 300,
              minWidth: 200,
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              animation: 'float 5s ease-in-out infinite',
            }}
          />
        </div>

        {/* BATs badge */}
        <div
          className="flex items-center gap-[10px] text-[12px] font-normal tracking-[0.02em]"
          style={{
            padding: '8px 18px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(74,127,181,0.25)',
            borderRadius: 40,
            color: 'var(--clr-text-muted)',
            animation: 'fadeUp 0.5s 0.35s both',
          }}
        >
          <svg
            style={{
              width: 28, height: 14,
              color: 'var(--clr-steel-light)',
              flexShrink: 0,
              animation: 'float 4s ease-in-out infinite reverse',
            }}
            viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M40 8C40 8 32 2 20 4C12 6 6 12 4 16C8 14 14 15 18 18C14 16 10 18 8 22C12 20 18 20 22 24C18 22 16 26 18 30C22 26 28 24 32 26C34 24 36 20 36 16C38 18 40 22 40 22C40 22 42 18 44 16C44 20 46 24 48 26C52 24 58 26 62 30C64 26 62 22 58 24C62 20 68 20 72 22C70 18 66 16 62 18C66 15 72 14 76 16C74 12 68 6 60 4C48 2 40 8 40 8Z"
              fill="currentColor" opacity="0.6"
            />
          </svg>
          <span>
            Developed by the{' '}
            <strong style={{ color: 'var(--clr-steel-pale)', fontWeight: 600 }}>
              BATs Dev
            </strong>
          </span>
        </div>
      </div>
    </section>
  )
}
