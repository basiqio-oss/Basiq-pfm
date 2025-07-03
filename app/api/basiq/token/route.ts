import { NextResponse } from "next/server"
import { getBasiqClientToken } from "@/lib/basiq-token"

export async function POST(request: Request) {
  try {
    const { scope, userId } = await request.json()

    if (scope === "CLIENT_ACCESS") {
      // Call with userId if present, else empty string
      const token = await getBasiqClientToken(userId ?? "")
      return NextResponse.json({ access_token: token, token_type: "Bearer", expires_in: 3600 })
    }

    // Server tokens never exposed here
    return NextResponse.json({ error: "Invalid scope or missing userId for CLIENT_ACCESS" }, { status: 400 })
  } catch (error) {
    console.error("Token route error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get access token",
      },
      { status: 500 },
    )
  }
}
