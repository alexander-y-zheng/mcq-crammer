function QuizSetupView({ questionsCount, viewMode, gradingMode, randomizeAnswers, showProgressBar, onViewModeChange, onGradingModeChange, onRandomizeAnswersChange, onProgressBarChange, onStart }) {
  return (
    <section className="mx-auto mb-8 w-full max-w-3xl rounded-3xl border border-[#d9dfd7] bg-white p-7 shadow-[0_18px_45px_rgba(54,75,61,0.08)] sm:p-9" aria-labelledby="quiz-settings-title">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#788c3d]">Quiz ready</p>
        <h2 id="quiz-settings-title" className="text-3xl font-black tracking-tight text-[#26332d]">Set your study mode</h2>
        <p className="mt-2 text-sm leading-6 text-[#738077]">Choose how you want to move through {questionsCount} questions.</p>
      </div>

      <div className="space-y-6">
        <fieldset>
          <legend className="mb-3 text-sm font-bold text-[#33443a]">View mode</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {[['single', 'One question at a time'], ['all', 'All on one page']].map(([value, label]) => (
              <label key={value} className={`cursor-pointer rounded-2xl border p-4 transition ${viewMode === value ? 'border-[#91ad37] bg-[#f4f9df] ring-2 ring-[#e9f3c5]' : 'border-[#d9dfd7] hover:border-[#b8c6b6]'}`}>
                <input type="radio" name="view-mode" value={value} checked={viewMode === value} onChange={(event) => onViewModeChange(event.target.value)} className="sr-only" />
                <span className="block text-sm font-bold text-[#33443a]">{label}</span>
                <span className="mt-1 block text-xs leading-5 text-[#819087]">{value === 'single' ? 'Stay focused on one prompt.' : 'Scan the full quiz at once.'}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-bold text-[#33443a]">Grading mode</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {[['instant', 'Instant feedback'], ['end', 'Grade at the end']].map(([value, label]) => (
              <label key={value} className={`cursor-pointer rounded-2xl border p-4 transition ${gradingMode === value ? 'border-[#91ad37] bg-[#f4f9df] ring-2 ring-[#e9f3c5]' : 'border-[#d9dfd7] hover:border-[#b8c6b6]'}`}>
                <input type="radio" name="grading-mode" value={value} checked={gradingMode === value} onChange={(event) => onGradingModeChange(event.target.value)} className="sr-only" />
                <span className="block text-sm font-bold text-[#33443a]">{label}</span>
                <span className="mt-1 block text-xs leading-5 text-[#819087]">{value === 'instant' ? 'Learn as you go.' : 'See your result after the last question.'}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition ${randomizeAnswers ? 'border-[#91ad37] bg-[#f4f9df] ring-2 ring-[#e9f3c5]' : 'border-[#d9dfd7] hover:border-[#b8c6b6]'}`}>
          <span>
            <span className="block text-sm font-bold text-[#33443a]">Randomize answer order</span>
            <span className="mt-1 block text-xs leading-5 text-[#819087]">Mix the answer choices for each question.</span>
          </span>
          <input type="checkbox" checked={randomizeAnswers} onChange={(event) => onRandomizeAnswersChange(event.target.checked)} className="size-5 accent-[#788c3d]" />
        </label>

        <label className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition ${showProgressBar ? 'border-[#91ad37] bg-[#f4f9df] ring-2 ring-[#e9f3c5]' : 'border-[#d9dfd7] hover:border-[#b8c6b6]'}`}>
          <span>
            <span className="block text-sm font-bold text-[#33443a]">Show progress bar</span>
            <span className="mt-1 block text-xs leading-5 text-[#819087]">Keep track of how much of the quiz you have answered.</span>
          </span>
          <input type="checkbox" checked={showProgressBar} onChange={(event) => onProgressBarChange(event.target.checked)} className="size-5 accent-[#788c3d]" />
        </label>
      </div>

      <button type="button" onClick={onStart} className="mt-8 w-full rounded-xl bg-[#263b31] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#17281f] focus:outline-none focus:ring-4 focus:ring-[#d6ed63]">Start Quiz</button>
    </section>
  )
}

export default QuizSetupView
