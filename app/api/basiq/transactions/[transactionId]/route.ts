import { getBasiqServerToken } from "@/lib/basiq-token"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { transactionId: string } }) {
  const { transactionId } = params
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  if (!transactionId) {
    return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
  }

  try {
    const token = await getBasiqServerToken()
    if (!token) {
      throw new Error("Failed to get Basiq server token")
    }

    console.log(`Fetching transaction details for userId: ${userId}, transactionId: ${transactionId}`)

    const response = await fetch(`https://au-api.basiq.io/users/${userId}/transactions/${transactionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "basiq-version": "3.0",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Basiq API Error:", data)
      return NextResponse.json(
        { error: data.data?.[0]?.detail || "Failed to fetch transaction details" },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching transaction details:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
