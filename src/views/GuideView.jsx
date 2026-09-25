function GuideView({ generationPrompt, copiedPrompt, onCopyPrompt, onDownloadTemplate }) {
  return (
    <section className="flex-1 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#788c3d]">Build a quiz in seconds</p>
        <h1 className="max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.04em] text-[#1d2925] sm:text-6xl">How to use AI to generate quizzes.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#617067]">Ask ChatGPT or Claude for a quiz in the format MCQ Crammer understands, then upload the Markdown file here. You can also paste notes, slides, or textbook excerpts into the prompt so the questions match your study material.</p>

        <div className="mt-10 rounded-3xl border border-[#d9dfd7] bg-white p-6 shadow-[0_12px_30px_rgba(54,75,61,0.06)] sm:p-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#26332d]">Copy this prompt</h2>
              <p className="mt-1 text-sm text-[#738077]">Replace the question, answer, and topic placeholders before sending. Paste notes, slides, or textbook excerpts into the source-material section when useful.</p>
            </div>
            <button type="button" onClick={() => onCopyPrompt('guide', generationPrompt)} className="shrink-0 rounded-lg border border-[#cbd6c9] bg-white px-3 py-2 text-xs font-bold text-[#49623f] transition hover:border-[#91ad37]">{copiedPrompt === 'guide' ? 'Copied' : 'Copy'}</button>
          </div>
          <textarea readOnly value={generationPrompt} className="min-h-80 w-full resize-y rounded-2xl border border-[#cbd6c9] bg-[#f8faf5] p-4 font-mono text-sm leading-6 text-[#4d6253] outline-none focus:border-[#91ad37] focus:ring-4 focus:ring-[#e9f3c5]" aria-label="AI quiz generation prompt" />
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-5 rounded-3xl bg-[#263b31] p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-xl font-bold">Start from a template</h2>
            <p className="mt-1 max-w-lg text-sm leading-6 text-[#c5d3c5]">Download a ready-to-edit Markdown file, then fill in your own questions and answers.</p>
          </div>
          <button type="button" onClick={onDownloadTemplate} className="shrink-0 rounded-xl bg-[#d6ed63] px-5 py-3 text-sm font-bold text-[#26331f] transition hover:bg-[#e5f69a]">Download quiz-template.md</button>
        </div>
      </div>
    </section>
  )
}

export default GuideView
