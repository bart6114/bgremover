import { useState, useEffect } from 'react'

export function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') return false
    
    const stored = localStorage.getItem('theme')
    if (stored) {
      return stored === 'dark'
    }
    // Default to system preference if no stored value
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.toggle('dark', isDark)
  }, [isDark])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  return { isDark, toggleTheme }
}