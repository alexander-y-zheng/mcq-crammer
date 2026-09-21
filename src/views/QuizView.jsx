import QuizQuestion from '../components/QuizQuestion'

function QuizView({
  fileName,
  questions,
  answers,
  currentQuestion,
  viewMode,
  gradingMode,
  isSubmitted,
  reviewAll,
  showSubmitHint,
  onSelectAnswer,
  onDeselectAnswer,
  onPrevious,
  onNext,
  onShowSummary,
  onSubmit,
  onRetry,
  onSubmitHintEnter,
  onSubmitHintLeave,
  getScore,
}) {
  const isSingleView = viewMode === 'single' && !reviewAll
  const answeredCount = Object.keys(answers).length

  return (
    <section className="flex-1 py-10 sm:py-14">
      <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#788c3d]">{fileName}</p>
          <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1d2925] sm:text-6xl">Let&apos;s get started.</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white px-4 py-3 text-right text-sm font-semibold text-[#617067] shadow-sm">
            {isSingleView ? `Question ${currentQuestion + 1} of ${questions.length}` : `${answeredCount} of ${questions.length} answered`}
          </div>
          {reviewAll && <button type="button" onClick={onShowSummary} className="rounded-xl border border-[#cbd6c9] bg-white px-4 py-3 text-sm font-bold text-[#33443a] transition hover:border-[#91ad37]">Show Summary</button>}
        </div>
      </div>

      {isSingleView ? (
        <div className="mx-auto max-w-3xl">
          <QuizQuestion
            question={questions[currentQuestion]}
            questionIndex={currentQuestion}
            answers={answers}
            gradingMode={gradingMode}
            isSubmitted={isSubmitted}
            onSelectAnswer={onSelectAnswer}
            onDeselectAnswer={onDeselectAnswer}
          />
          <div className="mt-6 flex justify-between gap-4">
            <button type="button" disabled={currentQuestion === 0} onClick={onPrevious} className="rounded-xl border border-[#cbd6c9] bg-white px-5 py-3 text-sm font-bold text-[#33443a] transition hover:border-[#91ad37] disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
            <button type="button" disabled={currentQuestion === questions.length - 1} onClick={onNext} className="rounded-xl bg-[#263b31] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#17281f] disabled:cursor-not-allowed disabled:opacity-40">Next question</button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-6">
          {questions.map((question, index) => (
            <QuizQuestion
              key={index}
              question={question}
              questionIndex={index}
              answers={answers}
              gradingMode={gradingMode}
              isSubmitted={isSubmitted}
              onSelectAnswer={onSelectAnswer}
              onDeselectAnswer={onDeselectAnswer}
            />
          ))}
        </div>
      )}

      <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 border-t border-[#d9dfd7] pt-8">
        {isSubmitted && <p className="text-lg font-bold text-[#49623f]">You scored {getScore()} out of {questions.length}.</p>}
        <div className="relative" onMouseEnter={onSubmitHintEnter} onMouseLeave={onSubmitHintLeave}>
          <button type="button" onClick={onSubmit} disabled={isSubmitted || answeredCount === 0} title={!isSubmitted && answeredCount === 0 ? 'Answer at least one question to submit!' : undefined} aria-describedby={!isSubmitted && answeredCount === 0 ? 'submit-hint' : undefined} className="rounded-xl bg-[#263b31] px-8 py-3.5 text-sm font-bold text-white transition hover:bg-[#17281f] disabled:cursor-not-allowed disabled:opacity-40">{isSubmitted ? 'Quiz submitted' : 'Submit Quiz'}</button>
          {!isSubmitted && answeredCount === 0 && (
            <span id="submit-hint" role="tooltip" className={`pointer-events-none absolute bottom-full left-1/2 z-10 mb-3 w-max max-w-[calc(100vw-3rem)] -translate-x-1/2 rounded-xl bg-[#263b31] px-3 py-2 text-center text-xs font-semibold text-white shadow-lg transition-opacity ${showSubmitHint ? 'opacity-100' : 'opacity-0'}`}>Answer at least one question to submit!</span>
          )}
        </div>
      </div>

      {reviewAll && (
        <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-3 border-t border-[#d9dfd7] pt-8">
          <button type="button" onClick={onShowSummary} className="rounded-xl border border-[#cbd6c9] bg-white px-5 py-3.5 text-sm font-bold text-[#33443a] transition hover:border-[#91ad37]">Show Summary</button>
          <button type="button" onClick={onRetry} className="rounded-xl bg-[#263b31] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#17281f] focus:outline-none focus:ring-4 focus:ring-[#d6ed63]">Retry Quiz</button>
        </div>
      )}
    </section>
  )
}

export default QuizView
