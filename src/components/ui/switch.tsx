import * as React from "react"
import { cn } from "../../lib/utils"

export interface SwitchProps {
  checked?: boolean
  onChange?: () => void
  className?: string
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onChange, ...props }, ref) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
        ref={ref}
        {...props}
      />
      <div className={cn(
        "relative w-11 h-6 rounded-full transition-colors duration-200",
        checked 
          ? "bg-indigo-600 dark:bg-indigo-500" 
          : "bg-slate-200 dark:bg-slate-700",
        "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 peer-focus:ring-offset-2",
        className
      )}>
        <div className={cn(
          "absolute top-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-200",
          checked ? "left-[22px]" : "left-[2px]"
        )} />
      </div>
    </label>
  )
)
Switch.displayName = "Switch"

export { Switch }