import sampleQuizzes from '../data/sampleQuizzes'

function HomeView({
  fileName,
  questions,
  selectedSample,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onSampleSelect,
}) {
  return (
    <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
      <div>
        <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-[#788c3d]">Study smarter</p>
        <h1 className="max-w-xl text-5xl font-black leading-[0.98] tracking-[-0.04em] text-[#1d2925] sm:text-7xl">Turn notes into momentum.</h1>
        <p className="mt-7 max-w-md text-lg leading-8 text-[#617067]">Bring a Markdown quiz or start with a sample. We&apos;ll turn it into focused multiple-choice practice.</p>
      </div>

      <div className="space-y-5">
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
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
                <input type="file" accept=".md,text/markdown" className="sr-only" onChange={(event) => onFileSelect(event.target.files[0])} />
              </label>
            </>
          ) : (
            <>
              <div className="mb-8 flex size-12 items-center justify-center rounded-2xl bg-[#e9f3c5] text-2xl" aria-hidden="true">↑</div>
              <h2 className="text-2xl font-bold tracking-tight text-[#26332d]">Drop your quiz here</h2>
              <p className="mt-2 text-sm leading-6 text-[#738077]">Upload a Markdown file and we&apos;ll parse each question automatically.</p>
              <label className="mt-7 inline-flex cursor-pointer items-center rounded-xl bg-[#263b31] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#17281f] focus-within:ring-4 focus-within:ring-[#d6ed63]">
                Choose .md file
                <input type="file" accept=".md,text/markdown" className="sr-only" onChange={(event) => onFileSelect(event.target.files[0])} />
              </label>
              <p className="mt-4 text-xs text-[#99a59c]">Maximum flexibility, zero formatting fuss.</p>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.16em] text-[#97a39a]"><span className="h-px flex-1 bg-[#d9dfd7]" />or use a sample<span className="h-px flex-1 bg-[#d9dfd7]" /></div>
        <select
          value={selectedSample}
          onChange={(event) => onSampleSelect(event.target.value)}
          className="w-full appearance-none rounded-xl border border-[#cbd6c9] bg-white px-4 py-3.5 text-sm font-semibold text-[#33443a] outline-none transition focus:border-[#91ad37] focus:ring-4 focus:ring-[#e9f3c5]"
        >
          <option value="">Select a sample quiz...</option>
          {sampleQuizzes.map(({ fileName: name, name: label }) => <option key={name} value={name}>{label}</option>)}
        </select>
      </div>
    </section>
  )
}

export default HomeView
