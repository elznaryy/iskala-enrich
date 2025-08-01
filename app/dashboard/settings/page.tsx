export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚙️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Settings Coming Soon</h2>
          <p className="text-gray-600">
            Account settings and preferences will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  )
} 