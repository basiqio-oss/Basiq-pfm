"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import Cookies from "js-cookie" // Import js-cookie
import { useBasiqJobPolling } from "@/hooks/use-basiq-job-polling" // Import the new hook
import JobPollingDisplay from "@/components/job-polling-display" // Import JobPollingDisplay

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "polling" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const { jobData, isPolling, pollJobStatus, jobError } = useBasiqJobPolling() // Use the new hook

  useEffect(() => {
    const success = searchParams.get("success")
    const errorFromUrl = searchParams.get("error")
    const jobId = searchParams.get("jobId") || searchParams.get("jobIds") // Handle both jobId and jobIds

    console.log("Callback params:", { success, errorFromUrl, jobId })

    const handleCallback = async () => {
      if (errorFromUrl) {
        setStatus("error")
        setMessage("Failed to connect your bank account. Please try again.")
        setTimeout(() => router.push("/"), 3000)
        return
      }

      if (jobId) {
        setStatus("polling")
        setMessage("Connecting your bank account and fetching data...")
        Cookies.set("basiq_job_id", jobId, { expires: 7 }) // Store for 7 days
        console.log("Job ID stored in cookie:", jobId)

        try {
          const finalJobData = await pollJobStatus(jobId) // Start polling
          if (finalJobData.status === "success") {
            setStatus("success")
            setMessage("Successfully connected your bank account and fetched data!")

            // Update user data in localStorage
            const userData = localStorage.getItem("basiq_user")
            if (userData) {
              const user = JSON.parse(userData)
              const updatedUser = {
                ...user,
                connectionStatus: "connected",
                connectedAt: new Date().toISOString(),
                jobId: finalJobData.id, // Store the final job ID
              }
              localStorage.setItem("basiq_user", JSON.stringify(updatedUser))
            }

            router.push("/dashboard") // Redirect only after job success
          } else {
            // This else block might be hit if pollJobStatus resolves, but the job status isn't 'success'
            // and it didn't throw an error (e.g., intermediate 'in-progress' before a final failure).
            // But pollJobStatus is designed to throw on 'failed' or 'error' status.
            setStatus("error")
            setMessage(`Bank connection job did not complete successfully: ${finalJobData.message || "Unknown status"}`)
            setTimeout(() => router.push("/"), 3000)
          }
        } catch (pollErr) {
          // This catches errors thrown by pollJobStatus (job failed, timeout, network issue)
          setStatus("error")
          setMessage(
            `Bank connection failed: ${jobError || (pollErr instanceof Error ? pollErr.message : "An unknown error occurred during polling.")}`,
          )
          setTimeout(() => router.push("/"), 3000)
        }
      } else if (success === "true") {
        // Fallback for success without jobId (less common for Basiq, but good to have)
        setStatus("success")
        setMessage("Successfully connected your bank account! Redirecting to dashboard...")
        const userData = localStorage.getItem("basiq_user")
        if (userData) {
          const user = JSON.parse(userData)
          const updatedUser = {
            ...user,
            connectionStatus: "connected",
            connectedAt: new Date().toISOString(),
          }
          localStorage.setItem("basiq_user", JSON.stringify(updatedUser))
        }
        router.push("/dashboard")
      } else {
        setStatus("error")
        setMessage("Something went wrong. No job ID or success status found.")
        setTimeout(() => router.push("/"), 3000)
      }
    }

    // Only run if a jobId is present and we're not already polling, or if there's an immediate URL error.
    // The `jobError` is explicitly NOT in the dependency array to avoid re-triggering.
    if (jobId && !isPolling) {
      handleCallback()
    } else if (errorFromUrl) {
      // Handle immediate URL error without polling
      handleCallback()
    }
  }, [searchParams, router, pollJobStatus]) // Removed jobError from dependencies

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center text-gray-900 p-8"
      >
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-red-600" />
            <h1 className="text-2xl font-bold mb-2">Initializing connection...</h1>
            <p className="text-gray-700">Preparing to connect your financial data</p>
          </>
        )}

        {status === "polling" && (
          <JobPollingDisplay
            jobData={jobData}
            isPolling={isPolling}
            accounts={[]}
            transactions={[]}
            jobError={jobError} // Pass the jobError prop
          />
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h1 className="text-2xl font-bold mb-2">Success!</h1>
            <p className="text-gray-700">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to your dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h1 className="text-2xl font-bold mb-2">Connection Failed</h1>
            <p className="text-gray-700">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting back to home...</p>
          </>
        )}
      </motion.div>
    </div>
  )
}
