function AppHeader({ showGuide, onHomeClick, onGuideToggle, onSettingsOpen }) {
  return (
    <header className="flex items-center justify-between border-b border-[#d9dfd7] pb-6">
      <button type="button" onClick={onHomeClick} className="flex items-center gap-3 font-bold tracking-tight">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#d6ed63] text-lg text-[#26331f]">?</span>
        <span>MCQ Crammer</span>
      </button>
      <div className="flex items-center gap-5">
        <button type="button" onClick={onGuideToggle} className="text-xs font-bold uppercase tracking-[0.14em] text-[#6c7b70] transition hover:text-[#334c3a]">
          {showGuide ? 'Back to workspace' : 'How to use AI'}
        </button>
        <button
          type="button"
          onClick={onSettingsOpen}
          className="flex size-10 items-center justify-center rounded-full border border-[#cbd6c9] bg-white text-lg text-[#49623f] transition hover:border-[#91ad37]"
          aria-label="Open quiz settings"
          title="Open quiz settings"
        >
          <span aria-hidden="true">⚙</span>
        </button>
      </div>
    </header>
  )
}

export default AppHeader
