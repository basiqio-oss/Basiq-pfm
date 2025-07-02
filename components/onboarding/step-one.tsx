"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface StepOneProps {
  onNext: () => void
  testConnection: () => void
  testStatus: "idle" | "testing" | "success" | "error"
  debugInfo: string
  getTestStatusIcon: () => React.ReactNode
  showApiKeyHelp: boolean
  setShowApiKeyHelp: (show: boolean) => void
}

type Particle = {
  left: string
  top: string
  delay: string
  type: number
}

export default function StepOne({
  onNext,
  testConnection,
  testStatus,
  debugInfo,
  getTestStatusIcon,
}: StepOneProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const generated = Array.from({ length: 50 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      type: Math.floor(Math.random() * 3) + 1,
    }))
    setParticles(generated)
  }, [])

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8 text-pink-500" />,
      title: "Smart Analytics",
      description: "Transaction categorization and spending analysis.",
      gradient: "from-pink-50 to-pink-100",
      border: "border-pink-200",
      shadow: "hover:shadow-pink-100",
    },
    {
      icon: <Zap className="w-8 h-8 text-indigo-500" />,
      title: "Real-time Alerts",
      description: "Intelligent notifications for spending and budget limits.",
      gradient: "from-indigo-50 to-indigo-100",
      border: "border-indigo-200",
      shadow: "hover:shadow-indigo-100",
    },
    {
      icon: <Shield className="w-8 h-8 text-emerald-500" />,
      title: "Bank-grade Security",
      description: "Your data is protected with enterprise-level security.",
      gradient: "from-emerald-50 to-emerald-100",
      border: "border-emerald-200",
      shadow: "hover:shadow-emerald-100",
    },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-gray-800">
      {/* Animated Particles - client-only */}
      <div className="absolute inset-0 hidden sm:block">
        {particles.map((p, i) => (
          <div
            key={i}
            className={`particle particle-${p.type}`}
            style={{
              position: "absolute",
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center w-full max-w-5xl"
        >
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8 relative"
          >
            <Sparkles className="absolute -top-4 -left-4 w-8 h-8 text-yellow-500 animate-pulse" />
            <TrendingUp className="absolute -top-2 -right-6 w-6 h-6 text-green-600 animate-bounce" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-red-600">
              Basiq Personal Finance Management Demo
            </h1>
            <p className="mt-2 text-lg sm:text-xl bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 text-transparent bg-clip-text font-semibold">
              Your Financial Future, Simplified.
            </p>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-base sm:text-lg text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Transform your financial data into actionable insights with categorization, smart alerts, and comprehensive
            reporting. Experience the future of personal finance management, powered by Basiq API.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <Button
              size="lg"
              onClick={onNext}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-red-500/25 transition-all duration-300"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={testConnection}
              disabled={testStatus === "testing"}
              className="border-purple-400 text-purple-600 hover:bg-purple-100 px-8 py-4 text-lg"
            >
              {getTestStatusIcon()}
              <span className="ml-2">Test API Connection</span>
            </Button>
          </motion.div>

          {/* API Debug Info */}
          {debugInfo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 max-w-md mx-auto mb-8"
            >
              <Alert
                className={`glass-card ${
                  testStatus === "success"
                    ? "border-green-500"
                    : testStatus === "error"
                    ? "border-red-500"
                    : "border-blue-500"
                }`}
              >
                {getTestStatusIcon()}
                <AlertDescription className="text-gray-700">{debugInfo}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="interactive-card"
              >
                <div
                  className={`glass-card bg-gradient-to-br ${feature.gradient} border-2 ${feature.border} ${feature.shadow} rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 h-full`}
                >
                  <div className="mb-4 flex justify-center">
                    <div className="p-3 bg-white/70 rounded-full backdrop-blur-sm">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-700 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
