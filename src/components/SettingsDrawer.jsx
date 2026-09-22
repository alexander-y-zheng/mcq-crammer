import { useEffect, useRef } from 'react'
import { fontOptions, themeOptions } from '../data/settingsOptions'

function SettingsDrawer({
  isOpen,
  viewMode,
  gradingMode,
  randomizeAnswers,
  showProgressBar,
  theme,
  font,
  isDarkMode,
  canChangeGradingMode,
  canChangeRandomizeAnswers,
  canChangeProgressBar,
  onClose,
  onViewModeChange,
  onGradingModeChange,
  onRandomizeAnswersChange,
  onProgressBarChange,
  onThemeChange,
  onFontChange,
  onDarkModeToggle,
}) {
  const drawerRef = useRef(null)
  const closeButtonRef = useRef(null)
  const previouslyFocusedRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined
    previouslyFocusedRef.current = document.activeElement
    drawerRef.current?.scrollTo({ top: 0 })
    closeButtonRef.current?.focus()
    return () => {
      if (previouslyFocusedRef.current instanceof HTMLElement && previouslyFocusedRef.current.isConnected) previouslyFocusedRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <>
      <button type="button" onClick={onClose} className={`fixed inset-0 z-30 cursor-default bg-[#1d2925]/30 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} aria-label="Close quiz settings" tabIndex={isOpen ? 0 : -1} />
      <aside ref={drawerRef} className={`fixed right-0 top-0 z-40 flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-[#d9dfd7] bg-white p-5 shadow-2xl transition-transform duration-300 ease-out sm:p-6 ${isOpen ? 'translate-x-0' : 'pointer-events-none translate-x-full'}`} aria-labelledby="settings-title" aria-hidden={!isOpen} inert={!isOpen}>
        <div className="flex items-start justify-between gap-4 border-b border-[#d9dfd7] pb-5">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#788c3d]">Workspace</p>
            <h2 id="settings-title" className="text-2xl font-black tracking-tight text-[#26332d]">Quiz settings</h2>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-full border border-[#cbd6c9] bg-white text-lg text-[#49623f] transition hover:border-[#91ad37]" aria-label="Close quiz settings" title="Close quiz settings">×</button>
        </div>

        <div className="space-y-6 py-6">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#788c3d]">Quiz mode</p>
            <fieldset>
              <legend className="mb-3 text-sm font-bold text-[#33443a]">View mode</legend>
              <div className="space-y-3">
                {[['single', 'One question at a time'], ['all', 'All on one page']].map(([value, label]) => (
                  <label key={value} className={`block cursor-pointer rounded-xl border p-3 transition ${viewMode === value ? 'border-[#91ad37] bg-[#f4f9df] ring-2 ring-[#e9f3c5]' : 'border-[#d9dfd7] hover:border-[#b8c6b6]'}`}>
                    <input type="radio" name="sidebar-view-mode" value={value} checked={viewMode === value} onChange={(event) => onViewModeChange(event.target.value)} className="sr-only" />
                    <span className="block text-sm font-bold text-[#33443a]">{label}</span>
                    <span className="mt-1 block text-xs leading-5 text-[#819087]">{value === 'single' ? 'Stay focused on one prompt.' : 'Scan the full quiz at once.'}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-sm font-bold text-[#33443a]">Grading mode</legend>
              <div className="space-y-3">
                {[['instant', 'Instant feedback'], ['end', 'Grade at the end']].map(([value, label]) => (
                  <div key={value} className="group relative">
                    <label className={`block rounded-xl border p-3 transition ${canChangeGradingMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} ${gradingMode === value ? 'border-[#91ad37] bg-[#f4f9df] ring-2 ring-[#e9f3c5]' : 'border-[#d9dfd7]'}`}>
                      <input type="radio" name="sidebar-grading-mode" value={value} checked={gradingMode === value} onChange={(event) => onGradingModeChange(event.target.value)} disabled={!canChangeGradingMode} className="sr-only" />
                      <span className="block text-sm font-bold text-[#33443a]">{label}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#819087]">{value === 'instant' ? 'Learn as you go.' : 'See your result after the last question.'}</span>
                    </label>
                    {!canChangeGradingMode && (
                      <span role="tooltip" className="pointer-events-none absolute bottom-full left-4 z-10 mb-2 w-max max-w-[calc(100% - 2rem)] rounded-xl bg-[#263b31] px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Grading mode cannot be changed during a quiz.</span>
                    )}
                  </div>
                ))}
              </div>
            </fieldset>

            <div className="group relative mt-5">
              <label className={`flex items-center justify-between gap-4 rounded-xl border p-3 transition ${canChangeRandomizeAnswers ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} ${randomizeAnswers ? 'border-[#91ad37] bg-[#f4f9df] ring-2 ring-[#e9f3c5]' : 'border-[#d9dfd7]'}`}>
                <span>
                  <span className="block text-sm font-bold text-[#33443a]">Randomize answer order</span>
                  <span className="mt-1 block text-xs leading-5 text-[#819087]">Mix choices for each question.</span>
                </span>
                <input type="checkbox" checked={randomizeAnswers} onChange={(event) => onRandomizeAnswersChange(event.target.checked)} disabled={!canChangeRandomizeAnswers} className="size-5 accent-[#788c3d]" />
              </label>
              {!canChangeRandomizeAnswers && (
                <span role="tooltip" className="pointer-events-none absolute bottom-full left-4 z-10 mb-2 w-max max-w-[calc(100% - 2rem)] rounded-xl bg-[#263b31] px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Answer order cannot be changed during a quiz.</span>
              )}
            </div>

            <div className="group relative mt-5">
              <label className={`flex items-center justify-between gap-4 rounded-xl border p-3 transition ${canChangeProgressBar ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} ${showProgressBar ? 'border-[#91ad37] bg-[#f4f9df] ring-2 ring-[#e9f3c5]' : 'border-[#d9dfd7]'}`}>
                <span>
                  <span className="block text-sm font-bold text-[#33443a]">Show progress bar</span>
                  <span className="mt-1 block text-xs leading-5 text-[#819087]">Keep track of answered questions.</span>
                </span>
                <input type="checkbox" checked={showProgressBar} onChange={(event) => onProgressBarChange(event.target.checked)} disabled={!canChangeProgressBar} className="size-5 accent-[#788c3d]" />
              </label>
              {!canChangeProgressBar && (
                <span role="tooltip" className="pointer-events-none absolute bottom-full left-4 z-10 mb-2 w-max max-w-[calc(100% - 2rem)] rounded-xl bg-[#263b31] px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Progress bar cannot be changed during a quiz.</span>
              )}
            </div>
          </div>

          <div className="border-t border-[#d9dfd7] pt-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#788c3d]">Appearance</p>
            <div className="space-y-5">
              <fieldset>
                <legend className="mb-3 text-sm font-bold text-[#33443a]">Color theme</legend>
                <div className="grid grid-cols-2 gap-2">
                  {themeOptions.map(([value, label]) => (
                    <label key={value} className={`cursor-pointer rounded-xl border p-3 transition ${theme === value ? 'border-[#91ad37] bg-[#f4f9df] ring-2 ring-[#e9f3c5]' : 'border-[#d9dfd7] hover:border-[#b8c6b6]'}`}>
                      <input type="radio" name="color-theme" value={value} checked={theme === value} onChange={(event) => onThemeChange(event.target.value)} className="sr-only" />
                      <span className="block text-xs font-bold text-[#33443a]">{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-3 text-sm font-bold text-[#33443a]">Font</legend>
                <div className="space-y-2">
                  {fontOptions.map(([value, label]) => (
                    <label key={value} className={`block cursor-pointer rounded-xl border p-3 transition ${font === value ? 'border-[#91ad37] bg-[#f4f9df] ring-2 ring-[#e9f3c5]' : 'border-[#d9dfd7] hover:border-[#b8c6b6]'}`}>
                      <input type="radio" name="font" value={value} checked={font === value} onChange={(event) => onFontChange(event.target.value)} className="sr-only" />
                      <span className="block text-xs font-bold text-[#33443a]">{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <button type="button" onClick={onDarkModeToggle} className="theme-toggle flex w-full items-center justify-between rounded-xl border border-[#cbd6c9] bg-white px-3 py-2.5 text-sm font-bold text-[#49623f] transition hover:border-[#91ad37]" aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                <span>Dark mode</span>
                <span>{isDarkMode ? 'On' : 'Off'}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default SettingsDrawer
