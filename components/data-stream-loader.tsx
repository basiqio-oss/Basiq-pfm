"use client"

import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2, Database } from "lucide-react"

interface DataStreamLoaderProps {
  value: number // 0-100
  status: "loading" | "polling" | "success" | "error" | "idle"
  title: string
  message: string
}

const getStatusColor = (status: DataStreamLoaderProps["status"]) => {
  switch (status) {
    case "success":
      return "text-green-600"
    case "error":
      return "text-red-600"
    case "polling":
    case "loading":
      return "text-blue-600"
    default:
      return "text-gray-600"
  }
}

const getAccentColor = (status: DataStreamLoaderProps["status"]) => {
  switch (status) {
    case "success":
      return "bg-green-500"
    case "error":
      return "bg-red-500"
    case "polling":
    case "loading":
      return "bg-blue-500"
    default:
      return "bg-gray-500"
  }
}

const getIcon = (status: DataStreamLoaderProps["status"]) => {
  switch (status) {
    case "success":
      return <CheckCircle className="w-12 h-12" />
    case "error":
      return <XCircle className="w-12 h-12" />
    case "polling":
    case "loading":
      return <Loader2 className="w-12 h-12 animate-spin" />
    default:
      return <Database className="w-12 h-12" />
  }
}

export function DataStreamLoader({ value, status, title, message }: DataStreamLoaderProps) {
  const streamVariants = {
    initial: { x: "-100%", opacity: 0.2 },
    animate: {
      x: "100%",
      opacity: 0.8,
      transition: {
        x: { repeat: Number.POSITIVE_INFINITY, duration: 3, ease: "linear" },
        opacity: { repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut", repeatType: "reverse" },
      },
    },
    success: { x: 0, opacity: 1, transition: { duration: 0.5 } },
    error: { x: 0, opacity: 1, transition: { duration: 0.5 } },
  }

  const particleVariants = {
    initial: { y: "0%", opacity: 0 },
    animate: {
      y: "100%",
      opacity: 1,
      transition: {
        y: { repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "linear" },
        opacity: { repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "easeOut", repeatType: "reverse" },
      },
    },
    success: { y: 0, opacity: 0, transition: { duration: 0.5 } },
    error: { y: 0, opacity: 0, transition: { duration: 0.5 } },
  }

  const containerState = status === "success" || status === "error" ? status : "animate"

  return (
    <div className="relative w-full max-w-lg h-64 bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200">
      {/* Animated Background Streams */}
      <motion.div
        className="absolute inset-0 flex flex-col justify-around opacity-30"
        variants={streamVariants}
        initial="initial"
        animate={containerState}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`stream-${i}`}
            className={`h-1 ${getAccentColor(status)} rounded-full`}
            style={{ width: `${50 + i * 10}%`, transform: `translateX(${i % 2 === 0 ? "0%" : "-100%"})` }}
            animate={{ x: i % 2 === 0 ? "100%" : "0%" }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 5 + i * 0.5, ease: "linear", delay: i * 0.3 }}
          />
        ))}
      </motion.div>

      {/* Animated Particles */}
      <motion.div className="absolute inset-0" variants={particleVariants} initial="initial" animate={containerState}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className={`absolute w-2 h-2 rounded-full ${getAccentColor(status)}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: `${Math.random() * 200 - 100}%`,
              x: `${Math.random() * 200 - 100}%`,
              opacity: [0, 1, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 3 + Math.random() * 2,
              ease: "easeInOut",
              delay: Math.random() * 3,
            }}
          />
        ))}
      </motion.div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 text-gray-900">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`${getStatusColor(status)} mb-4`}
        >
          {getIcon(status)}
        </motion.div>
        <motion.h2
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-2xl font-bold text-center mb-2"
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-gray-700 text-center text-sm max-w-xs"
        >
          {message}
        </motion.p>
        {status === "polling" || status === "loading" ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-2 ${getAccentColor(status)} rounded-full mt-4`}
            style={{ maxWidth: "80%" }}
          />
        ) : null}
      </div>
    </div>
  )
}
