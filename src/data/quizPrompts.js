export const quizGenerationPrompt = `Create a multiple-choice quiz in Markdown using exactly this format:

### [Question]
- [ ] [Incorrect answer]
- [x] [Correct answer]
- [ ] [Incorrect answer]
- [ ] [Incorrect answer]
> Explanation: [A concise explanation of why the correct answer is right]

Requirements:
- Create [INSERT NUMBER OF QUESTIONS] questions about [INSERT TOPIC].
- Give each question exactly [INSERT NUMBER OF ANSWERS (CHOOSE 4-6)] answer options.
- Mark exactly one correct option with [x] and all others with [ ].
- Put the correct answer in a different position each time.
- Vary answer length and sentence structure so the correct answer is not obviously the longest.
- Make incorrect answers plausible by using common mistakes or misconceptions, without using trick questions or "gotchas".
- Keep explanations clear and educational.
- Use the optional source material below when provided. It may include notes, slides, or textbook excerpts; prioritize it while correcting obvious errors only when necessary.
- Return only the Markdown quiz, with no introduction or closing text.

Optional source material:
[PASTE NOTES, SLIDES, OR TEXTBOOK EXCERPTS HERE]`

export const quizTemplate = `# My Quiz

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
