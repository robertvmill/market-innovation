'use client'

import { useState, useEffect } from 'react'

interface SessionNotificationProps {
  show: boolean
  onClose: () => void
  message: string
  type?: 'success' | 'info'
}

export default function SessionNotification({ 
  show, 
  onClose, 
  message, 
  type = 'success' 
}: SessionNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, 8000) // Auto-close after 8 seconds

      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-blue-50'
  const borderColor = type === 'success' ? 'border-green-200' : 'border-blue-200'
  const textColor = type === 'success' ? 'text-green-800' : 'text-blue-800'
  const iconColor = type === 'success' ? 'text-green-400' : 'text-blue-400'

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${bgColor} ${borderColor} border rounded-lg shadow-lg p-4`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {type === 'success' ? (
            <svg className={`h-5 w-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className={`h-5 w-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${textColor}`}>
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onClose}
            className={`inline-flex ${textColor} hover:opacity-75 focus:outline-none`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
} 