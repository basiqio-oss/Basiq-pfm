"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, TrendingUp, TrendingDown, DollarSign, Banknote, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMemo } from "react"

interface Transaction {
  id: string
  description: string
  amount: string
  postDate: string
  type?: "debit" | "credit"
  class?: {
    title: string
    code: string
  }
  subClass?: {
    title: string
    code: string
  }
  enrich?: {
    category?: {
      anzsic?: {
        class?: {
          title?: string
          code?: string
        }
        subclass?: {
          title?: string
          code?: string
        }
      }
    }
  }
}

interface Account {
  id: string
  name: string
  balance: string
  institution: string
  class: {
    type: string
    product: string
  }
}

interface ReportsProps {
  transactions: Transaction[]
  accounts: Account[]
}

export default function Reports({ transactions, accounts }: ReportsProps) {
  const { totalIncome, totalExpenses, netFlow, expenseCategories, incomeCategories, accountBalances } = useMemo(() => {
    let totalIncome = 0
    let totalExpenses = 0
    const expenseCategories: { [key: string]: number } = {}
    const incomeCategories: { [key: string]: number } = {}
    const accountBalances: { [key: string]: number } = {}

    transactions.forEach((t) => {
      const amount = Number.parseFloat(t.amount)
      const category =
        t.enrich?.category?.anzsic?.subclass?.title ||
        t.enrich?.category?.anzsic?.class?.title ||
        t.enrich?.category?.anzsic?.group?.title ||
        t.enrich?.category?.anzsic?.subdivision?.title ||
        t.enrich?.category?.anzsic?.division?.title ||
        t.class?.title ||
        t.subClass?.title ||
        "Uncategorized"

      if (amount > 0) {
        totalIncome += amount
        incomeCategories[category] = (incomeCategories[category] || 0) + amount
      } else {
        totalExpenses += Math.abs(amount)
        expenseCategories[category] = (expenseCategories[category] || 0) + Math.abs(amount)
      }
    })

    accounts.forEach((acc) => {
      accountBalances[acc.name] = Number.parseFloat(acc.balance)
    })

    const netFlow = totalIncome - totalExpenses

    return {
      totalIncome: totalIncome.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      netFlow: netFlow.toFixed(2),
      expenseCategories,
      incomeCategories,
      accountBalances,
    }
  }, [transactions, accounts])

  const sortedExpenseCategories = Object.entries(expenseCategories).sort(([, a], [, b]) => b - a)
  const sortedIncomeCategories = Object.entries(incomeCategories).sort(([, a], [, b]) => b - a)

  if (transactions.length === 0 && accounts.length === 0) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyan-600" />
            <span>Financial Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Available</h3>
            <p className="text-gray-700 mb-4">
              Connect your accounts and transactions to generate detailed financial reports.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-cyan-600" />
          <span>Financial Reports</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-sm text-gray-700">Total Income</p>
            <p className="text-xl font-bold text-green-600">${totalIncome}</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <TrendingDown className="w-8 h-8 text-red-600 mb-2" />
            <p className="text-sm text-gray-700">Total Expenses</p>
            <p className="text-xl font-bold text-red-600">${totalExpenses}</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <DollarSign className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-sm text-gray-700">Net Flow</p>
            <p className={`text-xl font-bold ${Number(netFlow) >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${netFlow}
            </p>
          </div>
        </div>

        {/* Top Expense Categories */}
        {sortedExpenseCategories.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Expense Categories</h3>
            <div className="space-y-2">
              {sortedExpenseCategories.slice(0, 3).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center text-gray-700">
                  <span>{category}</span>
                  <span className="font-medium text-red-600">-${amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Income Categories */}
        {sortedIncomeCategories.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Income Categories</h3>
            <div className="space-y-2">
              {sortedIncomeCategories.slice(0, 3).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center text-gray-700">
                  <span>{category}</span>
                  <span className="font-medium text-green-600">+${amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Balances */}
        {Object.keys(accountBalances).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Balances</h3>
            <div className="space-y-2">
              {Object.entries(accountBalances).map(([accountName, balance]) => (
                <div key={accountName} className="flex justify-between items-center text-gray-700">
                  <span className="flex items-center space-x-2">
                    {accounts.find((acc) => acc.name === accountName)?.class.type === "credit-card" ? (
                      <CreditCard className="w-4 h-4 text-purple-600" />
                    ) : (
                      <Banknote className="w-4 h-4 text-green-600" />
                    )}
                    <span>{accountName}</span>
                  </span>
                  <span className={`font-medium ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ${balance.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* <div className="text-center">
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent">
            Generate Full Report
          </Button>
        </div> */}
      </CardContent>
    </Card>
  )
}
