"use client"

import { useMemo } from "react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface Transaction {
  id: string
  description: string
  amount: string
  postDate: string
  class?: string
  subClass?: { title: string; code: string }
  enrich?: {
    category?: {
      anzsic?: {
        division?: { code?: string; title?: string }
        subdivision?: { code?: string; title?: string }
        group?: { code?: string; title?: string }
        class?: { code?: string; title?: string }
        subclass?: { title?: string; code?: string }
      }
    }
  }
}

interface CategorySpendingProps {
  transactions: Transaction[]
}

const COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
]

export default function CategorySpending({ transactions }: CategorySpendingProps) {

  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {}

    const expenses = transactions.filter(
      (t) =>
        parseFloat(t.amount) < 0 &&
        t.class?.toLowerCase() === "payment"
    )

    expenses.forEach((tx) => {
      const category =
        tx.enrich?.category?.anzsic?.subclass?.title ||
        tx.enrich?.category?.anzsic?.class?.title ||
        tx.enrich?.category?.anzsic?.group?.title ||
        tx.enrich?.category?.anzsic?.subdivision?.title ||
        tx.enrich?.category?.anzsic?.division?.title ||
        tx.class ||
        tx.subClass?.title ||
        "Uncategorized"

      const amount = Math.abs(parseFloat(tx.amount))
      totals[category] = (totals[category] || 0) + amount
    })

    const sorted = Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    const top = sorted.slice(0, 8)
    const other = sorted.slice(8).reduce((sum, c) => sum + c.value, 0)
    if (other > 0) top.push({ name: "Other", value: other })

    return top
  }, [transactions])


  const totalSpending = categoryData.reduce((sum, c) => sum + c.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const { name, value } = payload[0].payload
      const percentage = ((value / totalSpending) * 100).toFixed(1)
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(value, "AUD")} ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No spending data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">
          {/* Chart Section */}
          <div className="relative w-full h-64 flex items-center justify-center">
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ fontSize: 12, fill: "#6B7280", userSelect: "none" }}
                    >
                      <tspan x="50%" dy={-6} fontWeight="normal">
                        Total Spent
                      </tspan>
                      <tspan
                        x="50%"
                        dy={18}
                        fontWeight="bold"
                        style={{ fontSize: 16, fill: "#111827" }}
                      >
                        {formatCurrency(totalSpending, "AUD")}
                      </tspan>
                    </text>
                  </Pie>
                  <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 max-h-64 overflow-y-auto ml-8">
            {categoryData.map((cat, index) => {
              const percent = ((cat.value / totalSpending) * 100).toFixed(1)
              return (
                <div
                  key={cat.name}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {cat.name}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(cat.value, "AUD")}
                    </p>
                    <p className="text-xs text-gray-500">{percent}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
