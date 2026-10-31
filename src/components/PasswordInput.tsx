import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, id, className = '', ...props }, ref) => {
    const [visible, setVisible] = useState(false)
    const inputId = id ?? `password-${label.replace(/\s/g, '-').toLowerCase()}`

    return (
      <div>
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
        <div className="relative">
          <input
            {...props}
            ref={ref}
            id={inputId}
            type={visible ? 'text' : 'password'}
            className={`h-11 w-full rounded-xl border border-slate-300 bg-white px-3 pr-11 text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${className}`}
          />
          <button
            type="button"
            onClick={() => setVisible(value => !value)}
            className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
    )
  }
)
