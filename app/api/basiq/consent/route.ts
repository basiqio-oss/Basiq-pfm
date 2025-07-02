import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId, clientAccessToken } = await request.json()

    if (!userId || !clientAccessToken) {
      return NextResponse.json({ error: "User ID and client access token are required" }, { status: 400 })
    }

    // Get the base URL for redirect
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const redirectUri = `${baseUrl}/auth/callback`

    // Generate the actual Basiq consent URL with redirect
    const consentUrl = `https://consent.basiq.io/home?token=${clientAccessToken}&redirect_uri=${encodeURIComponent(redirectUri)}`

    console.log("Generated consent URL:", consentUrl)
    console.log("Redirect URI:", redirectUri)

    return NextResponse.json({
      consentUrl,
      userId,
      clientAccessToken,
      redirectUri,
      status: "ready",
    })
  } catch (error) {
    console.error("Error generating consent URL:", error)
    return NextResponse.json(
      {
        error: "Failed to generate consent URL",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
