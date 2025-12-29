import { ReactNode } from 'react'
import Card from './common/Card'

interface ValueDisplayCardProps {
  label: string
  value: string
  icon: string | ReactNode
  tone?: 'blue' | 'green' | 'red' | 'slate'
  onClick?: () => void
}

const toneClasses = {
  blue: 'bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100 border-blue-200 dark:border-blue-700',
  green: 'bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100 border-green-200 dark:border-green-700',
  red: 'bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-100 border-red-200 dark:border-red-700',
  slate: 'bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700'
}

const ValueDisplayCard = ({ label, value, icon, tone = 'slate', onClick }: ValueDisplayCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-xl"
    >
      <Card
        className={`flex flex-col items-center justify-center text-center min-h-[140px] ${toneClasses[tone]}`}
        padding="md"
        shadow="sm"
      >
        <div className="mb-2 flex items-center justify-center">
          {typeof icon === 'string' ? <span className="text-4xl">{icon}</span> : icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm font-semibold opacity-80">{label}</div>
      </Card>
    </button>
  )
}

export default ValueDisplayCard