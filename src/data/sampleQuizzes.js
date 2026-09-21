import astrologyQuiz from '../quiz_examples/quiz_astrology.md?raw'
import astronomyQuiz from '../quiz_examples/quiz_astronomy.md?raw'
import biologyQuiz from '../quiz_examples/quiz_biology_basics.md?raw'
import chemistryQuiz from '../quiz_examples/quiz_chemistry.md?raw'
import financeQuiz from '../quiz_examples/quiz_finance_tvm.md?raw'
import pythonQuiz from '../quiz_examples/quiz_python_basics.md?raw'
import worldHistoryQuiz from '../quiz_examples/quiz_world_history.md?raw'

const sampleQuizzes = [
  { name: 'Astrology', fileName: 'quiz_astrology.md', content: astrologyQuiz },
  { name: 'Astronomy', fileName: 'quiz_astronomy.md', content: astronomyQuiz },
  { name: 'Python basics', fileName: 'quiz_python_basics.md', content: pythonQuiz },
  { name: 'Biology basics', fileName: 'quiz_biology_basics.md', content: biologyQuiz },
  { name: 'Chemistry', fileName: 'quiz_chemistry.md', content: chemistryQuiz },
  { name: 'Finance: time value of money', fileName: 'quiz_finance_tvm.md', content: financeQuiz },
  { name: 'World history', fileName: 'quiz_world_history.md', content: worldHistoryQuiz },
]

export default sampleQuizzes
