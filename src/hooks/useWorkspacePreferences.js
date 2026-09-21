import { useEffect, useState } from 'react'

function useWorkspacePreferences() {
  const [isDarkMode, setIsDarkMode] = useState(() => window.localStorage.getItem('mcq-crammer-theme') === 'dark')
  const [theme, setTheme] = useState(() => window.localStorage.getItem('mcq-crammer-color-theme') || 'green')
  const [font, setFont] = useState(() => window.localStorage.getItem('mcq-crammer-font') || 'default')

  useEffect(() => {
    window.localStorage.setItem('mcq-crammer-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  useEffect(() => {
    window.localStorage.setItem('mcq-crammer-color-theme', theme)
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem('mcq-crammer-font', font)
  }, [font])

  return {
    isDarkMode,
    theme,
    font,
    setIsDarkMode,
    setTheme,
    setFont,
  }
}

export default useWorkspacePreferences
