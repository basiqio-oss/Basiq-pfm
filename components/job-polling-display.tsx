"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, AlertCircle, Loader2, Database, CreditCard, TrendingUp, XCircle } from "lucide-react"
import { DataStreamLoader } from "./data-stream-loader" // Import the new component
import type { DataStreamLoaderProps } from "./data-stream-loader" // Import the DataStreamLoaderProps

interface JobStep {
  id: string
  title: string
  status: "pending" | "active" | "completed" | "failed" | "success" | "in-progress" | "error"
  description?: string
  result?: any
}

interface JobPollingDisplayProps {
  jobData: any
  isPolling: boolean
  accounts: any[]
  transactions: any[]
  jobError?: string | null // Prop to pass specific job error message
}

export default function JobPollingDisplay({
  jobData,
  isPolling,
  accounts,
  transactions,
  jobError,
}: JobPollingDisplayProps) {
  const steps = jobData?.steps || []
  const totalSteps = steps.length
  const completedSteps = steps.filter((step: JobStep) => step.status === "success").length
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  let loaderStatus: DataStreamLoaderProps["status"] = "loading"
  let loaderTitle = "Initializing Connection"
  let loaderMessage = "Preparing to connect your financial data securely."

  const anyFailure = steps.some((step: JobStep) => step.status === "failed" || step.status === "error")
  const lastStep = steps[steps.length - 1]

  if (jobError || anyFailure) {
    loaderStatus = "error"
    const failedStep = steps.find((step: JobStep) => step.status === "failed" || step.status === "error")
    loaderTitle = failedStep?.result?.title || failedStep?.title || "Connection Failed"
    loaderMessage =
      jobError || failedStep?.result?.detail || "There was an issue connecting your bank account. Please try again."
  } else if (lastStep && lastStep.status === "success" && !isPolling) {
    loaderStatus = "success"
    loaderTitle = "Connection Complete!"
    loaderMessage = "Your bank account is successfully connected, and your data is ready."
  } else if (isPolling) {
    loaderStatus = "polling"
    loaderTitle = "Connecting Bank Account"
    loaderMessage = "We're securely connecting to your bank and fetching your financial data."
  } else if (!jobData) {
    loaderStatus = "idle"
    loaderTitle = "Awaiting Connection"
    loaderMessage = "Waiting for bank connection to start."
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case "success":
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "active":
      case "in-progress":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      case "failed":
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStepStatusClass = (status: string) => {
    switch (status) {
      case "success":
      case "completed":
        return "completed"
      case "active":
      case "in-progress":
        return "active"
      case "failed":
      case "error":
        return "failed"
      default:
        return "pending"
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
      <Card className="glass-card border-blue-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>Bank Connection Status</span>
            {isPolling && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-6">
            <DataStreamLoader
              value={progressPercentage}
              status={loaderStatus}
              title={loaderTitle}
              message={loaderMessage}
            />
          </div>

          {/* Job Status Details */}
          {jobData && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Job ID: {jobData.id}</h3>
                  <p className="text-sm text-gray-700">Overall Status: {jobData.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">Created: {new Date(jobData.created).toLocaleString()}</p>
                  {jobData.updated && (
                    <p className="text-sm text-gray-700">Updated: {new Date(jobData.updated).toLocaleString()}</p>
                  )}
                </div>
              </div>

              {/* Job Steps */}
              {steps.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Processing Steps:</h4>
                  {steps.map((step: JobStep, index: number) => {
                    const stepStatusClass = getStepStatusClass(step.status)
                    return (
                      <motion.div
                        key={step.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`job-step ${stepStatusClass} p-4 rounded-lg flex items-center space-x-3 text-gray-900`}
                      >
                        {getStepIcon(step.status)}
                        <div className="flex-1">
                          <h5 className="font-medium">{step.title || `Step ${index + 1}`}</h5>
                          <p className="text-sm text-gray-700">{step.description || step.status}</p>
                          {step.result && (
                            <div className="mt-2 text-xs">
                              <details className="cursor-pointer">
                                <summary className="font-medium">View Details</summary>
                                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto text-gray-800">
                                  {JSON.stringify(step.result, null, 2)}
                                </pre>
                              </details>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {step.updated && new Date(step.updated).toLocaleTimeString()}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Data Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg border border-green-300"
            >
              <div className="flex items-center space-x-3">
                <CreditCard className="w-8 h-8 text-green-600" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Accounts Found</h4>
                  <p className="text-2xl font-bold text-green-600">{accounts.length}</p>
                  <p className="text-sm text-gray-700">
                    {accounts.length > 0 ? "Successfully retrieved" : "Waiting for data..."}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-blue-100 to-cyan-100 p-4 rounded-lg border border-blue-300"
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Transactions Found</h4>
                  <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
                  <p className="text-sm text-gray-700">
                    {transactions.length > 0 ? "Data synchronized" : "Processing..."}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Polling Status / Troubleshooting */}
          {isPolling && !jobError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-blue-700 text-sm">Polling for updates... This may take a few minutes.</span>
              </div>
            </motion.div>
          )}

          {jobError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-700 text-sm">
                  Connection Error: {jobError}. Please check your API key and try again.
                </span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
