import { NextResponse } from "next/server"
import { getBasiqServerToken } from "@/lib/basiq-token"

const POLLING_INTERVAL = 3000 // ms
const MAX_ATTEMPTS = 10 // Total wait: 30s

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { reportType, title, userId } = body

    if (!reportType || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: reportType or userId" },
        { status: 400 }
      )
    }

    const toDate = new Date()
    const fromDate = new Date()
    fromDate.setFullYear(toDate.getFullYear() - 1)

    const formattedFromDate = fromDate.toISOString().split("T")[0]
    const formattedToDate = toDate.toISOString().split("T")[0]

    const filters = [
      { name: "fromDate", value: formattedFromDate },
      { name: "toDate", value: formattedToDate },
      { name: "users", value: [userId] },
      { name: "accounts", value: [] },
    ]

    const accessToken = await getBasiqServerToken()

    // Create the report job
    const reportResponse = await fetch("https://au-api.basiq.io/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        reportType,
        title: title || "Full Net Worth Report",
        filters,
      }),
    })

    const reportData = await reportResponse.json()

    if (!reportResponse.ok) {
      return NextResponse.json(
        { error: reportData.message || "Failed to create report job" },
        { status: reportResponse.status }
      )
    }

    const jobId = reportData.id

    // Polling function to wait for report completion
    const pollJobStatus = async (): Promise<any> => {
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const jobResponse = await fetch(`https://au-api.basiq.io/jobs/${jobId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        })

        const jobData = await jobResponse.json()

        const status = jobData?.steps?.[0]?.status

        if (status === "success") {
          const reportUrl = jobData.links?.source
          if (!reportUrl) {
            return { error: "Report URL missing in job data" }
          }
          // Return the URL to the client for later PDF download
          return { reportUrl, jobId }
        } else if (status === "failed") {
          return { error: "Basiq report job failed" }
        }

        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL))
      }

      return { error: "Polling timed out" }
    }

    const result = await pollJobStatus()

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Return jobId and the direct URL to the PDF report
    return NextResponse.json({ jobId, reportUrl: result.reportUrl })
  } catch (error) {
    console.error("🚨 Server error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    )
  }
}
