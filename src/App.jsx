import { useEffect, useState } from 'react'
import { parseMarkdown } from './quizParser'
import biologyQuiz from './quiz_examples/quiz_biology_basics.md?raw'
import financeQuiz from './quiz_examples/quiz_finance_tvm.md?raw'
import pythonQuiz from './quiz_examples/quiz_python_basics.md?raw'

const sampleQuizzes = [
  { name: 'Python basics', fileName: 'quiz_python_basics.md', content: pythonQuiz },
  { name: 'Biology basics', fileName: 'quiz_biology_basics.md', content: biologyQuiz },
  { name: 'Finance: time value of money', fileName: 'quiz_finance_tvm.md', content: financeQuiz },
]

const quizGenerationPrompt = `Create a multiple-choice quiz in Markdown using exactly this format:

### [Question]
- [ ] [Incorrect answer]
- [x] [Correct answer]
- [ ] [Incorrect answer]
- [ ] [Incorrect answer]
> Explanation: [A concise explanation of why the correct answer is right]

Requirements:
- Create 10 questions about [INSERT TOPIC].
- Give each question exactly 4 answer options.
- Mark exactly one correct option with [x] and all others with [ ].
- Put the correct answer in a different position each time.
- Keep explanations clear and educational.
- Return only the Markdown quiz, with no introduction or closing text.`

const quizTemplate = `# My Quiz

### 1. Write your question here?
- [ ] Incorrect answer
- [x] Correct answer
- [ ] Incorrect answer
- [ ] Incorrect answer
> Explanation: Explain why the correct answer is right.

### 2. Write another question here?
- [ ] Incorrect answer
- [ ] Incorrect answer
- [x] Correct answer
- [ ] Incorrect answer
> Explanation: Explain why the correct answer is right.
`

