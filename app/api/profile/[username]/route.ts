import { NextRequest, NextResponse } from "next/server"
import { createClerkSupabaseClient } from "@/app/lib/db"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createClerkSupabaseClient()
    
    // Get public profile data by username
    // We only return public information, not sensitive data like clerk_user_id or email
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('id, username, created_at')
      .eq('username', username.trim())
      .single()

    if (error && error.code === 'PGRST116') { // PGRST116 is "not found"
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    if (error) {
      console.error('Error fetching profile:', error)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    return NextResponse.json({ profile })

  } catch (error) {
    console.error('Error in profile API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
