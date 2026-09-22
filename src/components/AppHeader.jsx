function AppHeader({ showGuide, showHistory, quizStarted, onHomeClick, onGuideToggle, onHistoryToggle, onWorkspaceBack, onSettingsOpen }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#d9dfd7] pb-6 max-[420px]:flex-wrap">
      <button type="button" onClick={onHomeClick} className="flex shrink-0 items-center gap-2 font-bold tracking-tight sm:gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#d6ed63] text-lg text-[#26331f]">?</span>
        <span className="whitespace-nowrap">MCQ Crammer</span>
      </button>
      <div className="flex shrink-0 items-center gap-2 sm:gap-5 max-[420px]:ml-auto">
        {!quizStarted && !showGuide && !showHistory && (
          <button type="button" onClick={onHistoryToggle} className="text-xs font-bold uppercase tracking-[0.14em] text-[#6c7b70] transition hover:text-[#334c3a]">History</button>
        )}
        <button type="button" onClick={showGuide || showHistory ? onWorkspaceBack : onGuideToggle} className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.1em] text-[#6c7b70] transition hover:text-[#334c3a] sm:text-xs sm:tracking-[0.14em]">
          {showGuide || showHistory ? 'Back to workspace' : 'How to use AI'}
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
