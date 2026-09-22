# MCQ Crammer

MCQ Crammer turns Markdown multiple-choice quizzes into focused study sessions.

## Features

- Upload a Markdown quiz or choose a built-in sample.
- Resume one unfinished quiz across browser sessions.
- Review recent completed quiz attempts.
- Delete individual attempts or clear completed history.
- Discard unfinished saved progress separately from completed history.

## Local persistence

Quiz progress and completed attempt summaries are stored locally in the browser using `localStorage`. The data is specific to this browser and website origin; it is not synchronized between devices or browsers.

MCQ Crammer stores one active quiz snapshot and a bounded list of recent attempt summaries. Clearing browser site data, using a private browsing session, or changing browser profiles can remove the saved data.

## Development

```bash
npm install
npm run dev
```

```bash
npm run lint
npm run build
```
