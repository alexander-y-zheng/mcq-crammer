export function parseMarkdown(text) {
	if (typeof text !== 'string') {
		return []
	}

	const questions = []
	let currentQuestion = null

	const addCurrentQuestion = () => {
		if (currentQuestion) {
			questions.push(currentQuestion)
		}
	}

	for (const line of text.split(/\r?\n/)) {
		const headingMatch = line.match(/^###(?!#)\s+(.+?)\s*$/)

		if (headingMatch) {
			addCurrentQuestion()
			currentQuestion = {
				question: headingMatch[1].trim(),
				options: [],
				explanation: '',
			}
			continue
		}

		if (!currentQuestion) {
			continue
		}

		const optionMatch = line.match(/^\s*-\s*\[([ xX])\]\s+(.+?)\s*$/)
		if (optionMatch) {
			currentQuestion.options.push({
				text: optionMatch[2].trim(),
				isCorrect: optionMatch[1].toLowerCase() === 'x',
			})
			continue
		}

		const explanationMatch = line.match(/^\s*>\s*Explanation:\s*(.*?)\s*$/i)
		if (explanationMatch) {
			currentQuestion.explanation = explanationMatch[1].trim()
		}
	}

	addCurrentQuestion()
	return questions
}
