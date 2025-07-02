import { NextResponse } from "next/server"
import { getBasiqServerToken, getBasiqClientToken } from "@/lib/basiq-token"

export async function POST(request: Request) {
  try {
    const { scope, userId } = await request.json()

    if (scope === "SERVER_ACCESS") {
      const token = await getBasiqServerToken()
      return NextResponse.json({ access_token: token, token_type: "Bearer", expires_in: 3600 })
    } else if (scope === "CLIENT_ACCESS" && userId) {
      const token = await getBasiqClientToken(userId)
      return NextResponse.json({ access_token: token, token_type: "Bearer", expires_in: 3600 })
    } else if (scope === "CLIENT_ACCESS") {
      // Allow CLIENT_ACCESS tokens without userId
      const token = userId
        ? await getBasiqClientToken(userId)
        : await getBasiqClientToken("") // or handle accordingly
      return NextResponse.json({ access_token: token, token_type: "Bearer", expires_in: 3600 })
    } else {
      return NextResponse.json({ error: "Invalid scope or missing userId for CLIENT_ACCESS" }, { status: 400 })
    }
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
