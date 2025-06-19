'use client'

import Image from "next/image";
import Link from "next/link";
import { useSession } from 'next-auth/react'
import UserProfile from "@/components/user-profile";

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
      {/* Header with Auth */}
      <header className="w-full flex justify-between items-center p-6 lg:px-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">MarketScope</h1>
        </div>
        <UserProfile />
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center py-24 lg:py-32">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              AI-Powered
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Market Research</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Get comprehensive market analysis, competitor insights, and strategic recommendations for your business. 
              Make data-driven decisions with AI-powered research and analytics.
            </p>
            
            {/* CTA Buttons - Conditional based on auth status */}
            <div className="mt-10 flex items-center justify-center gap-4 flex-col sm:flex-row">
              {session ? (
                // Authenticated user CTAs
                <>
                  <Link
                    href="/dashboard"
                    className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 sm:text-base"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    href="/companies"
                    className="rounded-full border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 sm:text-base"
                  >
                    View Companies
                  </Link>
                </>
              ) : (
                // Non-authenticated user CTAs
                <>
                  <Link
                    href="/signup"
                    className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 sm:text-base"
                  >
                    Start Free Analysis
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-full border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 sm:text-base"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-24 lg:py-32">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Complete Market Intelligence Suite
            </h2>
            <p className="mt-4 text-center text-lg text-gray-600">
              Everything you need to understand your market, competitors, and opportunities in one powerful platform.
            </p>
            
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Real-Time Market Data</h3>
                <p className="mt-2 text-gray-600">Access live market trends, industry insights, and financial data to stay ahead of the competition.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Competitor Analysis</h3>
                <p className="mt-2 text-gray-600">Identify key competitors, analyze their strategies, and discover market gaps and opportunities.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">AI-Driven Insights</h3>
                <p className="mt-2 text-gray-600">Get actionable recommendations and strategic insights powered by advanced AI and machine learning.</p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Growth Opportunities</h3>
                <p className="mt-2 text-gray-600">Identify untapped markets, emerging trends, and expansion opportunities for sustainable growth.</p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
                <p className="mt-2 text-gray-600">Evaluate market risks, regulatory changes, and potential threats to your business strategy.</p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-green-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Comprehensive Reports</h3>
                <p className="mt-2 text-gray-600">Generate detailed market research reports with executive summaries and actionable recommendations.</p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-24 lg:py-32 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl">
          <div className="mx-auto max-w-4xl text-center px-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 mb-12">
              Get comprehensive market insights in three simple steps
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Your Company</h3>
                <p className="text-gray-600">Enter your company details and let our AI start gathering market intelligence.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
                <p className="text-gray-600">Our AI analyzes market data, competitors, and industry trends in real-time.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Insights</h3>
                <p className="text-gray-600">Receive actionable insights, strategic recommendations, and growth opportunities.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 shadow-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to unlock your market potential?
              </h2>
              <p className="mt-4 text-lg text-blue-100">
                Join forward-thinking businesses who are making smarter decisions with AI-powered market research.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4 flex-col sm:flex-row">
                {session ? (
                  // Authenticated user CTAs
                  <>
                    <Link
                      href="/dashboard"
                      className="rounded-full bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-lg hover:shadow-xl hover:bg-gray-50 transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Go to Dashboard
                    </Link>
                    <Link
                      href="/companies"
                      className="rounded-full border-2 border-white px-8 py-4 text-base font-semibold text-white hover:bg-white hover:text-blue-600 transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Manage Companies
                    </Link>
                  </>
                ) : (
                  // Non-authenticated user CTAs
                  <>
                    <Link
                      href="/signup"
                      className="rounded-full bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-lg hover:shadow-xl hover:bg-gray-50 transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Start Free Research
                    </Link>
                    <Link
                      href="/login"
                      className="rounded-full border-2 border-white px-8 py-4 text-base font-semibold text-white hover:bg-white hover:text-blue-600 transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      View Demo
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex justify-center space-x-8">
            <a
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              href="https://nextjs.org/learn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/file.svg"
                alt="File icon"
                width={16}
                height={16}
              />
              Learn
            </a>
            <a
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              href="https://vercel.com/templates?framework=next.js"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/window.svg"
                alt="Window icon"
                width={16}
                height={16}
              />
              Examples
            </a>
            <a
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/globe.svg"
                alt="Globe icon"
                width={16}
                height={16}
              />
              Next.js
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}


