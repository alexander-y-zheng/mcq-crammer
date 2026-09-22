const PARTIAL_KEY = 'mcq-crammer-partial-quiz'
const ATTEMPTS_KEY = 'mcq-crammer-quiz-attempts'
const STORAGE_VERSION = 1
const MAX_ATTEMPTS = 20

const getStorage = () => {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

const readJson = (key, fallback) => {
  const storage = getStorage()
  if (!storage) return fallback

  try {
    const value = storage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const writeJson = (key, value) => {
  const storage = getStorage()
  if (!storage) return false

  try {
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

const removeValue = (key) => {
  const storage = getStorage()
  if (!storage) return

  try {
    storage.removeItem(key)
  } catch {
    // Storage may be unavailable or disabled.
  }
}

export const createQuizId = (content) => {
  let hash = 2166136261
  for (let index = 0; index < content.length; index += 1) {
    hash ^= content.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `quiz-${(hash >>> 0).toString(16)}`
}

export const createQuestionId = (question) => {
  const questionText = `${question.question}\n${question.options.map((option) => option.text).join('\n')}`
  return createQuizId(questionText)
}

const isValidPartial = (value) => value
  && value.version === STORAGE_VERSION
  && typeof value.quizId === 'string'
  && typeof value.fileName === 'string'
  && typeof value.content === 'string'
  && Array.isArray(value.questions)
  && value.questions.length > 0
  && value.answers
  && typeof value.answers === 'object'

const isValidAttempt = (value) => value
  && typeof value.id === 'string'
  && typeof value.quizId === 'string'
  && typeof value.fileName === 'string'
  && Number.isFinite(value.score)
  && Number.isFinite(value.totalQuestions)
  && typeof value.completedAt === 'string'

export const loadPartialQuiz = () => {
  const value = readJson(PARTIAL_KEY, null)
  if (!isValidPartial(value)) {
    if (value !== null) removeValue(PARTIAL_KEY)
    return null
  }
  return value
}

export const savePartialQuiz = (partialQuiz) => writeJson(PARTIAL_KEY, {
  ...partialQuiz,
  version: STORAGE_VERSION,
})

export const removePartialQuiz = () => removeValue(PARTIAL_KEY)

export const loadAttempts = () => {
  const value = readJson(ATTEMPTS_KEY, [])
  if (!Array.isArray(value)) {
    removeValue(ATTEMPTS_KEY)
    return []
  }
  return value.filter(isValidAttempt).slice(0, MAX_ATTEMPTS)
}

export const saveAttempts = (attempts) => writeJson(ATTEMPTS_KEY, attempts.slice(0, MAX_ATTEMPTS))

export const removeAttempt = (attemptId) => {
  const attempts = loadAttempts().filter((attempt) => attempt.id !== attemptId)
  saveAttempts(attempts)
  return attempts
}

export const clearAttempts = () => {
  removeValue(ATTEMPTS_KEY)
  return []
}

export const getStorageKeys = () => ({ partial: PARTIAL_KEY, attempts: ATTEMPTS_KEY })
