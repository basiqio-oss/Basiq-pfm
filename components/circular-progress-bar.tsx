"use client"
import { motion } from "framer-motion"

interface CircularProgressBarProps {
  value: number // 0-100
  color: "green" | "red" | "blue" | "gray"
  status: string
  title: string
}

const getColorClass = (color: string) => {
  switch (color) {
    case "green":
      return "text-green-600"
    case "red":
      return "text-red-600"
    case "blue":
      return "text-blue-600"
    case "gray":
      return "text-gray-600"
    default:
      return "text-gray-600"
  }
}

const getStrokeColor = (color: string) => {
  switch (color) {
    case "green":
      return "#16A34A"
    case "red":
      return "#DC2626"
    case "blue":
      return "#2563EB"
    case "gray":
      return "#6B7280"
    default:
      return "#6B7280"
  }
}

export function CircularProgressBar({ value, color, status, title }: CircularProgressBarProps) {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
        <circle
          className="text-gray-300" // Lighter background circle
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="80"
          cy="80"
        />
        <motion.circle
          className={getColorClass(color)}
          strokeWidth="10"
          strokeLinecap="round"
          stroke={getStrokeColor(color)}
          fill="transparent"
          r={radius}
          cx="80"
          cy="80"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference,
          }}
          animate={{ strokeDashoffset: strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${getColorClass(color)}`}>{Math.round(value)}%</span>
        <span className="text-sm text-gray-500 mt-1">{status}</span>
        <span className="text-md font-semibold text-gray-900 text-center mt-1">{title}</span>
      </div>
    </div>
  )
}
