import { type NextRequest, NextResponse } from "next/server"
import { getBasiqServerToken, getBasiqClientToken } from "@/lib/basiq-token"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const serverToken = await getBasiqServerToken()

    if (!serverToken) {
      return NextResponse.json({ error: "Failed to get server access token" }, { status: 500 })
    }

    // Step 2: Create a user
    const userPayload = { email }

    const userResponse = await fetch("https://au-api.basiq.io/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serverToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "basiq-version": "3.0",
      },
      body: JSON.stringify(userPayload),
    })

    console.log("User creation response status:", userResponse.status)

    if (!userResponse.ok) {
      const errorData = await userResponse.text()
      console.error("User creation failed:", errorData)
      return NextResponse.json({ error: "Failed to create user" }, { status: userResponse.status })
    }

    const userData = await userResponse.json()
    const userId = userData.id
    console.log("User created:", userData)

    if (!userId) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Decode userId before using it
    const decodedUserId = decodeURIComponent(userId)

    const clientAccessToken = await getBasiqClientToken(decodedUserId)

    if (!clientAccessToken) {
      console.error("Failed to retrieve client access token:", clientAccessToken)
      return NextResponse.json({ error: "Failed to generate client access token" }, { status: 500 })
    }

    // Return user data and tokens
    return NextResponse.json({
      id: userId,
      userId: decodedUserId,
      email,
      clientAccessToken,
      status: "created",
    })
  } catch (error: unknown) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}