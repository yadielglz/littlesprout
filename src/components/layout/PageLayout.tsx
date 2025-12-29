import { ReactNode } from 'react'
import Card from '../common/Card'

interface PageLayoutProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  maxWidthClassName?: string
}

const PageLayout = ({
  title,
  subtitle,
  actions,
  children,
  maxWidthClassName = 'max-w-6xl'
}: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className={`${maxWidthClassName} mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  )
}

export default PageLayout

