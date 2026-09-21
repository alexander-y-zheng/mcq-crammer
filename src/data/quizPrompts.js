export const quizGenerationPrompt = `Create a multiple-choice quiz in Markdown using exactly this format:

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
