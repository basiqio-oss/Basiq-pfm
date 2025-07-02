"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, AlertCircle, Mail, Sparkles } from "lucide-react"

interface StepTwoProps {
  formData: { email: string }
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleUserCreation: (e: React.FormEvent) => void
  isLoading: boolean
  error: string
  onBack: () => void
}

export default function StepTwo({
  formData,
  handleInputChange,
  handleUserCreation,
  isLoading,
  error,
  onBack,
}: StepTwoProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Particles */}
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={`particle particle-${(i % 3) + 1}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8"
      >
        <Card className="w-full max-w-md glass-card border-purple-200 relative overflow-hidden shadow-lg">
          {/* Sparkles */}
          <div className="absolute top-4 right-4">
            <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
          </div>

          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-red-500 to-purple-600 rounded-full w-fit">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Connect Your Finances</CardTitle>
            <p className="text-gray-700 text-sm mt-1">
              Enter your email address to get started with Basiq PFM Demo.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleUserCreation} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your.email@example.com"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Error */}
              {error && (
                <Alert className="glass-card border-red-500">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1 border-purple-400 text-purple-600 hover:bg-purple-100 bg-transparent"
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white neon-glow flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </form>

            {/* Legal Text */}
            <div className="mt-6 p-4 glass-card border border-blue-300 rounded-lg">
              <p className="text-gray-700 text-sm">
                <Shield className="w-4 h-4 inline mr-2 text-blue-600" />
                By continuing, you agree to the Terms and Conditions and our Privacy Policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
