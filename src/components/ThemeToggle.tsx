import { useTheme } from '../hooks/useTheme'
import { Switch } from './ui/switch'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="flex items-center space-x-3 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
      <Sun className="h-4 w-4 text-yellow-500" />
      <Switch
        checked={isDark}
        onChange={toggleTheme}
        className="data-[state=checked]:bg-slate-900 data-[state=unchecked]:bg-slate-200"
      />
      <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
    </div>
  )
}