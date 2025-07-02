import { NextResponse } from "next/server"
import { getBasiqServerToken } from "@/lib/basiq-token"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = searchParams.get("limit") || "500"
    const directUrl = searchParams.get("url") // New: direct URL from job step

    const accessToken = await getBasiqServerToken()

    let url: string
    if (directUrl) {
      // Use the direct URL provided by the job step
      url = directUrl
      console.log(`Fetching transactions from direct URL: ${url}`)
    } else {
      // Fallback to userId-based fetching if no direct URL
      if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 })
      }
      url = `https://au-api.basiq.io/users/${userId}/transactions?limit=${limit}`
      console.log(`Fetching transactions from: ${url}`)
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "basiq-version": "3.0",
      },
    })

    console.log("Transactions response status:", response.status)

    let data: any
    try {
      data = await response.json()
    } catch (err) {
      console.error("Failed to parse transactions API response as JSON:", err)
      return NextResponse.json({ error: "Invalid JSON from Basiq" }, { status: 502 })
    }

    if (!response.ok) {
      console.error("Transactions API error:", {
        status: response.status,
        url,
        data,
      })
      return NextResponse.json(
        { error: data?.message || "Failed to fetch transactions" },
        { status: response.status },
      )
    }


    console.log("Transactions data:", {
      count: data.data?.length || 0,
      hasEnrichment: data.data?.[0]?.enrich ? "Yes" : "No",
      sample: data.data?.[0],
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Transactions fetch error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch transactions" },
      { status: 500 },
    )
  }
}
