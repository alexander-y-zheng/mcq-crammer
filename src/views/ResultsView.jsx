function ResultsView({
  fileName,
  questions,
  answers,
  score,
  missedQuestions,
  explanationPrompt,
  teachingPrompt,
  copiedPrompt,
  summaryAnimationKey,
  showMissedQuestions,
  onToggleMissedQuestions,
  onCopyPrompt,
  onReviewQuiz,
  onRetry,
}) {
  return (
    <section className="flex-1 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#788c3d]">Quiz complete</p>
            <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1d2925] sm:text-6xl">Your results.</h1>
            <p className="mt-3 text-sm text-[#738077]">{fileName}</p>
          </div>
          <div
            key={summaryAnimationKey}
            className="score-ring flex size-32 flex-col items-center justify-center rounded-full text-center text-[#334c3a]"
            style={{ '--score-percent': `${questions.length ? (score / questions.length) * 100 : 0}%` }}
          >
            <div className="flex size-24 flex-col items-center justify-center rounded-full bg-[#e9f3c5]">
              <span className="whitespace-nowrap text-[clamp(1rem,5vw,1.875rem)] font-black leading-none tracking-tight">{score} / {questions.length}</span>
              <span className="text-xs font-bold uppercase tracking-wider">score</span>
            </div>
          </div>
        </div>

        {missedQuestions.length > 0 ? (
          <div className="space-y-4">
            <button type="button" onClick={onToggleMissedQuestions} aria-expanded={showMissedQuestions} aria-controls="missed-questions" className="flex w-full items-center justify-between gap-4 text-left">
              <span className="text-lg font-bold text-[#33443a]">Review your missed questions</span>
              <span className="text-xl font-semibold text-[#788c3d]" aria-hidden="true">{showMissedQuestions ? '-' : '+'}</span>
            </button>
            {showMissedQuestions && (
              <div id="missed-questions" className="space-y-4">
                {missedQuestions.map((question) => {
                  const questionIndex = questions.indexOf(question)
                  const selectedAnswer = question.options[answers[questionIndex]]?.text || 'No answer selected'
                  const correctAnswer = question.options.find((option) => option.isCorrect)?.text || 'No correct answer marked'
                  return (
                    <article key={questionIndex} className="rounded-2xl border border-[#ead7d2] bg-white p-5 shadow-sm">
                      <p className="font-bold leading-6 text-[#33443a]">{questionIndex + 1}. {question.question}</p>
                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                        <div className="rounded-xl bg-[#fff0ed] px-4 py-3 text-[#98493e]"><span className="font-bold">You picked:</span> {selectedAnswer}</div>
                        <div className="rounded-xl bg-[#eaf6e7] px-4 py-3 text-[#38643a]"><span className="font-bold">Right answer:</span> {correctAnswer}</div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-[#eaf6e7] p-6 text-center font-bold text-[#38643a]">Perfect score. Every answer is correct!</div>
        )}

        {missedQuestions.length > 0 && (
          <div className="mt-10 space-y-5">
            <h2 className="text-lg font-bold text-[#33443a]">Keep learning</h2>
            {[
              ['explain', 'Explain my mistakes', explanationPrompt],
              ['teach', 'Teach me the missed concepts', teachingPrompt],
            ].map(([promptName, title, prompt]) => (
              <div key={promptName}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label htmlFor={`${promptName}-prompt`} className="text-sm font-bold text-[#33443a]">{title}</label>
                  <button type="button" onClick={() => onCopyPrompt(promptName, prompt)} className="rounded-lg border border-[#cbd6c9] bg-white px-3 py-1.5 text-xs font-bold text-[#49623f] transition hover:border-[#91ad37]">{copiedPrompt === promptName ? 'Copied' : 'Copy'}</button>
                </div>
                <textarea id={`${promptName}-prompt`} readOnly value={prompt} className="min-h-36 w-full resize-y rounded-2xl border border-[#cbd6c9] bg-white p-4 text-sm leading-6 text-[#617067] outline-none focus:border-[#91ad37] focus:ring-4 focus:ring-[#e9f3c5]" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 space-y-3">
          <button type="button" onClick={onReviewQuiz} className="w-full rounded-xl border border-[#91ad37] bg-[#f4f9df] px-5 py-3.5 text-sm font-bold text-[#49623f] transition hover:bg-[#e9f3c5] focus:outline-none focus:ring-4 focus:ring-[#d6ed63]">Review Quiz</button>
          <button type="button" onClick={onRetry} className="w-full rounded-xl bg-[#263b31] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#17281f] focus:outline-none focus:ring-4 focus:ring-[#d6ed63]">Retry Quiz</button>
        </div>
      </div>
    </section>
  )
}

export default ResultsView
