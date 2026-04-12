import React from 'react'

export default function TitleBar({ title = 'Exam Seating Management System' }) {
  const handleMin   = () => window.esms?.minimize()
  const handleMax   = () => window.esms?.maximize()
  const handleClose = () => window.esms?.close()

  return (
    <div
      className="titlebar-drag fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between px-[14px] h-[34px]"
      style={{
        background: 'rgba(14,25,41,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <span
        className="titlebar-no-drag text-[11px] font-bold tracking-[0.1em] uppercase"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-text-muted)' }}
      >
        {title}
      </span>
      <div className="titlebar-no-drag flex gap-[7px]">
        <button
          onClick={handleMin}
          aria-label="Minimize"
          className="w-3 h-3 rounded-full border-none cursor-pointer transition-all duration-150 hover:brightness-[1.35] hover:scale-[1.18]"
          style={{ background: '#ffbd2e' }}
        />
        <button
          onClick={handleMax}
          aria-label="Maximize"
          className="w-3 h-3 rounded-full border-none cursor-pointer transition-all duration-150 hover:brightness-[1.35] hover:scale-[1.18]"
          style={{ background: '#28c840' }}
        />
        <button
          onClick={handleClose}
          aria-label="Close"
          className="w-3 h-3 rounded-full border-none cursor-pointer transition-all duration-150 hover:brightness-[1.35] hover:scale-[1.18]"
          style={{ background: '#ff5f57' }}
        />
      </div>
    </div>
  )
}
