import { useEffect, useState } from 'react'
import { parseMarkdown } from './quizParser'
import ConfirmationDialog from './components/ConfirmationDialog'
import AppHeader from './components/AppHeader'
import SettingsDrawer from './components/SettingsDrawer'
import GuideView from './views/GuideView'
import HomeView from './views/HomeView'
import QuizSetupView from './views/QuizSetupView'
import QuizView from './views/QuizView'
import ResultsView from './views/ResultsView'
import sampleQuizzes from './data/sampleQuizzes'
import { quizGenerationPrompt, quizTemplate } from './data/quizPrompts'
import 'katex/dist/katex.min.css'

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
  const [showMissedQuestions, setShowMissedQuestions] = useState(true)
  const [showSubmitHint, setShowSubmitHint] = useState(false)
  const [reviewAll, setReviewAll] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState('')
  const [showGuide, setShowGuide] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => window.localStorage.getItem('mcq-crammer-theme') === 'dark')
  const [theme, setTheme] = useState(() => window.localStorage.getItem('mcq-crammer-color-theme') || 'green')
  const [font, setFont] = useState(() => window.localStorage.getItem('mcq-crammer-font') || 'default')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    window.localStorage.setItem('mcq-crammer-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  useEffect(() => {
    window.localStorage.setItem('mcq-crammer-color-theme', theme)
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem('mcq-crammer-font', font)
  }, [font])

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

  const deselectAnswer = (questionIndex) => {
    setAnswers((currentAnswers) => {
      const nextAnswers = { ...currentAnswers }
      delete nextAnswers[questionIndex]
      return nextAnswers
    })
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
    setShowMissedQuestions(true)
    setShowSummary(true)
    window.scrollTo(0, 0)
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

  const canChangeGradingMode = !quizStarted || isSubmitted

  return (
    <main className={`theme-${theme} app-font-${font} min-h-screen overflow-hidden bg-[#f6f7f2] text-[#1d2925] ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-16">
        <AppHeader
          showGuide={showGuide}
          onHomeClick={handleHomeClick}
          onGuideToggle={() => setShowGuide((isVisible) => !isVisible)}
          onSettingsOpen={() => setIsSettingsOpen(true)}
        />

        {showGuide ? (
          <GuideView
            generationPrompt={quizGenerationPrompt}
            copiedPrompt={copiedPrompt}
            onCopyPrompt={copyPrompt}
            onDownloadTemplate={downloadTemplate}
          />
        ) : quizStarted ? showSummary ? (
          <ResultsView
            fileName={fileName}
            questions={questions}
            answers={answers}
            score={getScore()}
            missedQuestions={missedQuestions}
            explanationPrompt={explanationPrompt}
            teachingPrompt={teachingPrompt}
            copiedPrompt={copiedPrompt}
            summaryAnimationKey={summaryAnimationKey}
            showMissedQuestions={showMissedQuestions}
            onToggleMissedQuestions={() => setShowMissedQuestions((isVisible) => !isVisible)}
            onCopyPrompt={copyPrompt}
            onBackToQuiz={() => { setShowSummary(false); setReviewAll(true) }}
            onRetry={() => setShowRetryConfirmation(true)}
          />
        ) : (
          <QuizView
            fileName={fileName}
            questions={questions}
            answers={answers}
            currentQuestion={currentQuestion}
            viewMode={viewMode}
            gradingMode={gradingMode}
            isSubmitted={isSubmitted}
            reviewAll={reviewAll}
            showSubmitHint={showSubmitHint}
            onSelectAnswer={selectAnswer}
            onDeselectAnswer={deselectAnswer}
            onPrevious={() => setCurrentQuestion((index) => index - 1)}
            onNext={() => setCurrentQuestion((index) => index + 1)}
            onShowSummary={showSummaryPage}
            onSubmit={submitQuiz}
            onRetry={() => setShowRetryConfirmation(true)}
            onSubmitHintEnter={() => setShowSubmitHint(true)}
            onSubmitHintLeave={() => setShowSubmitHint(false)}
            getScore={getScore}
          />
        ) : (
          <HomeView
            fileName={fileName}
            questions={questions}
            selectedSample={selectedSample}
            isDragging={isDragging}
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onFileSelect={handleFile}
            onSampleSelect={(fileNameValue) => {
              const sample = sampleQuizzes.find(({ fileName: name }) => name === fileNameValue)
              setSelectedSample(fileNameValue)
              if (sample) saveQuiz(sample.content, sample.fileName)
            }}
          />
        )}

        {!showGuide && !quizStarted && isConfigOpen && (
          <QuizSetupView
            questionsCount={questions.length}
            viewMode={viewMode}
            gradingMode={gradingMode}
            onViewModeChange={setViewMode}
            onGradingModeChange={setGradingMode}
            onStart={startQuiz}
          />
        )}

        {!showGuide && !quizStarted && (fileName || error) && (
          <section className="mb-8 rounded-2xl border border-[#d9dfd7] bg-white px-5 py-4 text-sm shadow-sm">
            {error ? <p className="font-semibold text-[#a34d3f]">{error}</p> : <p className="font-semibold text-[#49623f]">{fileName} loaded: {questions.length} questions ready{quizStarted ? ` in ${viewMode === 'single' ? 'one-question' : 'all-at-once'} mode.` : '.'}</p>}
          </section>
        )}
      </div>

      {showSubmitConfirmation && (
        <ConfirmationDialog
          eyebrow="Ready to submit?"
          title="Some questions are unanswered."
          description={`You have ${unansweredCount} unanswered ${unansweredCount === 1 ? 'question' : 'questions'}. Are you sure you want to submit without answering them?`}
          confirmLabel="Submit Quiz"
          titleId="submit-confirmation-title"
          onCancel={() => setShowSubmitConfirmation(false)}
          onConfirm={confirmSubmitQuiz}
        />
      )}

      {showResetConfirmation && (
        <ConfirmationDialog
          eyebrow="Leave quiz?"
          title="Return to the home page?"
          description="You will lose your progress and will have to reupload a file to start another quiz."
          confirmLabel="Return Home"
          titleId="reset-confirmation-title"
          onCancel={() => setShowResetConfirmation(false)}
          onConfirm={returnHome}
        />
      )}

      {showRetryConfirmation && (
        <ConfirmationDialog
          eyebrow="Start over?"
          title="Retry this quiz?"
          description="This will completely reset the quiz and wipe all results. Your current answers and score will be lost."
          confirmLabel="Retry Quiz"
          titleId="retry-confirmation-title"
          onCancel={() => setShowRetryConfirmation(false)}
          onConfirm={confirmRetryQuiz}
        />
      )}

      <SettingsDrawer
        isOpen={isSettingsOpen}
        viewMode={viewMode}
        gradingMode={gradingMode}
        theme={theme}
        font={font}
        isDarkMode={isDarkMode}
        canChangeGradingMode={canChangeGradingMode}
        onClose={() => setIsSettingsOpen(false)}
        onViewModeChange={setViewMode}
        onGradingModeChange={setGradingMode}
        onThemeChange={setTheme}
        onFontChange={setFont}
        onDarkModeToggle={() => setIsDarkMode((isEnabled) => !isEnabled)}
      />
    </main>
  )
}

export default App
