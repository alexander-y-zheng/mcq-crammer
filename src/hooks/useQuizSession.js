import { useState } from 'react'

function useQuizSession({ questions, viewMode, gradingMode }) {
  const [quizStarted, setQuizStarted] = useState(false)
  const [answers, setAnswers] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [unansweredCount, setUnansweredCount] = useState(0)
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false)
  const [showRetryConfirmation, setShowRetryConfirmation] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [summaryAnimationKey, setSummaryAnimationKey] = useState(0)
  const [showMissedQuestions, setShowMissedQuestions] = useState(true)
  const [showSubmitHint, setShowSubmitHint] = useState(false)
  const [reviewAll, setReviewAll] = useState(false)

  const resetForQuizLoad = () => {
    setQuizStarted(false)
    setAnswers({})
    setIsSubmitted(false)
    setUnansweredCount(0)
    setShowSubmitConfirmation(false)
    setShowRetryConfirmation(false)
    setShowSummary(false)
    setReviewAll(false)
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
  }

  const resetToHome = () => {
    setQuizStarted(false)
    setAnswers({})
    setCurrentQuestion(0)
    setIsSubmitted(false)
    setUnansweredCount(0)
    setShowSubmitConfirmation(false)
    setShowRetryConfirmation(false)
    setShowSummary(false)
    setReviewAll(false)
    window.scrollTo(0, 0)
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

  const showSummaryPage = () => {
    setSummaryAnimationKey((key) => key + 1)
    setShowMissedQuestions(true)
    setShowSummary(true)
    window.scrollTo(0, 0)
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

  const confirmRetryQuiz = () => {
    setShowRetryConfirmation(false)
    startQuiz()
  }

  const getScore = () => questions.reduce((score, question, index) => {
    const selectedOption = question.options[answers[index]]
    return score + (selectedOption?.isCorrect ? 1 : 0)
  }, 0)

  const missedQuestions = questions.filter((question, index) => !question.options[answers[index]]?.isCorrect)

  return {
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
    startQuiz,
    resetToHome,
    confirmRetryQuiz,
    selectAnswer,
    deselectAnswer,
    submitQuiz,
    confirmSubmitQuiz,
    showSummaryPage,
    getScore,
    missedQuestions,
  }
}

export default useQuizSession
