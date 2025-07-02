import { NextResponse } from "next/server"
import { getBasiqServerToken } from "@/lib/basiq-token"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const accessToken = await getBasiqServerToken()

    // Fetch insights/reports from Basiq
    const response = await fetch(`https://au-api.basiq.io/users/${userId}/insights`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "basiq-version": "3.0",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      // If insights endpoint doesn't exist, return empty insights
      return NextResponse.json({
        insights: [],
        reports: {},
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Reports fetch error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch reports" },
      { status: 500 },
    )
  }
}
