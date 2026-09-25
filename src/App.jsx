import { lazy, Suspense, useEffect, useState } from 'react'
import { parseMarkdown } from './quizParser'
import ConfirmationDialog from './components/ConfirmationDialog'
import AppHeader from './components/AppHeader'
import SettingsDrawer from './components/SettingsDrawer'
import GuideView from './views/GuideView'
import HistoryView from './views/HistoryView'
import HomeView from './views/HomeView'
import QuizSetupView from './views/QuizSetupView'
import ResultsView from './views/ResultsView'
import sampleQuizzes from './data/sampleQuizzes'
import { quizGenerationPrompt, quizTemplate } from './data/quizPrompts'
import useQuizSession from './hooks/useQuizSession'
import useWorkspacePreferences from './hooks/useWorkspacePreferences'
import { clearAttempts, createQuizId, loadAttempts, loadPartialQuiz, removeAttempt, removePartialQuiz, saveAttempts, savePartialQuiz } from './studyStorage'
import 'katex/dist/katex.min.css'

const QuizView = lazy(() => import('./views/QuizView'))

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

const faviconColors = {
  green: { light: ['#d6ed63', '#26331f'], dark: ['#40501f', '#f1f6c8'] },
  sepia: { light: ['#f1e2c9', '#5a4230'], dark: ['#493326', '#f1dfc5'] },
  blue: { light: ['#dcecf6', '#31566f'], dark: ['#1f3d4f', '#d7eaf7'] },
  purple: { light: ['#eadcf5', '#582b80'], dark: ['#3b2450', '#f0ddff'] },
}

