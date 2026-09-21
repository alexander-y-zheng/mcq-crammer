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
import useQuizSession from './hooks/useQuizSession'
import useWorkspacePreferences from './hooks/useWorkspacePreferences'
import 'katex/dist/katex.min.css'

const createSeededRandom = (seed) => () => {
  seed += 0x6D2B79F5
  let value = seed
  value = Math.imul(value ^ (value >>> 15), value | 1)
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296
}

const shuffleAnswers = (questionsToShuffle, seed) => {
  const random = createSeededRandom(seed)

  return questionsToShuffle.map((question) => {
  const shuffledOptions = [...question.options]
  for (let index = shuffledOptions.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1))
    ;[shuffledOptions[index], shuffledOptions[randomIndex]] = [shuffledOptions[randomIndex], shuffledOptions[index]]
  }
  return { ...question, options: shuffledOptions }
  })
}

function App() {
  const [questions, setQuestions] = useState([])
  const [fileName, setFileName] = useState('')
  const [selectedSample, setSelectedSample] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [viewMode, setViewMode] = useState('single')
  const [gradingMode, setGradingMode] = useState('instant')
  const [randomizeAnswers, setRandomizeAnswers] = useState(false)
  const [showResetConfirmation, setShowResetConfirmation] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState('')
  const [showGuide, setShowGuide] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const {
    isDarkMode,
    theme,
    font,
    setIsDarkMode,
    setTheme,
    setFont,
  } = useWorkspacePreferences()
  const quizSession = useQuizSession({ questions, viewMode, gradingMode })
  const {
    quizStarted,
    answers,
    currentQuestion,
    isSubmitted,
    unansweredCount,
    showSubmitConfirmation,
    showRetryConfirmation,
    showSummary,
    summaryAnimationKey,
    showMissedQuestions,
    showSubmitHint,
    reviewAll,
    setCurrentQuestion,
    setShowSubmitConfirmation,
    setShowRetryConfirmation,
    setShowSummary,
    setShowMissedQuestions,
    setShowSubmitHint,
    setReviewAll,
    resetForQuizLoad,
    startQuiz: startQuizSession,
    resetToHome,
    confirmRetryQuiz,
    selectAnswer,
    deselectAnswer,
    submitQuiz,
    confirmSubmitQuiz,
    showSummaryPage,
    getScore,
    missedQuestions,
  } = quizSession

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
    resetForQuizLoad()
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
    if (randomizeAnswers) {
      setQuestions((currentQuestions) => shuffleAnswers(currentQuestions, Date.now()))
    }
    startQuizSession()
    setIsConfigOpen(false)
  }

  const retryQuiz = () => {
    if (randomizeAnswers) {
      setQuestions((currentQuestions) => shuffleAnswers(currentQuestions, Date.now()))
    }
    confirmRetryQuiz()
  }

  const returnHome = () => {
    setQuestions([])
    setFileName('')
    setSelectedSample('')
    setError('')
    setShowResetConfirmation(false)
    resetToHome()
    setIsConfigOpen(false)
  }

  const handleHomeClick = () => {
    if (quizStarted) setShowResetConfirmation(true)
  }

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
    <main className={`theme-${theme} app-font-${font} flex min-h-screen flex-col overflow-hidden bg-[#f6f7f2] text-[#1d2925] ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8 sm:px-10 lg:px-16">
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
            randomizeAnswers={randomizeAnswers}
            onViewModeChange={setViewMode}
            onGradingModeChange={setGradingMode}
            onRandomizeAnswersChange={setRandomizeAnswers}
            onStart={startQuiz}
          />
        )}

        {!showGuide && !quizStarted && (fileName || error) && (
          <section className="mb-8 rounded-2xl border border-[#d9dfd7] bg-white px-5 py-4 text-sm shadow-sm">
            {error ? <p className="font-semibold text-[#a34d3f]">{error}</p> : <p className="font-semibold text-[#49623f]">{fileName} loaded: {questions.length} questions ready{quizStarted ? ` in ${viewMode === 'single' ? 'one-question' : 'all-at-once'} mode.` : '.'}</p>}
          </section>
        )}
      </div>

      <footer className="border-t border-[#d9dfd7] px-6 py-5 text-center text-xs text-[#819087] sm:px-10 lg:px-16">
        <p>Made by Alex Zheng, 2026. Have feedback? <a href="https://neu.co1.qualtrics.com/jfe/form/SV_9ELn11adEWyNouG" target="_blank" rel="noreferrer" className="font-bold text-[#49623f] underline decoration-[#cbd6c9] underline-offset-2 transition hover:text-[#788c3d]">Let me know here!</a></p>
      </footer>

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
          onConfirm={retryQuiz}
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
