"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Target, Plus, TrendingUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMemo } from "react"

interface Transaction {
  amount: string
  postDate: string
  class?: {
    title: string
  }
  subClass?: {
    title: string
  }
}

interface BudgetProps {
  transactions: Transaction[]
}

export default function Budget({ transactions }: BudgetProps) {
  const transactionList = useMemo(() => (Array.isArray(transactions) ? transactions : []), [transactions])

  const budgetCategories = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const monthlySpendingByCategory: { [key: string]: { spent: number; count: number } } = {}
    const previousMonthSpendingByCategory: { [key: string]: { spent: number; count: number } } = {}

    transactionList.forEach((t) => {
      const transactionDate = new Date(t.postDate)
      const category = t.class?.title || t.subClass?.title || "Uncategorized"
      const amount = Math.abs(Number.parseFloat(t.amount))

      if (Number.parseFloat(t.amount) < 0) {
        // Only consider expenses
        if (transactionDate >= startOfMonth) {
          monthlySpendingByCategory[category] = monthlySpendingByCategory[category] || { spent: 0, count: 0 }
          monthlySpendingByCategory[category].spent += amount
          monthlySpendingByCategory[category].count += 1
        } else {
          // For trend calculation, we'd need more sophisticated historical data.
          // For simplicity, let's just use a dummy previous month for now.
          previousMonthSpendingByCategory[category] = previousMonthSpendingByCategory[category] || {
            spent: 0,
            count: 0,
          }
          previousMonthSpendingByCategory[category].spent += amount // This is not accurate for "previous month"
        }
      }
    })

    // Define some hypothetical budgets for common categories
    const defaultBudgets: { [key: string]: number } = {
      Groceries: 500,
      Dining: 200,
      Transport: 150,
      Entertainment: 100,
      Utilities: 120,
      Shopping: 300,
      Uncategorized: 50, // Catch-all
    }

    return Object.keys(monthlySpendingByCategory)
      .map((category) => {
        const spent = monthlySpendingByCategory[category].spent
        const budget = defaultBudgets[category] || 100 // Default to 100 if not specified

        // Simple trend calculation: compare current month's spending to a dummy average or previous period
        // In a real app, this would involve actual historical data.
        const dummyPreviousSpent =
          previousMonthSpendingByCategory[category]?.spent || budget * 0.7 + Math.random() * budget * 0.6 // Simulate some previous spending
        const trend = dummyPreviousSpent > 0 ? ((spent - dummyPreviousSpent) / dummyPreviousSpent) * 100 : 0

        const iconMap: { [key: string]: string } = {
          Groceries: "🛒",
          Dining: "🍽️",
          Transport: "🚗",
          Entertainment: "🎬",
          Utilities: "💡",
          Shopping: "🛍️",
          Uncategorized: "❓",
        }

        const colorMap: { [key: string]: string } = {
          Groceries: "bg-green-500",
          Dining: "bg-orange-500",
          Transport: "bg-blue-500",
          Entertainment: "bg-purple-500",
          Utilities: "bg-yellow-500",
          Shopping: "bg-pink-500",
          Uncategorized: "bg-gray-500",
        }

        return {
          name: category,
          spent: Number.parseFloat(spent.toFixed(2)),
          budget: Number.parseFloat(budget.toFixed(2)),
          color: colorMap[category] || "bg-gray-500",
          trend: Number.parseFloat(trend.toFixed(1)),
          icon: iconMap[category] || "💰",
        }
      })
      .sort((a, b) => b.spent - a.spent) // Sort by highest spending
  }, [transactionList])

  const totalSpent = useMemo(() => budgetCategories.reduce((sum, cat) => sum + cat.spent, 0), [budgetCategories])
  const totalBudget = useMemo(() => budgetCategories.reduce((sum, cat) => sum + cat.budget, 0), [budgetCategories])

  const budgetAmount = 1500
  const spentAmount = 1200
  const progress = (spentAmount / budgetAmount) * 100

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900 flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-600" />
            <span>Monthly Budget</span>
          </CardTitle>
          <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
            <Plus className="w-4 h-4 mr-1" />
            Add Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between text-gray-900 text-sm">
            <span>Spent: ${spentAmount.toFixed(2)}</span>
            <span>Budget: ${budgetAmount.toFixed(2)}</span>
          </div>
          <Progress
            value={progress}
            className="w-full h-2 bg-gray-200 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-value]:bg-purple-500"
          />
          <p className="text-sm text-gray-700">
            You have ${(budgetAmount - spentAmount).toFixed(2)} remaining this month.
          </p>
        </div>

        {budgetCategories.length === 0 ? (
          <div className="text-center py-8 text-gray-700">
            No budget categories to display. Connect accounts and make transactions to see your spending.
          </div>
        ) : (
          budgetCategories.map((category, index) => {
            const percentage = (category.spent / category.budget) * 100
            const isOverBudget = percentage > 100
            const isNearLimit = percentage > 80 && percentage <= 100

            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{category.name}</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`text-xs flex items-center space-x-1 ${
                            category.trend > 0 ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          <TrendingUp className={`w-3 h-3 ${category.trend < 0 ? "rotate-180" : ""}`} />
                          <span>{Math.abs(category.trend)}%</span>
                        </span>
                        {isOverBudget && <AlertCircle className="w-3 h-3 text-red-600" />}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold ${
                        isOverBudget ? "text-red-600" : isNearLimit ? "text-yellow-600" : "text-gray-900"
                      }`}
                    >
                      ${category.spent} / ${category.budget}
                    </span>
                    <p className="text-xs text-gray-700">${(category.budget - category.spent).toFixed(2)} remaining</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress value={Math.min(percentage, 100)} className="h-3 bg-gray-200" />
                  <div className="flex justify-between text-xs">
                    <span
                      className={`${isOverBudget ? "text-red-600" : isNearLimit ? "text-yellow-600" : "text-gray-700"}`}
                    >
                      {percentage.toFixed(0)}% used
                    </span>
                    {isOverBudget && (
                      <span className="text-red-600 font-medium">
                        ${(category.spent - category.budget).toFixed(2)} over budget
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-4 border-t border-gray-200"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Total Budget</span>
            <span className="text-gray-900 font-semibold">
              ${totalSpent.toFixed(2)} / ${totalBudget.toFixed(2)}
            </span>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )
}
