import MarkdownContent from './MarkdownContent'

function QuizQuestion({
  question,
  questionIndex,
  answers,
  gradingMode,
  isSubmitted,
  onSelectAnswer,
  onDeselectAnswer,
}) {
  const selectedIndex = answers[questionIndex]
  const hasAnswered = selectedIndex !== undefined
  const showFeedback = gradingMode === 'instant' && hasAnswered
  const showResults = gradingMode === 'end' && isSubmitted

  return (
    <article id={`question-${questionIndex}`} className="rounded-3xl border border-[#d9dfd7] bg-white p-6 shadow-[0_12px_30px_rgba(54,75,61,0.06)] sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#788c3d]">Question {questionIndex + 1}</span>
        {hasAnswered && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#819087]">Answer selected</span>
            {gradingMode === 'end' && !isSubmitted && (
              <button type="button" onClick={() => onDeselectAnswer(questionIndex)} className="text-xs font-bold text-[#819087] underline decoration-[#cbd6c9] underline-offset-2 transition hover:text-[#49623f]">Deselect answer</button>
            )}
          </div>
        )}
      </div>
      <div className="text-xl font-bold leading-8 tracking-tight text-[#26332d] sm:text-2xl"><MarkdownContent>{question.question}</MarkdownContent></div>
      <div className="mt-7 space-y-3">
        {question.options.map((option, optionIndex) => {
          const isSelected = selectedIndex === optionIndex
          const isCorrect = option.isCorrect
          let optionStyle = 'border-[#d9dfd7] hover:border-[#b8c6b6] hover:bg-[#fafcf7]'
          if (showFeedback && isSelected) optionStyle = isCorrect ? 'border-[#72a666] bg-[#eaf6e7] text-[#38643a]' : 'border-[#d27869] bg-[#fff0ed] text-[#98493e]'
          if (showFeedback && !isSelected && isCorrect) optionStyle = 'border-[#72a666] bg-[#eaf6e7] text-[#38643a]'
          if (gradingMode === 'end' && isSelected && !isSubmitted) optionStyle = 'border-[#b3bcc5] bg-[#f3f5f7] text-[#465562] ring-2 ring-[#dfe5eb]'
          if (showResults && isSelected) optionStyle = isCorrect ? 'border-[#72a666] bg-[#eaf6e7] text-[#38643a]' : 'border-[#d27869] bg-[#fff0ed] text-[#98493e]'

          return (
            <button key={optionIndex} type="button" disabled={showFeedback || isSubmitted} onClick={() => onSelectAnswer(questionIndex, optionIndex)} className={`flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition disabled:cursor-default ${optionStyle}`}>
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-current text-xs">{String.fromCharCode(65 + optionIndex)}</span>
              <span className="pt-0.5 leading-6"><MarkdownContent>{option.text}</MarkdownContent></span>
            </button>
          )
        })}
      </div>
      {(showFeedback || showResults) && question.explanation && (
        <div className="mt-6 rounded-2xl bg-[#f4f7ef] px-4 py-4 text-sm leading-6 text-[#5e7063]"><span className="font-bold text-[#334c3a]">Explanation: </span><MarkdownContent>{question.explanation}</MarkdownContent></div>
      )}
    </article>
  )
}

export default QuizQuestion
