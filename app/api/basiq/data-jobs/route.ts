import { NextResponse } from "next/server"
import { getBasiqServerToken } from "@/lib/basiq-token"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("jobId")

    if (!jobId || jobId === "null") {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    const accessToken = await getBasiqServerToken()

    console.log(`Fetching job status for: ${jobId}`)

    const response = await fetch(`https://au-api.basiq.io/jobs/${jobId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "basiq-version": "3.0", // Re-added this header
      },
    })

    console.log("Job response status:", response.status)

    const data = await response.json()

    if (!response.ok) {
      console.error("Job API error:", data)
      // Return Basiq's error data directly
      return NextResponse.json(data, { status: response.status })
    }

    console.log("Job data:", {
      id: data.id,
      status: data.status,
      steps: data.steps?.length || 0,
      created: data.created,
      updated: data.updated,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Job fetch error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch job details" },
      { status: 500 },
    )
  }
}

export const dynamic = "force-dynamic"
