import { useState } from 'react'
import { parseMarkdown } from './quizParser'
import biologyQuiz from './quiz_examples/quiz_biology_basics.md?raw'
import financeQuiz from './quiz_examples/quiz_finance_tvm.md?raw'
import pythonQuiz from './quiz_examples/quiz_python_basics.md?raw'

const sampleQuizzes = [
  { name: 'Python basics', fileName: 'quiz_python_basics.md', content: pythonQuiz },
  { name: 'Biology basics', fileName: 'quiz_biology_basics.md', content: biologyQuiz },
  { name: 'Finance: time value of money', fileName: 'quiz_finance_tvm.md', content: financeQuiz },
]

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

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f7f2] text-[#1d2925]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between border-b border-[#d9dfd7] pb-6">
          <div className="flex items-center gap-3 font-bold tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#d6ed63] text-lg text-[#26331f]">?</span>
            <span>MCQ Crammer</span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6c7b70]">Quiz workspace</span>
        </header>

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
              <div className="mb-8 flex size-12 items-center justify-center rounded-2xl bg-[#e9f3c5] text-2xl" aria-hidden="true">↑</div>
              <h2 className="text-2xl font-bold tracking-tight text-[#26332d]">Drop your quiz here</h2>
              <p className="mt-2 text-sm leading-6 text-[#738077]">Upload a Markdown file and we&apos;ll parse each question automatically.</p>
              <label className="mt-7 inline-flex cursor-pointer items-center rounded-xl bg-[#263b31] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#17281f] focus-within:ring-4 focus-within:ring-[#d6ed63]">
                Choose .md file
                <input type="file" accept=".md,text/markdown" className="sr-only" onChange={(event) => handleFile(event.target.files[0])} />
              </label>
              <p className="mt-4 text-xs text-[#99a59c]">Maximum flexibility, zero formatting fuss.</p>
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

        {(fileName || error) && (
          <section className="mb-8 rounded-2xl border border-[#d9dfd7] bg-white px-5 py-4 text-sm shadow-sm">
            {error ? <p className="font-semibold text-[#a34d3f]">{error}</p> : <p className="font-semibold text-[#49623f]">{fileName} loaded: {questions.length} questions ready{quizStarted ? ` in ${viewMode === 'single' ? 'one-question' : 'all-at-once'} mode.` : '.'}</p>}
          </section>
        )}
      </div>

      {isConfigOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-[#1d2925]/45 px-5 py-8 backdrop-blur-sm" role="presentation">
          <section className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl sm:p-9" role="dialog" aria-modal="true" aria-labelledby="quiz-settings-title">
            <div className="mb-8 flex items-start justify-between gap-6">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#788c3d]">Quiz ready</p>
                <h2 id="quiz-settings-title" className="text-3xl font-black tracking-tight text-[#26332d]">Set your study mode</h2>
                <p className="mt-2 text-sm leading-6 text-[#738077]">Choose how you want to move through {questions.length} questions.</p>
              </div>
              <button type="button" onClick={() => setIsConfigOpen(false)} className="flex size-9 shrink-0 items-center justify-center rounded-full text-xl text-[#78877d] transition hover:bg-[#f0f3ed] hover:text-[#26332d]" aria-label="Close quiz settings">×</button>
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

            <button type="button" onClick={() => { setQuizStarted(true); setIsConfigOpen(false) }} className="mt-8 w-full rounded-xl bg-[#263b31] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#17281f] focus:outline-none focus:ring-4 focus:ring-[#d6ed63]">Start Quiz</button>
          </section>
        </div>
      )}
    </main>
  )
}

export default App
