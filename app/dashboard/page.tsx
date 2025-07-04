"use client"

import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import NetWorth from "./components/NetWorth"
import Accounts from "./components/Accounts"
import Transactions from "./components/Transactions"
import SpendingChart from "./components/SpendingChart"
import Reports from "./components/Reports"
import CategorySpending from "./components/CategorySpending"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { ModernLoader } from "@/components/modern-loader"
import { AlertCircle } from "lucide-react"

interface Account {
  id: string
  name: string
  balance: string
  accountNo: string
  accountNumber?: string
  institution: string
  class: {
    type: string // e.g., "transaction", "credit-card", "loan", "term-deposit"
    product: string
  }
  currency?: string // Added currency to Account interface
}

interface Transaction {
  id: string
  description: string
  amount: string
  postDate: string
  transactionDate?: string
  category?: string
  merchant?: string
  type?: "debit" | "credit"
  status?: string
  class?: {
    title: string
    code: string
  }
  subClass?: {
    title: string
    code: string
  }
  enrich?: {
    cleanDescription?: string
    tags?: string[]
    merchant?: {
      id?: string
      businessName?: string
      website?: string
      abn?: string
      logoMaster?: string
      logoThumb?: string
      phoneNumber?: {
        local?: string
        international?: string
      }
    }
    location?: {
      routeNo?: string
      route?: string
      postalCode?: string
      suburb?: string
      state?: string
      country?: string
      formattedAddress?: string
      geometry?: {
        lat?: string
        lng?: string
      }
    }
    category?: {
      matchType?: string
      matchScore?: string
      mcc?: string | null
      anzsic?: {
        division?: {
          code?: string
          title?: string
        }
        subdivision?: {
          code?: string
          title?: string
        }
        group?: {
          code?: string
          title?: string
        }
        class?: {
          code?: string
          title?: string
        }
        subclass?: {
          title?: string
          code?: string
        }
      }
    }
  }
}

interface DashboardData {
  user: any
  netWorth: number
  accounts: Account[]
  transactions: Transaction[]
  insights: any[]
  reports: any
  trends: any
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  // Helper to calculate trends from transaction and account data
  const calculateTrends = useCallback((transactions: Transaction[], accounts: Account[]) => {
    const now = new Date()
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)

    const recentTransactions = transactions.filter((t) => new Date(t.postDate) >= oneMonthAgo)
    const weeklyTransactions = transactions.filter((t) => new Date(t.postDate) >= oneWeekAgo)

    const totalSpendingMonth = recentTransactions
      .filter((t) => Number.parseFloat(t.amount) < 0) // Only debit transactions
      .reduce((sum, t) => sum + Math.abs(Number.parseFloat(t.amount)), 0)

    const totalIncomeMonth = recentTransactions
      .filter((t) => Number.parseFloat(t.amount) > 0)
      .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)

    const totalSpendingWeek = weeklyTransactions
      .filter((t) => Number.parseFloat(t.amount) < 0)
      .reduce((sum, t) => sum + Math.abs(Number.parseFloat(t.amount)), 0)

    const savingsRate = totalIncomeMonth > 0 ? ((totalIncomeMonth - totalSpendingMonth) / totalIncomeMonth) * 100 : 0

    // Placeholder for monthlyChange and weeklySpending trends (requires historical data not directly from Basiq current fetch)
    // For a real app, you'd store historical data and compare.
    // For now, we'll use a simple random change to simulate.
    const monthlyChange = Math.random() * 20 - 10 // -10% to +10% change
    const weeklySpendingChange = Math.random() * 20 - 10 // -10% to +10% change

