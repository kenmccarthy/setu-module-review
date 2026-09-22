import { Link } from 'react-router-dom'
import type { HelpAnchor } from '../../content/help'

export function Section({
  number,
  title,
  intro,
  children,
  id,
}: {
  number?: string | number
  title: string
  intro?: React.ReactNode
  children: React.ReactNode
  id?: string
}) {
  return (
    <section
      id={id}
      className="avoid-break space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">
          {number !== undefined && <span className="mr-2 text-brand-600">{number}.</span>}
          {title}
        </h2>
        {intro && <div className="text-sm text-slate-600">{intro}</div>}
      </header>
      {children}
    </section>
  )
}

export function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{children}</h3>
  )
}

export function PageTitle({
  part,
  title,
  lede,
  helpAnchor,
}: {
  part?: string
  title: string
  lede?: React.ReactNode
  /** Section in the Help & Guide to link to, e.g. "priority-rule". */
  helpAnchor?: HelpAnchor
}) {
  return (
    <div className="space-y-1">
      {part && (
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{part}</p>
      )}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {helpAnchor && (
          <Link
            className="no-print text-sm font-medium text-brand-700 hover:underline"
            to={`/help#${helpAnchor}`}
          >
            Guide for this section
          </Link>
        )}
      </div>
      {lede && <p className="max-w-3xl text-sm text-slate-600">{lede}</p>}
    </div>
  )
}

export function Button({
  children,
  onClick,
  variant = 'secondary',
  type = 'button',
  className = '',
  disabled,
  title,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  type?: 'button' | 'submit'
  className?: string
  disabled?: boolean
  title?: string
}) {
  const styles = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 border-brand-700',
    secondary: 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300',
    danger: 'bg-white text-rose-700 hover:bg-rose-50 border-rose-300',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 border-transparent',
  }[variant]
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  )
}
