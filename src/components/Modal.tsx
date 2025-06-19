import React from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'medium' | 'large'
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-full max-h-[90vh] overflow-y-auto ${size === 'large' ? 'md:max-w-2xl' : 'md:max-w-md'} relative`}>
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-bold z-10"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="p-4 md:p-6">
          {title && <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white pr-8">{title}</h2>}
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal 