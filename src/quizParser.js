export function parseMarkdown(text) {
	if (typeof text !== 'string') {
		return []
	}

	const questions = []
	let currentQuestion = null

	const addCurrentQuestion = () => {
		if (currentQuestion) {
			if (currentQuestion.questionDetails.length > 0) {
				currentQuestion.question = [currentQuestion.question, ...currentQuestion.questionDetails].join('\n').trim()
			}
			delete currentQuestion.questionDetails
			questions.push(currentQuestion)
		}
	}

	for (const line of text.split(/\r?\n/)) {
		const headingMatch = line.match(/^###(?!#)\s+(.+?)\s*$/)

		if (headingMatch) {
			addCurrentQuestion()
			currentQuestion = {
				question: headingMatch[1].trim(),
				questionDetails: [],
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
			if (currentQuestion.questionDetails.length > 0) {
				currentQuestion.question = [currentQuestion.question, ...currentQuestion.questionDetails].join('\n').trim()
				currentQuestion.questionDetails = []
			}
			currentQuestion.options.push({
				text: optionMatch[2].trim(),
				isCorrect: optionMatch[1].toLowerCase() === 'x',
			})
			continue
		}

		const explanationMatch = line.match(/^\s*>\s*Explanation:\s*(.*?)\s*$/i)
		if (explanationMatch) {
			currentQuestion.explanation = explanationMatch[1].trim()
			continue
		}

		if (currentQuestion.options.length === 0 && line.trim()) {
			currentQuestion.questionDetails.push(line)
		}
	}

	addCurrentQuestion()
	return questions
}
