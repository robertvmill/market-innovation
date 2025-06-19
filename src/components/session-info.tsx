'use client'

import { useSession } from 'next-auth/react'

export default function SessionInfo() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-green-800">
            <span className="font-medium">Logged in as {session.user?.email}</span>
          </p>
        </div>
      </div>
    </div>
  )
} 