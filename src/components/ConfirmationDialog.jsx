function ConfirmationDialog({
  eyebrow,
  title,
  description,
  confirmLabel,
  titleId,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#1d2925]/45 px-5 py-8 backdrop-blur-sm" role="presentation">
      <section className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl sm:p-9" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#788c3d]">{eyebrow}</p>
        <h2 id={titleId} className="text-3xl font-black tracking-tight text-[#26332d]">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-[#738077]">{description}</p>
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="rounded-xl border border-[#cbd6c9] bg-white px-5 py-3.5 text-sm font-bold text-[#33443a] transition hover:border-[#91ad37]">Cancel</button>
          <button type="button" onClick={onConfirm} className="rounded-xl bg-[#263b31] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#17281f] focus:outline-none focus:ring-4 focus:ring-[#d6ed63]">{confirmLabel}</button>
        </div>
      </section>
    </div>
  )
}

export default ConfirmationDialog
