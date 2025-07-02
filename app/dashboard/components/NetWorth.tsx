"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingDown, TrendingUp, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import CountUp from "react-countup"

interface NetWorthProps {
  netWorth: number
  trends?: {
    monthlyChange: number
    weeklySpending: number
    savingsRate: number
  }
  accounts: any[]
  isLoading: boolean
  onRefresh: () => void
}

export default function NetWorth({ netWorth, trends, accounts, isLoading, onRefresh }: NetWorthProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null)
  const [showGeneratingAlert, setShowGeneratingAlert] = useState(true)

  const monthlyChangeColor = trends && trends.monthlyChange >= 0 ? "text-green-600" : "text-red-600"
  const weeklySpendingColor = trends && trends.weeklySpending <= 0 ? "text-green-600" : "text-red-600"

  const showStatus = (message: string, type: "success" | "error") => {
    setStatusMessage(message)
    setStatusType(type)
    setTimeout(() => {
      setStatusMessage(null)
      setStatusType(null)
    }, 5000)
  }

  const onGenerateReport = async () => {
    const storedUser = JSON.parse(localStorage.getItem("basiq_user") || "{}")
    const userId = storedUser.userId
    const token = storedUser.clientAccessToken

    if (!userId) {
      showStatus("No userId found in localStorage", "error")
      return
    }

    setIsGenerating(true)
    setShowGeneratingAlert(true)

    try {
      const res = await fetch("/api/basiq/basiq-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          reportType: "CON_AFFOR_01",
          title: "Full Net Worth Report",
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create report")
      }

      const data = await res.json()
      const { reportUrl } = data

      showStatus("✅ Report ready! Download will start shortly.", "success")

      const pdfRes = await fetch(reportUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
        },
      })

      if (!pdfRes.ok) {
        throw new Error("Failed to download PDF report")
      }

      const blob = await pdfRes.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = "networth-report.pdf"
      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      showStatus(`❌ Error: ${error.message}`, "error")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <Card className="bg-white border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-900 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span>Total Net Worth</span>
          </CardTitle>

          <div className="flex flex-col items-end space-y-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateReport}
              disabled={isGenerating}
              className="flex items-center space-x-1"
              title="Generate Full Report"
            >
              <FileText className="w-4 h-4" />
              <span>{isGenerating ? "Generating..." : "Generate Full Report"}</span>
            </Button>

            {statusMessage && !isGenerating && (
              <p
                className={`text-sm mt-1 ${
                  statusType === "success" ? "text-green-600" : "text-red-600"
                }`}
                role="alert"
              >
                {statusMessage}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <motion.div
            key={netWorth}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-gray-900"
            aria-live="polite"
            aria-atomic="true"
          >
            <CountUp
              start={0}
              end={netWorth}
              duration={1.5}
              separator=","
              decimals={2}
              decimal="."
              prefix="$"
              formattingFn={(value) =>
                Number(value).toLocaleString("en-US", {
                  style: "currency",
                  currency: "AUD",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }
            />
          </motion.div>

          <p className="text-xs text-gray-700 mt-1">
            Based on {accounts.length} connected account{accounts.length !== 1 ? "s" : ""}
          </p>

          {trends && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                {trends.monthlyChange >= 0 ? (
                  <TrendingUp className={`w-4 h-4 ${monthlyChangeColor}`} />
                ) : (
                  <TrendingDown className={`w-4 h-4 ${monthlyChangeColor}`} />
                )}
                <span className={monthlyChangeColor}>
                  {trends.monthlyChange > 0 ? "+" : ""}
                  {trends.monthlyChange}%
                </span>
                <span className="text-gray-700">last month</span>
              </div>
              <div className="flex items-center space-x-2">
                {trends.weeklySpending <= 0 ? (
                  <TrendingUp className={`w-4 h-4 ${weeklySpendingColor}`} />
                ) : (
                  <TrendingDown className={`w-4 h-4 ${weeklySpendingColor}`} />
                )}
                <span className={weeklySpendingColor}>
                  {trends.weeklySpending > 0 ? "+" : ""}
                  {trends.weeklySpending}%
                </span>
                <span className="text-gray-700">weekly spending</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="text-blue-600">{trends.savingsRate}%</span>
                <span className="text-gray-700">savings rate</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isGenerating && showGeneratingAlert && (
        <div
          className="fixed bottom-6 right-6 max-w-sm w-full bg-white border border-gray-300 rounded-md shadow-md p-4 flex items-center justify-between space-x-4 z-50"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center space-x-3 text-gray-900">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" />
            </svg>
            <span className="text-sm font-medium">
              Report is generating in the background. You can continue using the app.
            </span>
          </div>
          <button
            onClick={() => setShowGeneratingAlert(false)}
            aria-label="Close notification"
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 rounded"
          >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  )
}
