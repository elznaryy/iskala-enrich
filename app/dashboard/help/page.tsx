export default function HelpPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-2">
          Get help with using iSkala Enrich and find answers to common questions.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❓</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Help Center Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            Documentation and support resources will be available in a future update.
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Need immediate help?</h3>
              <p className="text-sm text-gray-600">
                For technical support or questions about your account, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 