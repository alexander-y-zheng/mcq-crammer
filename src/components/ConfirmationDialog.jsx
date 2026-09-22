import { useEffect, useRef } from 'react'

function ConfirmationDialog({
  eyebrow,
  title,
  description,
  confirmLabel,
  titleId,
  onCancel,
  onConfirm,
}) {
  const dialogRef = useRef(null)
  const onCancelRef = useRef(onCancel)

  useEffect(() => {
    onCancelRef.current = onCancel
  }, [onCancel])

  useEffect(() => {
    const dialog = dialogRef.current
    const previouslyFocused = document.activeElement
    if (!dialog) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancelRef.current()
        return
      }
      if (event.key !== 'Tab') return

      const focusableElements = [...dialog.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    dialog.addEventListener('keydown', handleKeyDown)
    return () => {
      dialog.removeEventListener('keydown', handleKeyDown)
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) previouslyFocused.focus()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#1d2925]/45 px-5 py-8 backdrop-blur-sm" role="presentation">
      <section ref={dialogRef} className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl sm:p-9" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={`${titleId}-description`}>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#788c3d]">{eyebrow}</p>
        <h2 id={titleId} className="text-3xl font-black tracking-tight text-[#26332d]">{title}</h2>
        <p id={`${titleId}-description`} className="mt-3 text-sm leading-6 text-[#738077]">{description}</p>
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" autoFocus onClick={onCancel} className="rounded-xl border border-[#cbd6c9] bg-white px-5 py-3.5 text-sm font-bold text-[#33443a] transition hover:border-[#91ad37]">Cancel</button>
          <button type="button" onClick={onConfirm} className="rounded-xl bg-[#263b31] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#17281f] focus:outline-none focus:ring-4 focus:ring-[#d6ed63]">{confirmLabel}</button>
        </div>
      </section>
    </div>
  )
}

export default ConfirmationDialog
