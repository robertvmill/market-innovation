import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <Link
                href="/"
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                ← Back to Home
              </Link>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-6">
                By accessing and using this service, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-700 mb-6">
                Permission is granted to temporarily use this service for personal, non-commercial 
                transitory viewing only.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 mb-6">
                You are responsible for maintaining the confidentiality of your account and password 
                and for restricting access to your computer.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Privacy</h2>
              <p className="text-gray-700 mb-6">
                Your privacy is important to us. Please review our Privacy Policy, which also governs 
                your use of the Service.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:support@example.com" className="text-indigo-600 hover:text-indigo-500">
                  support@example.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 