function HistoryView({ attempts, onDeleteAttempt, onClearHistory }) {
  return (
    <section className="flex-1 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#788c3d]">Your study record</p>
            <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1d2925] sm:text-6xl">Quiz history.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#738077]">Review your recent attempts and keep an eye on how your scores are moving.</p>
          </div>
          {attempts.length > 0 && (
            <button type="button" onClick={onClearHistory} className="rounded-xl border border-[#cbd6c9] bg-white px-4 py-3 text-sm font-bold text-[#33443a] transition hover:border-[#d27869] hover:text-[#98493e]">Clear history</button>
          )}
        </div>

        {attempts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#cbd6c9] bg-white p-10 text-center shadow-[0_12px_30px_rgba(54,75,61,0.06)]">
            <h2 className="text-xl font-bold text-[#33443a]">No completed quizzes yet.</h2>
            <p className="mt-2 text-sm leading-6 text-[#738077]">Finish a quiz and your result will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt) => (
              <article key={attempt.id} className="flex items-center justify-between gap-4 rounded-2xl border border-[#d9dfd7] bg-white p-5 shadow-sm">
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-[#33443a]">{attempt.fileName}</h2>
                  <p className="mt-1 text-xs text-[#819087]">Completed {new Date(attempt.completedAt).toLocaleString()}</p>
                  <p className="mt-3 text-sm text-[#617067]">{attempt.answeredCount} of {attempt.totalQuestions} questions answered</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-2xl font-black text-[#49623f]">{attempt.score}/{attempt.totalQuestions}</span>
                  <button type="button" onClick={() => onDeleteAttempt(attempt)} className="text-xs font-bold text-[#819087] underline decoration-[#cbd6c9] underline-offset-2 transition hover:text-[#98493e]" aria-label={`Delete ${attempt.fileName} attempt`}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default HistoryView
