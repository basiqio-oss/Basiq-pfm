import { NextRequest, NextResponse } from "next/server"
import { getBasiqServerToken } from "@/lib/basiq-token"

export async function POST(req: NextRequest) {
  // Your existing POST code for creating user by email
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const serverToken = await getBasiqServerToken()
    if (!serverToken) {
      return NextResponse.json({ error: "Failed to get server access token" }, { status: 500 })
    }

    // Fetch user details from Basiq API
    const userResponse = await fetch(`https://au-api.basiq.io/users/${encodeURIComponent(userId)}`, {
      headers: {
        Authorization: `Bearer ${serverToken}`,
        Accept: "application/json",
        "basiq-version": "3.0",
      },
    })

    if (!userResponse.ok) {
      const errorData = await userResponse.text()
      console.error("Failed to fetch user:", errorData)
      return NextResponse.json({ error: "Failed to fetch user details" }, { status: userResponse.status })
    }

    const userData = await userResponse.json()
    return NextResponse.json(userData)
  } catch (error) {
    console.error("Unexpected error in GET /api/basiq/user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