const updateFavicon = (theme, isDarkMode) => {
  const link = document.querySelector('link[rel="icon"]')
  if (!link) return
  const [background, foreground] = (faviconColors[theme] || faviconColors.green)[isDarkMode ? 'dark' : 'light']
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${background}"/><text x="32" y="46" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="${foreground}">?</text></svg>`
  link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function App() {
  const [questions, setQuestions] = useState([])
  const [quizContent, setQuizContent] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [fileName, setFileName] = useState('')
  const [selectedSample, setSelectedSample] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [viewMode, setViewMode] = useState('single')
  const [gradingMode, setGradingMode] = useState('instant')
  const [randomizeAnswers, setRandomizeAnswers] = useState(false)
  const [showProgressBar, setShowProgressBar] = useState(false)
  const [showResetConfirmation, setShowResetConfirmation] = useState(false)
  const [showReplacementConfirmation, setShowReplacementConfirmation] = useState(false)
  const [showDeleteAttemptConfirmation, setShowDeleteAttemptConfirmation] = useState(false)
  const [showClearHistoryConfirmation, setShowClearHistoryConfirmation] = useState(false)
  const [showDiscardPartialConfirmation, setShowDiscardPartialConfirmation] = useState(false)
  const [attemptToDelete, setAttemptToDelete] = useState(null)
  const [copiedPrompt, setCopiedPrompt] = useState('')
  const [showGuide, setShowGuide] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [savedPartial, setSavedPartial] = useState(() => loadPartialQuiz())
  const [attempts, setAttempts] = useState(() => loadAttempts())
  const [showResumePrompt, setShowResumePrompt] = useState(() => Boolean(loadPartialQuiz()))
  const [pendingQuiz, setPendingQuiz] = useState(null)
  const [hasRecordedCurrentAttempt, setHasRecordedCurrentAttempt] = useState(false)
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
    restoreQuiz,
    resetToHome,
    confirmRetryQuiz,
    selectAnswer,
    deselectAnswer,
    submitQuiz: submitQuizSession,
    confirmSubmitQuiz: confirmSubmitQuizSession,
    showSummaryPage,
    getScore,
    missedQuestions,
  } = quizSession

  useEffect(() => {
    if (!quizStarted || isSubmitted || questions.length === 0 || !quizContent) return
    const nextPartial = {
      version: 1,
      quizId: createQuizId(quizContent),
      fileName,
      content: quizContent,
      questions,
      answers,
      currentQuestion,
      viewMode,
      gradingMode,
      randomizeAnswers,
      showProgressBar,
      updatedAt: new Date().toISOString(),
    }
    savePartialQuiz(nextPartial)
  }, [answers, currentQuestion, fileName, gradingMode, isSubmitted, questions, quizContent, quizStarted, randomizeAnswers, showProgressBar, viewMode])

  useEffect(() => {
    if (!isConfigOpen || quizStarted) return
    window.requestAnimationFrame(() => {
      document.getElementById('quiz-setup')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [isConfigOpen, quizStarted])

  useEffect(() => {
    updateFavicon(theme, isDarkMode)
  }, [isDarkMode, theme])

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 24)
    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollState)
  }, [])

  const commitQuiz = (content, name, parsedQuestions = parseMarkdown(content)) => {
    setQuizContent(content)
    setQuestions(parsedQuestions)
    setFileName(name)
    setError('')
    resetForQuizLoad()
    setCopiedPrompt('')
    setIsConfigOpen(true)
    setHasRecordedCurrentAttempt(false)
    removePartialQuiz()
    setSavedPartial(null)
  }

  const requestQuizLoad = (content, name) => {
    const parsedQuestions = parseMarkdown(content)
    if (parsedQuestions.length === 0) {
      setQuestions([])
      setFileName('')
      setError('No questions found. Choose a Markdown quiz with ### questions.')
      return
    }

    if (savedPartial) {
      setPendingQuiz({ content, name, parsedQuestions })
      setShowReplacementConfirmation(true)
      return
    }

    commitQuiz(content, name, parsedQuestions)
  }

  const handleFile = async (file) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.md')) {
      setError('Please upload a .md Markdown file.')
      return
    }

    requestQuizLoad(await file.text(), file.name)
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
    setHasRecordedCurrentAttempt(false)
  }

  const retryQuiz = () => {
    if (randomizeAnswers) {
      setQuestions((currentQuestions) => shuffleAnswers(currentQuestions, Date.now()))
    }
    confirmRetryQuiz()
    setHasRecordedCurrentAttempt(false)
  }

  const returnHome = () => {
    setQuestions([])
    setQuizContent('')
    setFileName('')
    setSelectedSample('')
    setError('')
    setShowResetConfirmation(false)
    setSavedPartial(loadPartialQuiz())
    resetToHome()
    setIsConfigOpen(false)
  }

  const handleHomeClick = () => {
    if (quizStarted) {
      setShowResetConfirmation(true)
      return
    }
    setShowGuide(false)
    setShowHistory(false)
  }

  const recordAttempt = () => {
    if (hasRecordedCurrentAttempt) return
    const attempt = {
      id: `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      quizId: createQuizId(quizContent),
      fileName,
      score: getScore(),
      totalQuestions: questions.length,
      answeredCount: Object.keys(answers).length,
      completedAt: new Date().toISOString(),
    }
    const nextAttempts = [attempt, ...attempts].slice(0, 20)
    if (saveAttempts(nextAttempts)) setAttempts(nextAttempts)
    removePartialQuiz()
    setSavedPartial(null)
    setHasRecordedCurrentAttempt(true)
  }

  const submitQuiz = () => {
    const unanswered = questions.length - Object.keys(answers).length
    if (unanswered === 0) recordAttempt()
    submitQuizSession()
  }

  const confirmSubmitQuiz = () => {
    recordAttempt()
    confirmSubmitQuizSession()
  }

  const deleteHistoryAttempt = () => {
    if (!attemptToDelete) return
    setAttempts(removeAttempt(attemptToDelete.id))
    setAttemptToDelete(null)
    setShowDeleteAttemptConfirmation(false)
  }

  const clearHistory = () => {
    setAttempts(clearAttempts())
    setShowClearHistoryConfirmation(false)
  }

  const discardSavedQuiz = () => {
    removePartialQuiz()
    setSavedPartial(null)
    setShowResumePrompt(false)
    setShowDiscardPartialConfirmation(false)
  }

  const resumeQuiz = () => {
    if (!savedPartial) return
    setQuizContent(savedPartial.content)
    setQuestions(savedPartial.questions)
    setFileName(savedPartial.fileName)
    setViewMode(savedPartial.viewMode || 'single')
    setGradingMode(savedPartial.gradingMode || 'instant')
    setRandomizeAnswers(Boolean(savedPartial.randomizeAnswers))
    setShowProgressBar(Boolean(savedPartial.showProgressBar))
    restoreQuiz(savedPartial)
    setShowResumePrompt(false)
    setIsConfigOpen(false)
  }

  const confirmReplacement = () => {
    if (!pendingQuiz) return
    const { content, name, parsedQuestions } = pendingQuiz
    setPendingQuiz(null)
    setShowReplacementConfirmation(false)
    commitQuiz(content, name, parsedQuestions)
  }

  const reviewQuiz = () => {
    setShowSummary(false)
    setReviewAll(true)
    setCurrentQuestion(0)
    window.scrollTo(0, 0)
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
  const canChangeRandomizeAnswers = !quizStarted || isSubmitted
  const canChangeProgressBar = true

  return (
    <main className={`theme-${theme} app-font-${font} flex min-h-screen flex-col overflow-hidden bg-[#f6f7f2] text-[#1d2925] ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8 sm:px-10 lg:px-16">
        <AppHeader
          showGuide={showGuide}
          showHistory={showHistory}
          quizStarted={quizStarted}
          onHomeClick={handleHomeClick}
          onGuideToggle={() => {
            setShowHistory(false)
            setShowGuide((isVisible) => !isVisible)
          }}
          onWorkspaceBack={() => {
            setShowGuide(false)
            setShowHistory(false)
          }}
          onHistoryToggle={() => {
            setShowGuide(false)
            setShowHistory(true)
          }}
          onSettingsOpen={() => setIsSettingsOpen(true)}
        />

        {showGuide ? (
          <GuideView
            generationPrompt={quizGenerationPrompt}
            copiedPrompt={copiedPrompt}
            onCopyPrompt={copyPrompt}
            onDownloadTemplate={downloadTemplate}
          />
        ) : showHistory ? (
          <HistoryView
            attempts={attempts}
            onDeleteAttempt={(attempt) => { setAttemptToDelete(attempt); setShowDeleteAttemptConfirmation(true) }}
            onClearHistory={() => setShowClearHistoryConfirmation(true)}
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
            onReviewQuiz={reviewQuiz}
            onRetry={() => setShowRetryConfirmation(true)}
          />
        ) : (
          <Suspense fallback={<section className="flex flex-1 items-center justify-center py-16 text-sm font-semibold text-[#738077]">Loading quiz...</section>}>
            <QuizView
              fileName={fileName}
              questions={questions}
              answers={answers}
              currentQuestion={currentQuestion}
              viewMode={viewMode}
              gradingMode={gradingMode}
              showProgressBar={showProgressBar}
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
          </Suspense>
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
            savedPartial={savedPartial}
            latestAttempt={attempts[0]}
            onResume={resumeQuiz}
            onDiscardSavedQuiz={() => setShowDiscardPartialConfirmation(true)}
            onSampleSelect={(fileNameValue) => {
              const sample = sampleQuizzes.find(({ fileName: name }) => name === fileNameValue)
              setSelectedSample(fileNameValue)
                if (sample) requestQuizLoad(sample.content, sample.fileName)
            }}
          />
        )}

        {!showGuide && !quizStarted && isConfigOpen && (
          <QuizSetupView
            questionsCount={questions.length}
            viewMode={viewMode}
            gradingMode={gradingMode}
            randomizeAnswers={randomizeAnswers}
            showProgressBar={showProgressBar}
            onViewModeChange={setViewMode}
            onGradingModeChange={setGradingMode}
            onRandomizeAnswersChange={setRandomizeAnswers}
            onProgressBarChange={setShowProgressBar}
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

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-5 right-5 z-10 flex size-10 items-center justify-center rounded-full border border-[#cbd6c9] bg-white/90 text-xl text-[#49623f] shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-[#91ad37] hover:text-[#788c3d] focus:outline-none focus:ring-4 focus:ring-[#e9f3c5] sm:bottom-7 sm:right-7 ${isScrolled ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}
        aria-label="Bring page to top"
        title="Bring page to top"
        tabIndex={isScrolled ? 0 : -1}
      >
        ↑
      </button>

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
          eyebrow={isSubmitted ? 'Leave results?' : 'Leave quiz?'}
          title={isSubmitted ? 'Return to the home page?' : 'Return to the home page?'}
          description={isSubmitted
            ? 'Your results are already saved in study history. Returning home will close this result view; start Retry Quiz if you want to take the quiz again.'
            : 'Your current quiz will be saved so you can resume it later. Completed study history will stay available, and you can discard saved progress separately.'}
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
          description="This will start a fresh attempt from question one. Your current answers and score will be reset, but your completed study history will be kept."
          confirmLabel="Retry Quiz"
          titleId="retry-confirmation-title"
          onCancel={() => setShowRetryConfirmation(false)}
          onConfirm={retryQuiz}
        />
      )}

      {showReplacementConfirmation && (
        <ConfirmationDialog
          eyebrow="Saved progress found"
          title="Replace your unfinished quiz?"
          description={`Starting ${pendingQuiz?.name || 'a new quiz'} will erase your saved progress for ${savedPartial?.fileName || 'the current quiz'}.`}
          confirmLabel="Replace Quiz"
          titleId="replacement-confirmation-title"
          onCancel={() => { setPendingQuiz(null); setShowReplacementConfirmation(false) }}
          onConfirm={confirmReplacement}
        />
      )}

      {showDeleteAttemptConfirmation && (
        <ConfirmationDialog
          eyebrow="Delete attempt?"
          title="Remove this history entry?"
          description={`The ${attemptToDelete?.fileName || 'quiz'} result will be removed from recent history.`}
          confirmLabel="Delete Attempt"
          titleId="delete-attempt-confirmation-title"
          onCancel={() => { setAttemptToDelete(null); setShowDeleteAttemptConfirmation(false) }}
          onConfirm={deleteHistoryAttempt}
        />
      )}

      {showClearHistoryConfirmation && (
        <ConfirmationDialog
          eyebrow="Clear history?"
          title="Remove all completed attempts?"
          description="Your saved unfinished quiz will stay available. Only completed quiz history will be removed."
          confirmLabel="Clear History"
          titleId="clear-history-confirmation-title"
          onCancel={() => setShowClearHistoryConfirmation(false)}
          onConfirm={clearHistory}
        />
      )}

      {showDiscardPartialConfirmation && (
        <ConfirmationDialog
          eyebrow="Discard saved quiz?"
          title="Erase unfinished progress?"
          description={`Your saved progress for ${savedPartial?.fileName || 'this quiz'} will be deleted. Completed history will stay intact.`}
          confirmLabel="Discard Saved Quiz"
          titleId="discard-partial-confirmation-title"
          onCancel={() => setShowDiscardPartialConfirmation(false)}
          onConfirm={discardSavedQuiz}
        />
      )}

      {showResumePrompt && savedPartial && !quizStarted && (
        <ConfirmationDialog
          eyebrow="Welcome back"
          title={`Resume ${savedPartial.fileName}?`}
          description={`${Object.keys(savedPartial.answers || {}).length} of ${savedPartial.questions.length} questions answered. Your saved position and study settings are ready.`}
          confirmLabel="Resume Quiz"
          titleId="resume-confirmation-title"
          onCancel={() => setShowResumePrompt(false)}
          onConfirm={resumeQuiz}
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
        randomizeAnswers={randomizeAnswers}
        canChangeRandomizeAnswers={canChangeRandomizeAnswers}
        showProgressBar={showProgressBar}
        canChangeProgressBar={canChangeProgressBar}
        onClose={() => setIsSettingsOpen(false)}
        onViewModeChange={setViewMode}
        onGradingModeChange={setGradingMode}
        onRandomizeAnswersChange={setRandomizeAnswers}
        onProgressBarChange={setShowProgressBar}
        onThemeChange={setTheme}
        onFontChange={setFont}
        onDarkModeToggle={() => setIsDarkMode((isEnabled) => !isEnabled)}
      />
    </main>
  )
}

export default App
