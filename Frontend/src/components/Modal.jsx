import React from 'react'
import { X } from 'lucide-react'

const Modal = ({ isOpen, onClose, title, children, className = "" }) => {
  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-xl shadow-xl max-w-md w-full ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-primary-400 hover:text-primary-600 transition-colors"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
