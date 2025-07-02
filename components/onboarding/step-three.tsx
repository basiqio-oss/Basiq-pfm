"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Loader2,
  Lock,
  CheckCircle,
  ExternalLink,
  Shield,
  Sparkles
} from "lucide-react"

interface StepThreeProps {
  handleConsentRedirect: () => void
  isLoading: boolean
  onBack: () => void
}

export default function StepThree({
  handleConsentRedirect,
  isLoading,
  onBack
}: StepThreeProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background: Particles + Grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={`particle particle-${(i % 3) + 1}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`
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
            backgroundSize: "50px 50px"
          }}
        />
      </div>

      {/* Card Content */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8"
      >
        <Card className="w-full max-w-md glass-card border-purple-200 relative overflow-hidden shadow-lg">
          <div className="absolute top-4 right-4">
            <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
          </div>

          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-full w-fit">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Data Sharing Consent
            </CardTitle>
            <p className="text-gray-700 text-sm mt-1">
              Before connecting, please review how your data will be used.
            </p>
          </CardHeader>

          <CardContent>
            <div className="space-y-4 text-gray-700 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span>
                  We use Basiq to securely connect to your bank and retrieve
                  your financial data (transactions, accounts, balances).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span>
                  Your data is used to provide personalized insights, spending
                  analysis, and budget tracking in Future PFM.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span>
                  We never store your raw financial data. Only anonymized,
                  aggregated insights are processed.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  All data is encrypted during transmission. You can revoke
                  access anytime via your bank or Basiq.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="hidden sm:flex flex-1 border-purple-400 text-purple-600 hover:bg-purple-100"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleConsentRedirect}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white neon-glow flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    Proceed to Bank Connection
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
