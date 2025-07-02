import { NextResponse } from "next/server"
import { getBasiqServerToken } from "@/lib/basiq-token"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const accountId = searchParams.get("accountId")
    const directUrl = searchParams.get("url") // New: direct URL from job step

    const accessToken = await getBasiqServerToken()

    let url: string
    if (directUrl) {
      // Use the direct URL provided by the job step
      url = directUrl
      console.log(`Fetching accounts from direct URL: ${url}`)
    } else {
      // Fallback to userId-based fetching if no direct URL
      if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 })
      }
      url = `https://au-api.basiq.io/users/${userId}/accounts`
      if (accountId) {
        url += `/${accountId}`
      }
      console.log(`Fetching accounts from: ${url}`)
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "basiq-version": "3.0",
      },
    })

    console.log("Accounts response status:", response.status)

    const data = await response.json()

    if (!response.ok) {
      console.error("Accounts API error:", data)
      throw new Error(data.message || "Failed to fetch accounts")
    }

    console.log("Accounts data:", {
      count: data.data?.length || (accountId || directUrl ? 1 : 0),
      sample: data.data?.[0] || data,
      totalBalance: data.data?.reduce((sum: number, acc: any) => sum + (Number.parseFloat(acc.balance) || 0), 0) || 0,
    })

    // Return the accounts data
    if (accountId || directUrl) {
      // Single account request or direct URL for a single account
      return NextResponse.json(data)
    } else {
      // Multiple accounts request
      return NextResponse.json(data.data || [])
    }
  } catch (error) {
    console.error("Accounts fetch error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch accounts" },
      { status: 500 },
    )
  }
}
