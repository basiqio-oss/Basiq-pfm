"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, AlertCircle, CheckCircle, XCircle, Key, ExternalLink } from "lucide-react"

// Import the new onboarding steps
import StepOne from "@/components/onboarding/step-one"
import StepTwo from "@/components/onboarding/step-two"
import StepThree from "@/components/onboarding/step-three"

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
  })
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState("")
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [showApiKeyHelp, setShowApiKeyHelp] = useState(false)

  const totalSteps = 3
  const progressPercentage = (currentStep / totalSteps) * 100

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1)
    setError("")
    setDebugInfo("")
  }

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1)
    setError("")
    setDebugInfo("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleUserCreation = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setDebugInfo("")

    try {
      console.log("Starting user creation process...")
      setDebugInfo("Creating user account...")

      const userResponse = await fetch("/api/basiq/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      })

      const userData = await userResponse.json()

      if (!userResponse.ok) {
        throw new Error(userData.error || "Failed to create user")
      }

      localStorage.setItem(
        "basiq_user",
        JSON.stringify({
          userId: userData.userId,
          email: formData.email,
          clientAccessToken: userData.clientAccessToken,
        }),
      )

      setDebugInfo("User account created successfully!")
      handleNextStep()
    } catch (error) {
      console.error("User creation error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during user creation")
      if (process.env.NODE_ENV === "development") {
        setDebugInfo(`Debug: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleConsentRedirect = async () => {
    setIsLoading(true)
    setError("")
    setDebugInfo("")

    try {
      setDebugInfo("Setting up bank connection...")
      const userData = localStorage.getItem("basiq_user")
      if (!userData) {
        throw new Error("User data not found. Please go back and create an account.")
      }
      const user = JSON.parse(userData)

      const consentResponse = await fetch("/api/basiq/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.userId,
          clientAccessToken: user.clientAccessToken,
        }),
      })

      const consentData = await consentResponse.json()

      if (!consentResponse.ok) {
        throw new Error(consentData.error || "Failed to create consent")
      }

      localStorage.setItem(
        "basiq_user",
        JSON.stringify({
          ...user,
          consentUrl: consentData.consentUrl,
        }),
      )

      setDebugInfo("Redirecting to bank connection...")
      window.location.href = consentData.consentUrl
    } catch (error) {
      console.error("Consent redirect error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during bank connection setup")
      if (process.env.NODE_ENV === "development") {
        setDebugInfo(`Debug: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const testConnection = async () => {
    setTestStatus("testing")
    setDebugInfo("Testing API connection...")

    try {
      const response = await fetch("/api/basiq/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scope: "CLIENT_ACCESS" }),
      })

      const data = await response.json()

      if (response.ok && (data.token || data.access_token)) {
        setDebugInfo("✅ API connection successful! Token received.")
        setTestStatus("success")
        setShowApiKeyHelp(false)
      } else {
        setDebugInfo(`❌ API connection failed: ${data.error}`)
        setTestStatus("error")

        if (data.error && (data.error.includes("authorization") || data.error.includes("Invalid authorization"))) {
          setShowApiKeyHelp(true)
        }
      }
    } catch (error) {
      setDebugInfo(`❌ API connection error: ${error}`)
      setTestStatus("error")
    }
  }

  const getTestStatusIcon = () => {
    switch (testStatus) {
      case "testing":
        return <Loader2 className="w-4 h-4 animate-spin" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Step Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 h-1.5 bg-purple-500 z-[9998]"
        initial={{ width: "0%" }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />

      {/* API Call Loading Bar */}
      {isLoading && (
        <motion.div
          className="fixed top-0 left-0 h-1.5 bg-red-500 z-[9999]"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      )}

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <StepOne
            key="step-one"
            onNext={handleNextStep}
            testConnection={testConnection}
            testStatus={testStatus}
            debugInfo={debugInfo}
            getTestStatusIcon={getTestStatusIcon}
            showApiKeyHelp={showApiKeyHelp}
            setShowApiKeyHelp={setShowApiKeyHelp}
          />
        )}
        {currentStep === 2 && (
          <StepTwo
            key="step-two"
            formData={formData}
            handleInputChange={handleInputChange}
            handleUserCreation={handleUserCreation}
            isLoading={isLoading}
            error={error}
            onBack={handlePrevStep}
          />
        )}
        {currentStep === 3 && (
          <StepThree
            key="step-three"
            handleConsentRedirect={handleConsentRedirect}
            isLoading={isLoading}
            onBack={handlePrevStep}
          />
        )}
      </AnimatePresence>

      {/* API Key Help Section - Fixed positioning to avoid overlap */}
      {showApiKeyHelp && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-50"
        >
          <div className="glass-card border-orange-300 rounded-xl p-6 shadow-lg">
            <h4 className="text-orange-600 font-semibold flex items-center mb-3">
              <Key className="w-5 h-5 mr-2" />
              API Key Setup Required
            </h4>
            <div className="text-left space-y-3 text-sm">
              <p className="text-gray-700">
                Your Basiq API key needs to be configured. The API key should be used directly (not base64 encoded).
              </p>
              <div className="space-y-2">
                <h5 className="text-gray-900 font-semibold">1. Get Your API Key</h5>
                <p className="text-gray-700">
                  Visit the{" "}
                  <a
                    href="https://dashboard.basiq.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-500 underline inline-flex items-center"
                  >
                    Basiq Dashboard
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>{" "}
                  and copy your API key from the Applications section.
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="text-gray-900 font-semibold">2. Set Environment Variable</h5>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <code className="text-green-700 text-xs">BASIQ_API_KEY=your_actual_api_key_here</code>
                </div>
                <p className="text-gray-700 text-xs">⚠️ Use the API key directly - do not base64 encode it!</p>
              </div>
              <div className="space-y-2">
                <h5 className="text-gray-900 font-semibold">3. Restart Your Application</h5>
                <p className="text-gray-700">
                  After setting the environment variable, restart your development server.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowApiKeyHelp(false)}
              className="mt-6 w-full border border-orange-500 text-orange-600 hover:bg-orange-100 py-2 rounded-lg transition-colors"
            >
              Got it, thanks!
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
