"use client"

import { useState, useCallback } from "react"

interface JobStep {
  id: string
  title: string
  status: "pending" | "active" | "completed" | "failed" | "success" | "in-progress" | "error"
  description?: string
  result?: any
}

interface BasiqJobData {
  id: string
  status: string
  steps: JobStep[]
  created: string
  updated: string
  message?: string
  data?: any[] // Added to capture potential top-level 'data' from Basiq job
}

interface UseBasiqJobPollingResult {
  jobData: BasiqJobData | null
  isPolling: boolean
  pollJobStatus: (jobId: string, maxAttempts?: number) => Promise<BasiqJobData>
  jobError: string | null
}

const POLLING_INTERVAL_MS = 5000 // Increased to 5 seconds

export function useBasiqJobPolling(): UseBasiqJobPollingResult {
  const [jobData, setJobData] = useState<BasiqJobData | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [jobError, setJobError] = useState<string | null>(null)

  const pollJobStatus = useCallback(async (jobId: string, maxAttempts = 30): Promise<BasiqJobData> => {
    setIsPolling(true)
    setJobError(null) // Reset error at the start of a new polling attempt
    let attempts = 0

    const poll = async (): Promise<BasiqJobData> => {
      try {
        const response = await fetch(`/api/basiq/job?jobId=${jobId}`)
        const currentJobData: BasiqJobData = await response.json()

        console.log(
          `useBasiqJobPolling: Job ${jobId} status:`,
          currentJobData.status,
          `(attempt ${attempts + 1}/${maxAttempts})`,
        )
        console.log("useBasiqJobPolling: Job steps:", currentJobData.steps)

        // Check if the response from Basiq API itself indicates an error,
        // even if the Next.js API route returns 200 (which it shouldn't for Basiq errors, but as a safeguard)
        if (currentJobData.error) {
          throw new Error(currentJobData.error)
        }

        setJobData(currentJobData) // Update state for display

        if (!response.ok) {
          // This case should be handled by the Next.js API route now returning Basiq's error directly
          throw new Error(
            currentJobData.message || currentJobData.data?.[0]?.detail || "Failed to fetch job details from Basiq API.",
          )
        }

        if (currentJobData.status === "success") {
          console.log("useBasiqJobPolling: Job status is success. Stopping polling.")
          setIsPolling(false) // Explicitly set isPolling to false on success
          return currentJobData
        }

        if (currentJobData.status === "failed" || currentJobData.status === "error") {
          console.log("useBasiqJobPolling: Job status is failed/error. Stopping polling.")
          setIsPolling(false) // Explicitly set isPolling to false on failure
          const failureMessage =
            currentJobData.message || currentJobData.data?.[0]?.detail || "Job failed with unknown error."
          throw new Error(`Job failed: ${failureMessage}`)
        }

        attempts++
        if (attempts >= maxAttempts) {
          console.warn("useBasiqJobPolling: Job polling timeout reached.")
          setIsPolling(false) // Stop polling on timeout
          throw new Error("Job polling timeout - data may still be processing. Please refresh the page.")
        }

        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS)) // Poll every 5 seconds
        return poll()
      } catch (error) {
        console.error("useBasiqJobPolling: Job polling error:", error)
        setIsPolling(false) // Ensure polling stops on any error
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during polling."
        setJobError(errorMessage)
        throw error // Re-throw to be caught by the caller
      }
    }

    try {
      const result = await poll()
      return result
    } catch (error) {
      throw error
    }
  }, [])

  return { jobData, isPolling, pollJobStatus, jobError }
}
