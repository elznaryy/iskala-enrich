export default function HelpPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-2">
          Get help with using iSkala Enrich and find answers to common questions.
        </p>
      </div>

      <div className="space-y-6">
        {/* Contact Section */}
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Need Help?</h2>
            <p className="text-gray-600 mb-4">
              Contact our support team for assistance with any questions or issues.
            </p>
            <a 
              href="mailto:ISkalaEnrich@iskala.net"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              ISkalaEnrich@iskala.net
            </a>
          </div>
        </div>

        {/* Quick FAQ */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Questions</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How does it work?</h3>
              <p className="text-gray-600 text-sm">
                Upload your CSV file with contact information, and we'll enrich it with additional data like email addresses and phone numbers.
          </p>
            </div>
          
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What files are supported?</h3>
              <p className="text-gray-600 text-sm">
                We support CSV files. Make sure your file includes names, companies, or other identifying information.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is my data secure?</h3>
              <p className="text-gray-600 text-sm">
                Yes, all data is encrypted and we follow industry best practices to protect your information.
              </p>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-sm font-bold text-primary-600">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Upload</h3>
              <p className="text-xs text-gray-600">Upload your CSV file</p>
            </div>

            <div className="text-center p-4">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-sm font-bold text-primary-600">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Enrich</h3>
              <p className="text-xs text-gray-600">We add missing data</p>
            </div>

            <div className="text-center p-4">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-sm font-bold text-primary-600">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Download</h3>
              <p className="text-xs text-gray-600">Get your enriched file</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 