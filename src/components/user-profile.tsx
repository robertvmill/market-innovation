'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function UserProfile() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        <span>Loading...</span>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/login"
          className="text-gray-600 hover:text-gray-900 font-medium"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium text-sm"
        >
          Sign Up
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        {session?.user?.image && (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="h-8 w-8 rounded-full"
          />
        )}
        <span className="text-gray-700">
          Welcome, {session?.user?.name || session?.user?.email}!
        </span>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-red-600 hover:text-red-500 font-medium"
      >
        Sign Out
      </button>
    </div>
  )
} 