    return {
      monthlyChange: Number.parseFloat(monthlyChange.toFixed(1)),
      weeklySpending: Number.parseFloat(weeklySpendingChange.toFixed(1)),
      savingsRate: Number.parseFloat(Math.max(0, savingsRate).toFixed(1)),
      totalSpendingMonth,
      totalIncomeMonth,
      totalSpendingWeek,
    }
  }, [])

  // Helper to generate insights from transaction data
  const generateInsights = useCallback((transactions: Transaction[]) => {
    const insights: any[] = []

    if (transactions.length === 0) return insights

    const now = new Date()
    const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    const twoWeeksAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14)

    const currentWeekTransactions = transactions.filter((t) => new Date(t.postDate) >= oneWeekAgo)
    const previousWeekTransactions = transactions.filter(
      (t) => new Date(t.postDate) >= twoWeeksAgo && new Date(t.postDate) < oneWeekAgo,
    )

    const getCategorySpending = (txns: Transaction[]) => {
      return txns
        .filter((t) => Number.parseFloat(t.amount) < 0) // Only debit transactions
        .reduce(
          (acc, t) => {
            // Prioritize enriched categories (subclass, then class, then group, then subdivision, then division)
            const category =
              t.enrich?.category?.anzsic?.subclass?.title ||
              t.enrich?.category?.anzsic?.class?.title ||
              t.enrich?.category?.anzsic?.group?.title ||
              t.enrich?.category?.anzsic?.subdivision?.title ||
              t.enrich?.category?.anzsic?.division?.title ||
              t.class?.title ||
              t.subClass?.title ||
              "Uncategorized"
            const amount = Math.abs(Number.parseFloat(t.amount))
            acc[category] = (acc[category] || 0) + amount
            return acc
          },
          {} as Record<string, number>,
        )
    }

    const currentWeekSpending = getCategorySpending(currentWeekTransactions)
    const previousWeekSpending = getCategorySpending(previousWeekTransactions)

    // Spending Alert: Compare categories week over week
    for (const category in currentWeekSpending) {
      const currentAmount = currentWeekSpending[category]
      const previousAmount = previousWeekSpending[category] || 0

      if (previousAmount > 0 && currentAmount > previousAmount * 1.2) {
        // 20% increase
        const percentageIncrease = ((currentAmount - previousAmount) / previousAmount) * 100
        insights.push({
          id: `spending-alert-${category}`,
          type: "warning",
          icon: "AlertTriangle",
          title: "Spending Alert",
          message: `${category} expenses up ${percentageIncrease.toFixed(0)}% this week compared to last.`,
          color: "border-yellow-300 bg-gradient-to-r from-yellow-100 to-orange-100",
          textColor: "text-yellow-600",
          action: "Review Spending",
        })
      }
    }

    // Income Pattern (simple check for positive transactions)
    const incomeTransactions = transactions.filter((t) => Number.parseFloat(t.amount) > 0)
    if (incomeTransactions.length > 0) {
      const avgIncome =
        incomeTransactions.reduce((sum, t) => sum + Number.parseFloat(t.amount), 0) / incomeTransactions.length
      insights.push({
        id: "income-pattern",
        type: "info",
        icon: "TrendingUp",
        title: "Income Pattern",
        message: `Average income transaction: $${avgIncome.toFixed(2)}.`,
        color: "border-blue-300 bg-gradient-to-r from-blue-100 to-cyan-100",
        textColor: "text-blue-600",
        action: "View Details",
      })
    }

    // Budget Achievement (placeholder, as Basiq doesn't have direct budgets)
    // This would typically come from user-defined budgets.
    // For demo, let's say if total spending is below a certain threshold.
    const totalCurrentWeekSpending = Object.values(currentWeekSpending).reduce((sum, val) => sum + val, 0)
    const hypotheticalWeeklyBudget = 1000 // Example
    if (totalCurrentWeekSpending < hypotheticalWeeklyBudget * 0.8) {
      // Less than 80% of hypothetical budget
      insights.push({
        id: "budget-achievement",
        type: "success",
        icon: "CheckCircle",
        title: "Budget Achievement",
        message: `You're doing great! Your spending is well within your hypothetical weekly budget.`,
        color: "border-green-300 bg-gradient-to-r from-green-100 to-emerald-100",
        textColor: "text-green-600",
        action: "View Progress",
      })
    }

    return insights
  }, [])

  // Function to fetch dashboard data
  const fetchDashboardContent = useCallback(async () => {
    try {
      setError("")
      const userData = localStorage.getItem("basiq_user")
      if (!userData) return router.push("/")
      const user = JSON.parse(userData)

      // 1. Extract jobId from URL
      const jobId = searchParams.get("jobId")

      // Check if jobId is valid (not null or "null")
      const isValidJobId = jobId && jobId !== "null"

      if (isValidJobId) {
        const maxAttempts = 10
        let attempt = 0
        let jobComplete = false

        while (attempt < maxAttempts && !jobComplete) {
          const res = await fetch(`/api/basiq/job?jobId=${jobId}`)
          const data = await res.json()
          const steps = data?.steps || []
          jobComplete = steps.length > 0 && steps.every((s: any) => s.status === "success")

          if (!jobComplete) await new Promise((r) => setTimeout(r, 2000))
          attempt++
        }

        if (!jobComplete) {
          setError("Job failed to complete. Please try again.")
          return
        }
      }

      // 4. Now fetch accounts, transactions, reports
      const [accountsRes, transactionsRes, reportsRes] = await Promise.all([
        fetch(`/api/basiq/accounts?userId=${user.userId}`),
        fetch(`/api/basiq/transactions?userId=${user.userId}&limit=500`),
        fetch(`/api/basiq/reports?userId=${user.userId}`),
      ])

      const accountsJson = await accountsRes.json()
      const transactionsJson = await transactionsRes.json()
      const reportsJson = await reportsRes.json()

      const accountsData = Array.isArray(accountsJson)
        ? accountsJson.map((acc: any) => ({
          ...acc,
          type: acc.class?.type || "unknown",
          accountNo: acc.accountNo || acc.accountNumber || "", // Ensure accountNo is present
        }))
        : accountsJson.data?.map((acc: any) => ({
          ...acc,
          type: acc.class?.type || "unknown",
          accountNo: acc.accountNo || acc.accountNumber || "", // Ensure accountNo is present
        })) || []

      const transactionsData = transactionsJson.data || []
      const insightsData = reportsJson.insights || generateInsights(transactionsData)

      const netWorth = accountsData.reduce((sum: number, account: Account) => sum + Number.parseFloat(account.balance || "0"), 0)
      const trends = calculateTrends(transactionsData, accountsData)

      setData({
        user: {
          name: user.email.split("@")[0],
          email: user.email,
          connectionStatus: user.connectionStatus,
        },
        netWorth,
        accounts: accountsData,
        transactions: transactionsData,
        insights: insightsData,
        reports: reportsJson.reports || {},
        trends,
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }, [router, calculateTrends, generateInsights, searchParams])
  // Initial data fetch
  useEffect(() => {
    const initializeDashboard = async () => {
      console.log("initializeDashboard: Starting. Setting loading to true.")
      setLoading(true) // Start loading state for the whole dashboard

      const userData = localStorage.getItem("basiq_user")
      if (!userData) {
        console.log("initializeDashboard: No user data, redirecting.")
        router.push("/")
        return
      }
      console.warn("initializeDashboard: Directly fetching dashboard content.")
      await fetchDashboardContent()
    }

    initializeDashboard()
  }, [router, searchParams, fetchDashboardContent])

  useEffect(() => {
    console.log("Dashboard component: loading state changed to", loading)
  }, [loading])

  // Refresh data function
  const handleRefresh = () => {
    fetchDashboardContent().catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to refresh dashboard data.")
      setLoading(false)
    })
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-900 p-8">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
          <h1 className="text-2xl font-bold mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="space-y-4">
            <button
              onClick={handleRefresh}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg mr-4"
            >
              Retry
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // If loading is true, show the improved loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ModernLoader
          size="lg"
          text="Loading your financial data..."
          subtext="This may take a few moments while we fetch your data"
        />
      </div>
    )
  }

  // Add this check to handle cases where loading is false but data is null
  if (!loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-900 p-8">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
          <h1 className="text-2xl font-bold mb-4">Dashboard Data Not Available</h1>
          <p className="text-gray-700 mb-6">
            There was an issue loading your financial data. Please try refreshing or reconnecting.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleRefresh}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg mr-4"
            >
              Refresh
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    )
  }

  // If not loading and no error, render the main dashboard
  return (
<div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-50 bg-gray-50 shadow-sm">
  <Header user={data?.user} isLoading={loading} />
</div>
      <main className="flex-grow relative z-10 text-gray-900 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto space-y-8"
        >
          {/* Net Worth Summary */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="interactive-card"
          >
            <NetWorth
              netWorth={data?.netWorth || 0}
              trends={data?.trends}
              accounts={data?.accounts || []}
              isLoading={loading}
              onRefresh={handleRefresh}
            />
          </motion.div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Left Column - Accounts & Transactions */}
            <div className="xl:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="interactive-card"
              >
                <Accounts accounts={data?.accounts || []} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="interactive-card"
              >
                <Transactions transactions={data?.transactions || []} />
              </motion.div>
            </div>

            {/* Right Column - Insights & Charts */}
            <div className="xl:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="interactive-card"
              >
                <CategorySpending transactions={data?.transactions || []} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="interactive-card"
              >
                <SpendingChart transactions={data?.transactions || []} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="interactive-card"
              >
                <Reports transactions={data?.transactions || []} accounts={data?.accounts || []} />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
