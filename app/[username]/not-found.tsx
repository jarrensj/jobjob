import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Profile Not Found</h1>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn&apos;t find a user with this username. They may have changed their username or the profile doesn&apos;t exist.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>Looking for someone specific?</p>
            <p>Make sure you have the correct username.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
