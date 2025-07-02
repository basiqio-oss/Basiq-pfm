import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Basiq Personal Finance Management Demo",
  description:
    "Transform your financial data into actionable insights with categorization, smart alerts, and comprehensive reporting. Experience the future of personal finance management, powered by Basiq API.",
  
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="https://files.readme.io/eaa8758971d202bfc5e089f15205de29a5f28e7bd602de82755d1dc8a62cbeca-basiq-cobrand-favicon-white.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
