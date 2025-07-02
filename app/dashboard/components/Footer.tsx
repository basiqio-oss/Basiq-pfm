"use client"

import { motion } from "framer-motion"

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"
        >
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">B</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Basiq Personal Finance Management Demo</p>
              <p className="text-xs text-gray-600">Powered by Basiq API</p>
            </div>
          </div>

          {/* Links and Info */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <a
              href="https://basiq.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              About Basiq
            </a>
            <a
              href="https://api.basiq.io/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              API Documentation
            </a>
            <span className="text-xs">© 2025 Basiq Demo</span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
