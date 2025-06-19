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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${size === 'large' ? 'max-w-2xl' : 'max-w-md'} w-full p-6 relative`}>
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {title && <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">{title}</h2>}
        {children}
      </div>
    </div>
  )
}

export default Modal 