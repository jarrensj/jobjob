'use client'

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import UsernameForm from '@/components/UsernameForm'

interface UserProfile {
  id: string
  clerk_user_id: string
  username: string
  email?: string
  created_at: string
  updated_at: string
}

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUpdateForm, setShowUpdateForm] = useState(false)

  // Fetch user profile when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/username')
        const data = await response.json()
        
        if (response.ok && data.profile) {
          setUserProfile(data.profile)
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleUsernameSet = (username: string) => {
    // Refresh the profile data
    setUserProfile(prev => prev ? { ...prev, username } : null)
    setShowUpdateForm(false)
    setLoading(true)
    
    // Refetch to get updated profile
    fetch('/api/username')
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          setUserProfile(data.profile)
        }
      })
      .finally(() => setLoading(false))
  }

  return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center">
      <SignedOut>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">Welcome!</h1>
          <p className="text-gray-600 mb-8">Sign in to get started</p>
          <SignInButton>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : userProfile ? (
          // User has a profile - show dashboard
          <div className="text-center max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">
              Welcome back, {userProfile.username}!
            </h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
              <div className="text-left space-y-2">
                <p><strong>Username:</strong> {userProfile.username}</p>
                <p><strong>Member since:</strong> {new Date(userProfile.created_at).toLocaleDateString()}</p>
                <p><strong>Profile URL:</strong> 
                  <a 
                    href={`/${userProfile.username}`}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    /{userProfile.username}
                  </a>
                </p>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setShowUpdateForm(!showUpdateForm)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  {showUpdateForm ? 'Cancel' : 'Change Username'}
                </button>
                <a
                  href={`/${userProfile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  View Public Profile
                </a>
              </div>
            </div>

            {showUpdateForm && (
              <div className="mt-8">
                <UsernameForm
                  mode="update"
                  currentUsername={userProfile.username}
                  onUsernameSet={handleUsernameSet}
                />
              </div>
            )}
          </div>
        ) : (
          // User doesn't have a profile - show username creation form
          <div className="w-full max-w-md">
            <UsernameForm onUsernameSet={handleUsernameSet} />
          </div>
        )}
      </SignedIn>
    </main>
  );
}