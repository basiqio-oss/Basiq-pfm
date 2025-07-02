"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart as BarChartIcon } from "lucide-react"
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

interface Transaction {
  id: string
  description: string
  amount: string
  postDate: string
}

interface SpendingChartProps {
  transactions: Transaction[]
}

function generateChartData(transactions: Transaction[], monthsBack: number = 12) {
  const monthlySpending: { [key: string]: number } = {}
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1)

  transactions.forEach((t) => {
    const transactionDate = new Date(t.postDate)
    if (transactionDate < startDate) return

    const monthYear = transactionDate.toLocaleString("en-US", {
      month: "short",
      year: "2-digit",
    })
    const amount = Number.parseFloat(t.amount)

    if (amount < 0) {
      monthlySpending[monthYear] = (monthlySpending[monthYear] || 0) + Math.abs(amount)
    }
  })

  const chartData = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthYear = date.toLocaleString("en-US", { month: "short", year: "2-digit" })
    chartData.push({
      name: monthYear,
      spending: monthlySpending[monthYear]
        ? Number.parseFloat(monthlySpending[monthYear].toFixed(2))
        : 0,
    })
  }

  return chartData
}

export default function SpendingChart({ transactions }: SpendingChartProps) {
  // Change monthsBack here to show more or fewer months
  const monthsBack = 12
  const data = useMemo(() => generateChartData(transactions, monthsBack), [transactions, monthsBack])

  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center space-x-2">
            <BarChartIcon className="w-5 h-5 text-blue-600" />
            <span>Monthly Spending</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <BarChartIcon className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Spending Data</h3>
            <p className="text-gray-700 mb-4">
              Connect your accounts and transactions will appear here to visualize your
              spending.
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
          <BarChartIcon className="w-5 h-5 text-blue-600" />
          <span>Monthly Spending</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`h-[300px] transition-opacity duration-700 ease-in-out ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 30, right: 20, bottom: 40, left: 40 }} // more left margin for y-axis labels
            >
              <defs>
                <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                fontSize={13}
                tickLine={true}
                axisLine={true}
                className="text-gray-700"
                padding={{ left: 10, right: 10 }}
                interval={0} // show all months without skipping
                angle={-45} // rotate labels for better fit
                textAnchor="end"
                height={50} // increase height for rotated labels
              />
              <YAxis
                stroke="#6B7280"
                fontSize={13}
                tickLine={true}
                axisLine={true}
                tickCount={6}
                tickMargin={10}
                tickFormatter={(value) =>
                  `$${value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                }
                className="text-gray-700"
                domain={[0, "dataMax + 5000"]}
                padding={{ top: 20, bottom: 20 }}
                width={80}
              />
              <Tooltip
                cursor={{ stroke: "#8b5cf6", strokeWidth: 2, strokeDasharray: "3 3" }}
                contentStyle={{
                  backgroundColor: "white",
                  borderColor: "#E5E7EB",
                  borderRadius: "8px",
                  color: "#333",
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`,
                  "Spending",
                ]}
              />
              <Area
                type="monotone"
                dataKey="spending"
                stroke="#8b5cf6"
                strokeWidth={3}
                fill="url(#colorSpending)"
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
                dot={{ r: 6, fill: "#8b5cf6", stroke: "white", strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
