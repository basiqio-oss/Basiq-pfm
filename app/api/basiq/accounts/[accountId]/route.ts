import { type NextRequest, NextResponse } from "next/server"
import { getBasiqServerToken } from "@/lib/basiq-token"

export async function GET(request: NextRequest, { params }: { params: { accountId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const accountId = params.accountId

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 })
    }

    console.log(`Fetching account details for userId: ${userId}, accountId: ${accountId}`)

    const token = await getBasiqServerToken()

    const response = await fetch(`https://au-api.basiq.io/users/${userId}/accounts/${accountId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "basiq-version": "3.0",
      },
    })

    const responseText = await response.text()
    console.log(`Account details API response status: ${response.status}`)
    console.log(`Account details API response: ${responseText}`)

    if (!response.ok) {
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { message: responseText }
      }

      console.error("Account details API error:", errorData)
      return NextResponse.json(
        { error: "Failed to fetch account details", details: errorData },
        { status: response.status },
      )
    }

    const data = JSON.parse(responseText)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in account details route:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