function App() {
  const [questions, setQuestions] = useState([])
  const [fileName, setFileName] = useState('')
  const [selectedSample, setSelectedSample] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [viewMode, setViewMode] = useState('single')
  const [gradingMode, setGradingMode] = useState('instant')
  const [quizStarted, setQuizStarted] = useState(false)
  const [answers, setAnswers] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [unansweredCount, setUnansweredCount] = useState(0)
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false)
  const [showResetConfirmation, setShowResetConfirmation] = useState(false)
  const [showRetryConfirmation, setShowRetryConfirmation] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [summaryAnimationKey, setSummaryAnimationKey] = useState(0)
  const [reviewAll, setReviewAll] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState('')
  const [showGuide, setShowGuide] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => window.localStorage.getItem('mcq-crammer-theme') === 'dark')

  useEffect(() => {
    window.localStorage.setItem('mcq-crammer-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  useEffect(() => {
    if (!isConfigOpen || quizStarted) return
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
    })
  }, [isConfigOpen, quizStarted])

  const saveQuiz = (content, name) => {
    const parsedQuestions = parseMarkdown(content)
    if (parsedQuestions.length === 0) {
      setQuestions([])
      setFileName('')
      setError('No questions found. Choose a Markdown quiz with ### questions.')
      return
    }

    setQuestions(parsedQuestions)
    setFileName(name)
    setError('')
    setQuizStarted(false)
    setAnswers({})
    setIsSubmitted(false)
    setUnansweredCount(0)
    setShowSubmitConfirmation(false)
    setShowRetryConfirmation(false)
    setShowSummary(false)
    setReviewAll(false)
    setCopiedPrompt('')
    setIsConfigOpen(true)
  }

  const handleFile = async (file) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.md')) {
      setError('Please upload a .md Markdown file.')
      return
    }

    saveQuiz(await file.text(), file.name)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    handleFile(event.dataTransfer.files[0])
  }

  const startQuiz = () => {
    window.scrollTo(0, 0)
    setAnswers({})
    setCurrentQuestion(0)
    setIsSubmitted(false)
    setUnansweredCount(0)
    setShowSubmitConfirmation(false)
    setShowRetryConfirmation(false)
    setShowSummary(false)
    setReviewAll(false)
    setQuizStarted(true)
    setIsConfigOpen(false)
  }

  const returnHome = () => {
    setQuestions([])
    setFileName('')
    setSelectedSample('')
    setError('')
    setQuizStarted(false)
    setAnswers({})
    setCurrentQuestion(0)
    setIsSubmitted(false)
    setUnansweredCount(0)
    setShowSubmitConfirmation(false)
    setShowResetConfirmation(false)
    setShowRetryConfirmation(false)
    setShowSummary(false)
    setReviewAll(false)
    setIsConfigOpen(false)
    window.scrollTo(0, 0)
  }

  const handleHomeClick = () => {
    if (quizStarted) setShowResetConfirmation(true)
  }

  const confirmRetryQuiz = () => {
    setShowRetryConfirmation(false)
    startQuiz()
  }

  const smoothScrollTo = (targetTop) => {
    const startTop = window.scrollY
    const distance = targetTop - startTop
    const duration = 700
    const startTime = performance.now()

    const animateScroll = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easedProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - ((-2 * progress + 2) ** 2) / 2
      window.scrollTo(0, startTop + (distance * easedProgress))
      if (progress < 1) window.requestAnimationFrame(animateScroll)
    }

    window.requestAnimationFrame(animateScroll)
  }

  const selectAnswer = (questionIndex, optionIndex) => {
    if (gradingMode === 'instant' && answers[questionIndex] !== undefined) return
    setAnswers((currentAnswers) => ({ ...currentAnswers, [questionIndex]: optionIndex }))
    window.setTimeout(() => {
      if (viewMode === 'all' || reviewAll) {
        const targetQuestionIndex = gradingMode === 'instant' ? questionIndex : questionIndex + 1
        const targetQuestion = document.getElementById(`question-${targetQuestionIndex}`)
        if (targetQuestion) smoothScrollTo(targetQuestion.getBoundingClientRect().top + window.scrollY)
      } else {
        smoothScrollTo(document.documentElement.scrollHeight)
      }
    }, 0)
  }

  const submitQuiz = () => {
    const unanswered = questions.length - Object.keys(answers).length
    if (unanswered > 0) {
      setUnansweredCount(unanswered)
      setShowSubmitConfirmation(true)
      return
    }
    setIsSubmitted(true)
    showSummaryPage()
  }

  const confirmSubmitQuiz = () => {
    setShowSubmitConfirmation(false)
    setIsSubmitted(true)
    showSummaryPage()
  }

  const showSummaryPage = () => {
    setSummaryAnimationKey((key) => key + 1)
    setShowSummary(true)
  }

  const getScore = () => questions.reduce((score, question, index) => {
    const selectedOption = question.options[answers[index]]
    return score + (selectedOption?.isCorrect ? 1 : 0)
  }, 0)

  const missedQuestions = questions.filter((question, index) => !question.options[answers[index]]?.isCorrect)
  const missedQuestionText = missedQuestions.map((question) => {
    const questionIndex = questions.indexOf(question)
    const selectedAnswer = question.options[answers[questionIndex]]?.text || 'No answer selected'
    const correctAnswer = question.options.find((option) => option.isCorrect)?.text || 'No correct answer marked'
    return `Question: ${question.question}\nMy answer: ${selectedAnswer}\nCorrect answer: ${correctAnswer}`
  }).join('\n\n')
  const explanationPrompt = `I am reviewing a quiz called "${fileName}". Explain why my answers below were wrong. For each question, explain the reasoning, identify the misconception, and keep the explanation clear.\n\n${missedQuestionText}`
  const teachingPrompt = `Teach me the concepts I missed in this quiz, "${fileName}". Build a short study lesson from these questions, use simple examples, and finish with a few practice questions.\n\n${missedQuestionText}`

  const copyPrompt = async (promptName, prompt) => {
    await navigator.clipboard.writeText(prompt)
    setCopiedPrompt(promptName)
    window.setTimeout(() => setCopiedPrompt(''), 1800)
  }

  const downloadTemplate = () => {
    const blob = new Blob([quizTemplate], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'quiz-template.md'
    link.click()
    URL.revokeObjectURL(url)
  }

  const renderQuestion = (question, questionIndex) => {
    const selectedIndex = answers[questionIndex]
    const hasAnswered = selectedIndex !== undefined
    const showFeedback = gradingMode === 'instant' && hasAnswered
    const showResults = gradingMode === 'end' && isSubmitted

    return (
      <article id={`question-${questionIndex}`} key={questionIndex} className="rounded-3xl border border-[#d9dfd7] bg-white p-6 shadow-[0_12px_30px_rgba(54,75,61,0.06)] sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#788c3d]">Question {questionIndex + 1}</span>
          {hasAnswered && <span className="text-xs font-semibold text-[#819087]">Answer selected</span>}
        </div>
        <h2 className="text-xl font-bold leading-8 tracking-tight text-[#26332d] sm:text-2xl">{question.question}</h2>
        <div className="mt-7 space-y-3">
          {question.options.map((option, optionIndex) => {
            const isSelected = selectedIndex === optionIndex
            const isCorrect = option.isCorrect
            let optionStyle = 'border-[#d9dfd7] hover:border-[#b8c6b6] hover:bg-[#fafcf7]'
            if (showFeedback && isSelected) optionStyle = isCorrect ? 'border-[#72a666] bg-[#eaf6e7] text-[#38643a]' : 'border-[#d27869] bg-[#fff0ed] text-[#98493e]'
            if (showFeedback && !isSelected && isCorrect) optionStyle = 'border-[#72a666] bg-[#eaf6e7] text-[#38643a]'
            if (gradingMode === 'end' && isSelected && !isSubmitted) optionStyle = 'border-[#91ad37] bg-[#f4f9df] text-[#49623f] ring-2 ring-[#e9f3c5]'
            if (showResults && isSelected) optionStyle = isCorrect ? 'border-[#72a666] bg-[#eaf6e7] text-[#38643a]' : 'border-[#d27869] bg-[#fff0ed] text-[#98493e]'

            return (
              <button key={optionIndex} type="button" disabled={showFeedback || isSubmitted} onClick={() => selectAnswer(questionIndex, optionIndex)} className={`flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition disabled:cursor-default ${optionStyle}`}>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-current text-xs">{String.fromCharCode(65 + optionIndex)}</span>
                <span className="pt-0.5 leading-6">{option.text}</span>
              </button>
            )
          })}
        </div>
        {(showFeedback || showResults) && question.explanation && (
          <div className="mt-6 rounded-2xl bg-[#f4f7ef] px-4 py-4 text-sm leading-6 text-[#5e7063]"><span className="font-bold text-[#334c3a]">Explanation: </span>{question.explanation}</div>
        )}
      </article>
    )
  }

  return (
    <main className={`min-h-screen overflow-hidden bg-[#f6f7f2] text-[#1d2925] ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between border-b border-[#d9dfd7] pb-6">
          <button type="button" onClick={handleHomeClick} className="flex items-center gap-3 font-bold tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#d6ed63] text-lg text-[#26331f]">?</span>
            <span>MCQ Crammer</span>
          </button>
          <div className="flex items-center gap-5">
            <button type="button" onClick={() => setShowGuide((isVisible) => !isVisible)} className="text-xs font-bold uppercase tracking-[0.14em] text-[#6c7b70] transition hover:text-[#334c3a]">
              {showGuide ? 'Back to workspace' : 'How to use AI'}
            </button>
            <button
              type="button"
              onClick={() => setIsDarkMode((isEnabled) => !isEnabled)}
              className="theme-toggle rounded-full border border-[#cbd6c9] bg-white px-3 py-2 text-xs font-bold text-[#49623f] transition hover:border-[#91ad37]"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? 'Light mode' : 'Dark mode'}
            </button>
          </div>
        </header>

        {showGuide ? (
          <section className="flex-1 py-10 sm:py-14">
            <div className="mx-auto max-w-3xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#788c3d]">Build a quiz in seconds</p>
              <h1 className="max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.04em] text-[#1d2925] sm:text-6xl">How to use AI to generate quizzes.</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#617067]">Ask ChatGPT or Claude for a quiz in the format MCQ Crammer understands, then upload the Markdown file here.</p>

              <div className="mt-10 rounded-3xl border border-[#d9dfd7] bg-white p-6 shadow-[0_12px_30px_rgba(54,75,61,0.06)] sm:p-8">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-[#26332d]">Copy this prompt</h2>
                    <p className="mt-1 text-sm text-[#738077]">Replace the topic placeholder before sending.</p>
                  </div>
                  <button type="button" onClick={() => copyPrompt('guide', quizGenerationPrompt)} className="shrink-0 rounded-lg border border-[#cbd6c9] bg-white px-3 py-2 text-xs font-bold text-[#49623f] transition hover:border-[#91ad37]">{copiedPrompt === 'guide' ? 'Copied' : 'Copy'}</button>
                </div>
                <textarea readOnly value={quizGenerationPrompt} className="min-h-80 w-full resize-y rounded-2xl border border-[#cbd6c9] bg-[#f8faf5] p-4 font-mono text-sm leading-6 text-[#4d6253] outline-none focus:border-[#91ad37] focus:ring-4 focus:ring-[#e9f3c5]" aria-label="AI quiz generation prompt" />
              </div>

              <div className="mt-6 flex flex-col items-start justify-between gap-5 rounded-3xl bg-[#263b31] p-6 text-white sm:flex-row sm:items-center sm:p-8">
                <div>
                  <h2 className="text-xl font-bold">Start from a template</h2>
                  <p className="mt-1 max-w-lg text-sm leading-6 text-[#c5d3c5]">Download a ready-to-edit Markdown file, then fill in your own questions and answers.</p>
                </div>
                <button type="button" onClick={downloadTemplate} className="shrink-0 rounded-xl bg-[#d6ed63] px-5 py-3 text-sm font-bold text-[#26331f] transition hover:bg-[#e5f69a]">Download quiz-template.md</button>
              </div>
            </div>
          </section>
        ) : quizStarted ? showSummary ? (
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
                  style={{ '--score-percent': `${questions.length ? (getScore() / questions.length) * 100 : 0}%` }}
                >
                  <div className="flex size-24 flex-col items-center justify-center rounded-full bg-[#e9f3c5]">
                    <span className="whitespace-nowrap text-[clamp(1rem,5vw,1.875rem)] font-black leading-none tracking-tight">{getScore()} / {questions.length}</span>
                    <span className="text-xs font-bold uppercase tracking-wider">score</span>
                  </div>
                </div>
              </div>

              {missedQuestions.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-[#33443a]">Review your missed questions</h2>
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
                        <button type="button" onClick={() => copyPrompt(promptName, prompt)} className="rounded-lg border border-[#cbd6c9] bg-white px-3 py-1.5 text-xs font-bold text-[#49623f] transition hover:border-[#91ad37]">{copiedPrompt === promptName ? 'Copied' : 'Copy'}</button>
                      </div>
                      <textarea id={`${promptName}-prompt`} readOnly value={prompt} className="min-h-36 w-full resize-y rounded-2xl border border-[#cbd6c9] bg-white p-4 text-sm leading-6 text-[#617067] outline-none focus:border-[#91ad37] focus:ring-4 focus:ring-[#e9f3c5]" />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-10 space-y-3">
                <button type="button" onClick={() => { setShowSummary(false); setReviewAll(true) }} className="w-full rounded-xl bg-[#263b31] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#17281f] focus:outline-none focus:ring-4 focus:ring-[#d6ed63]">Back to Quiz</button>
                <button type="button" onClick={() => setShowRetryConfirmation(true)} className="w-full rounded-xl border border-[#cbd6c9] bg-white px-5 py-3.5 text-sm font-bold text-[#33443a] transition hover:border-[#91ad37]">Retry Quiz</button>
              </div>
            </div>
          </section>
        ) : (
          <section className="flex-1 py-10 sm:py-14">
            <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#788c3d]">{fileName}</p>
                <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1d2925] sm:text-6xl">Let&apos;s get started.</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white px-4 py-3 text-right text-sm font-semibold text-[#617067] shadow-sm">
                  {viewMode === 'single' && !reviewAll ? `Question ${currentQuestion + 1} of ${questions.length}` : `${Object.keys(answers).length} of ${questions.length} answered`}
                </div>
                {reviewAll && <button type="button" onClick={showSummaryPage} className="rounded-xl border border-[#cbd6c9] bg-white px-4 py-3 text-sm font-bold text-[#33443a] transition hover:border-[#91ad37]">Show Summary</button>}
              </div>
            </div>

            {viewMode === 'single' && !reviewAll ? (
              <div className="mx-auto max-w-3xl">
                {renderQuestion(questions[currentQuestion], currentQuestion)}
                <div className="mt-6 flex justify-between gap-4">
                  <button type="button" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion((index) => index - 1)} className="rounded-xl border border-[#cbd6c9] bg-white px-5 py-3 text-sm font-bold text-[#33443a] transition hover:border-[#91ad37] disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                  <button type="button" disabled={currentQuestion === questions.length - 1} onClick={() => setCurrentQuestion((index) => index + 1)} className="rounded-xl bg-[#263b31] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#17281f] disabled:cursor-not-allowed disabled:opacity-40">Next question</button>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-6">
                {questions.map((question, index) => renderQuestion(question, index))}
              </div>
            )}

            {gradingMode === 'end' && !reviewAll && (
              <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 border-t border-[#d9dfd7] pt-8">
                {isSubmitted && <p className="text-lg font-bold text-[#49623f]">You scored {getScore()} out of {questions.length}.</p>}
                <button type="button" onClick={submitQuiz} disabled={isSubmitted || Object.keys(answers).length === 0} className="rounded-xl bg-[#263b31] px-8 py-3.5 text-sm font-bold text-white transition hover:bg-[#17281f] disabled:cursor-not-allowed disabled:opacity-40">{isSubmitted ? 'Quiz submitted' : 'Submit Quiz'}</button>
              </div>
            )}

            {reviewAll && (
              <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-3 border-t border-[#d9dfd7] pt-8">
                <button type="button" onClick={showSummaryPage} className="rounded-xl border border-[#cbd6c9] bg-white px-5 py-3.5 text-sm font-bold text-[#33443a] transition hover:border-[#91ad37]">Show Summary</button>
                <button type="button" onClick={() => setShowRetryConfirmation(true)} className="rounded-xl bg-[#263b31] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#17281f] focus:outline-none focus:ring-4 focus:ring-[#d6ed63]">Retry Quiz</button>
              </div>
            )}
          </section>
        ) : (
        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-[#788c3d]">Study smarter</p>
            <h1 className="max-w-xl text-5xl font-black leading-[0.98] tracking-[-0.04em] text-[#1d2925] sm:text-7xl">Turn notes into momentum.</h1>
            <p className="mt-7 max-w-md text-lg leading-8 text-[#617067]">Bring a Markdown quiz or start with a sample. We&apos;ll turn it into focused multiple-choice practice.</p>
          </div>

          <div className="space-y-5">
            <div
              onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`rounded-3xl border-2 border-dashed bg-white p-8 shadow-[0_18px_45px_rgba(54,75,61,0.08)] transition sm:p-10 ${isDragging ? 'border-[#91ad37] bg-[#f7fbe9]' : 'border-[#cbd6c9]'}`}
            >
              {fileName ? (
                <>
                  <div className="mb-7 flex size-16 items-center justify-center rounded-2xl border border-[#cbd6c9] bg-[#f4f9df] text-xs font-black uppercase tracking-wider text-[#49623f]" aria-hidden="true">MD</div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#788c3d]">Quiz uploaded</p>
                  <h2 className="mt-2 break-words text-2xl font-bold tracking-tight text-[#26332d]">{fileName}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#738077]">{questions.length} questions ready to configure.</p>
                  <label className="mt-7 inline-flex cursor-pointer items-center rounded-xl border border-[#cbd6c9] bg-white px-5 py-3 text-sm font-bold text-[#33443a] transition hover:border-[#91ad37] focus-within:ring-4 focus-within:ring-[#d6ed63]">
                    Choose another .md file
                    <input type="file" accept=".md,text/markdown" className="sr-only" onChange={(event) => handleFile(event.target.files[0])} />
                  </label>
                </>
              ) : (
                <>
                  <div className="mb-8 flex size-12 items-center justify-center rounded-2xl bg-[#e9f3c5] text-2xl" aria-hidden="true">↑</div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#26332d]">Drop your quiz here</h2>
                  <p className="mt-2 text-sm leading-6 text-[#738077]">Upload a Markdown file and we&apos;ll parse each question automatically.</p>
                  <label className="mt-7 inline-flex cursor-pointer items-center rounded-xl bg-[#263b31] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#17281f] focus-within:ring-4 focus-within:ring-[#d6ed63]">
                    Choose .md file
                    <input type="file" accept=".md,text/markdown" className="sr-only" onChange={(event) => handleFile(event.target.files[0])} />
                  </label>
                  <p className="mt-4 text-xs text-[#99a59c]">Maximum flexibility, zero formatting fuss.</p>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.16em] text-[#97a39a]"><span className="h-px flex-1 bg-[#d9dfd7]" />or use a sample<span className="h-px flex-1 bg-[#d9dfd7]" /></div>
            <select
              value={selectedSample}
              onChange={(event) => {
                const sample = sampleQuizzes.find(({ fileName: name }) => name === event.target.value)
                setSelectedSample(event.target.value)
                if (sample) saveQuiz(sample.content, sample.fileName)
              }}
              className="w-full appearance-none rounded-xl border border-[#cbd6c9] bg-white px-4 py-3.5 text-sm font-semibold text-[#33443a] outline-none transition focus:border-[#91ad37] focus:ring-4 focus:ring-[#e9f3c5]"
            >
              <option value="">Select a sample quiz...</option>
              {sampleQuizzes.map(({ fileName: name, name: label }) => <option key={name} value={name}>{label}</option>)}
            </select>
          </div>
        </section>
        )}

        {!showGuide && !quizStarted && isConfigOpen && (
          <section className="mx-auto mb-8 w-full max-w-3xl rounded-3xl border border-[#d9dfd7] bg-white p-7 shadow-[0_18px_45px_rgba(54,75,61,0.08)] sm:p-9" aria-labelledby="quiz-settings-title">
            <div className="mb-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#788c3d]">Quiz ready</p>
              <h2 id="quiz-settings-title" className="text-3xl font-black tracking-tight text-[#26332d]">Set your study mode</h2>
              <p className="mt-2 text-sm leading-6 text-[#738077]">Choose how you want to move through {questions.length} questions.</p>
            </div>

            <div className="space-y-6">
              <fieldset>
                <legend className="mb-3 text-sm font-bold text-[#33443a]">View mode</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[['single', 'One question at a time'], ['all', 'All on one page']].map(([value, label]) => (
                    <label key={value} className={`cursor-pointer rounded-2xl border p-4 transition ${viewMode === value ? 'border-[#91ad37] bg-[#f4f9df] ring-2 ring-[#e9f3c5]' : 'border-[#d9dfd7] hover:border-[#b8c6b6]'}`}>
                      <input type="radio" name="view-mode" value={value} checked={viewMode === value} onChange={(event) => setViewMode(event.target.value)} className="sr-only" />
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
                      <input type="radio" name="grading-mode" value={value} checked={gradingMode === value} onChange={(event) => setGradingMode(event.target.value)} className="sr-only" />
                      <span className="block text-sm font-bold text-[#33443a]">{label}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#819087]">{value === 'instant' ? 'Learn as you go.' : 'See your result after the last question.'}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <button type="button" onClick={startQuiz} className="mt-8 w-full rounded-xl bg-[#263b31] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#17281f] focus:outline-none focus:ring-4 focus:ring-[#d6ed63]">Start Quiz</button>
          </section>
        )}

        {!showGuide && !quizStarted && (fileName || error) && (
          <section className="mb-8 rounded-2xl border border-[#d9dfd7] bg-white px-5 py-4 text-sm shadow-sm">
            {error ? <p className="font-semibold text-[#a34d3f]">{error}</p> : <p className="font-semibold text-[#49623f]">{fileName} loaded: {questions.length} questions ready{quizStarted ? ` in ${viewMode === 'single' ? 'one-question' : 'all-at-once'} mode.` : '.'}</p>}
          </section>
        )}
      </div>

      {showSubmitConfirmation && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#1d2925]/45 px-5 py-8 backdrop-blur-sm" role="presentation">
          <section className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl sm:p-9" role="dialog" aria-modal="true" aria-labelledby="submit-confirmation-title">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#788c3d]">Ready to submit?</p>
            <h2 id="submit-confirmation-title" className="text-3xl font-black tracking-tight text-[#26332d]">Some questions are unanswered.</h2>
            <p className="mt-3 text-sm leading-6 text-[#738077]">You have {unansweredCount} unanswered {unansweredCount === 1 ? 'question' : 'questions'}. Are you sure you want to submit without answering them?</p>
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowSubmitConfirmation(false)} className="rounded-xl border border-[#cbd6c9] bg-white px-5 py-3.5 text-sm font-bold text-[#33443a] transition hover:border-[#91ad37]">Cancel</button>
              <button type="button" onClick={confirmSubmitQuiz} className="rounded-xl bg-[#263b31] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#17281f] focus:outline-none focus:ring-4 focus:ring-[#d6ed63]">Submit Quiz</button>
            </div>
          </section>
        </div>
      )}

      {showResetConfirmation && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#1d2925]/45 px-5 py-8 backdrop-blur-sm" role="presentation">
          <section className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl sm:p-9" role="dialog" aria-modal="true" aria-labelledby="reset-confirmation-title">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#788c3d]">Leave quiz?</p>
            <h2 id="reset-confirmation-title" className="text-3xl font-black tracking-tight text-[#26332d]">Return to the home page?</h2>
            <p className="mt-3 text-sm leading-6 text-[#738077]">You will lose your progress and will have to reupload a file to start another quiz.</p>
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowResetConfirmation(false)} className="rounded-xl border border-[#cbd6c9] bg-white px-5 py-3.5 text-sm font-bold text-[#33443a] transition hover:border-[#91ad37]">Cancel</button>
              <button type="button" onClick={returnHome} className="rounded-xl bg-[#263b31] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#17281f] focus:outline-none focus:ring-4 focus:ring-[#d6ed63]">Return Home</button>
            </div>
          </section>
        </div>
      )}

      {showRetryConfirmation && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#1d2925]/45 px-5 py-8 backdrop-blur-sm" role="presentation">
          <section className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl sm:p-9" role="dialog" aria-modal="true" aria-labelledby="retry-confirmation-title">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#788c3d]">Start over?</p>
            <h2 id="retry-confirmation-title" className="text-3xl font-black tracking-tight text-[#26332d]">Retry this quiz?</h2>
            <p className="mt-3 text-sm leading-6 text-[#738077]">This will completely reset the quiz and wipe all results. Your current answers and score will be lost.</p>
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowRetryConfirmation(false)} className="rounded-xl border border-[#cbd6c9] bg-white px-5 py-3.5 text-sm font-bold text-[#33443a] transition hover:border-[#91ad37]">Cancel</button>
              <button type="button" onClick={confirmRetryQuiz} className="rounded-xl bg-[#263b31] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#17281f] focus:outline-none focus:ring-4 focus:ring-[#d6ed63]">Retry Quiz</button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default App
