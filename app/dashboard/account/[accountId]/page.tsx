"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Calendar,
  DollarSign,
  Info,
  Percent,
  Shield,
  Banknote,
  AlertCircle,
  CheckCircle,
  TrendingUp,
} from "lucide-react"
import { ModernLoader } from "@/components/modern-loader"
import { formatCurrency } from "@/lib/utils"
import Header from "@/app/dashboard/components/Header"
import Footer from "@/app/dashboard/components/Footer"

interface AccountDetails {
  type: string
  id: string
  name: string
  displayName?: string
  depositRate?: string
  lendingRate?: string
  bsb?: string
  unmaskedAccNum?: string
  creationDate?: string
  accountHolder?: string
  maskedNumber?: string
  accountOwnership?: string
  isOwned?: boolean
  amortisedLimit?: string
  bundleName?: string
  purses?: Array<{
    amount: string
    currency: string
  }>
  accountNo?: string
  availableFunds?: string
  balance: string
  creditLimit?: string
  class: {
    type: string
    product: string
  }
  connection?: string
  currency: string
  institution: string
  lastUpdated: string
  status: string
  meta?: {
    fees?: Array<{
      name: string
      feeType: string
      amount: string
      currency?: string
      additionalInfo?: string
    }>
    depositRates?: Array<{
      depositRateType: string
      rate: string
      applicationFrequency?: string
      additionalInfo?: string
    }>
    lendingRates?: Array<{
      lendingRateType: string
      rate: string
      comparisonRate?: string
      repaymentType?: string
      loanPurpose?: string
      additionalInfo?: string
    }>
    loan?: {
      startDate?: string
      endDate?: string
      repaymentType?: string
      originalLoanAmount?: string
      originalLoanCurrency?: string
      minInstalmentAmount?: string
      nextInstalmentDate?: string
      repaymentFrequency?: string
      offsetAccountEnabled?: boolean
    }
    creditCard?: {
      minPaymentAmount?: string
      paymentDueAmount?: string
      paymentCurrency?: string
      paymentDueDate?: string
    }
    features?: Array<{
      featureType: string
      additionalValue?: string
      additionalInfo?: string
      isActivated?: boolean
    }>
    addresses?: Array<{
      addressType: string
      simple?: {
        mailingName?: string
        addressLine1?: string
        addressLine2?: string
        addressLine3?: string
        postcode?: string
        city?: string
        state?: string
        country?: string
      }
    }>
  }
  transactionIntervals?: Array<{
    from: string
    to: string
  }>
}

export default function AccountDetailsPage() {
  const [account, setAccount] = useState<AccountDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")

  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()
  const accountId = params.accountId as string

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const userData = localStorage.getItem("basiq_user")
        console.log(userData)
        if (!userData) {
          router.push("/")
          return
        }

        const user = JSON.parse(userData)
        const email = user?.email || ""
        const username = email.split("@")[0]

        // Save email and username to state
        setEmail(email)
        setUsername(username)

        const response = await fetch(`/api/basiq/accounts/${accountId}?userId=${user.userId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch account details")
        }

        const data = await response.json()
        setAccount(data)
      } catch (error) {
        console.error("Error fetching account details:", error)
        setError(error instanceof Error ? error.message : "Failed to load account details")
      } finally {
        setLoading(false)
      }
    }

    if (accountId) {
      fetchAccountDetails()
    }
  }, [accountId, router])

  const getAccountIcon = (accountType: string) => {
    switch (accountType.toLowerCase()) {
      case "transaction":
      case "checking":
        return <Banknote className="w-6 h-6 text-green-600" />
      case "credit-card":
      case "credit_card":
        return <CreditCard className="w-6 h-6 text-purple-600" />
      case "mortgage":
      case "loan":
        return <Building2 className="w-6 h-6 text-red-600" />
      case "savings":
      case "term-deposit":
        return <TrendingUp className="w-6 h-6 text-blue-600" />
      default:
        return <Banknote className="w-6 h-6 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <>
        <div className="container mx-auto px-6 py-8 flex justify-start">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="flex items-center space-x-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
        </div>

        <div className="min-h-screen bg-gray-50 flex flex-col">
          <div className="flex-grow flex items-center justify-center">
            <ModernLoader
              size="lg"
              text="Loading account details..."
              subtext="Fetching comprehensive account information from Basiq"
            />
          </div>
        </div>
      </>
    )
  }

  if (error || !account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-900 p-8">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
          <h1 className="text-2xl font-bold mb-4">Error Loading Account</h1>
          <p className="text-gray-700 mb-6">{error || "Account not found"}</p>
          <Button onClick={() => router.push("/dashboard")} className="bg-red-500 hover:bg-red-600">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

return (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <Header
      user={{
        name: username,
        email: email,
        connectionStatus: "connected",
      }}
    />

    <main className="p-4 md:p-8 max-w-7xl mx-auto flex-grow">
      {/* Back to Dashboard button below header */}
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Button>
      </div>

      {/* Account info block */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center space-x-3">
          {getAccountIcon(account.class.type)}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {account.displayName || account.name}
            </h1>
            <p className="text-gray-600">{account.class.product}</p>
          </div>
        </div>
        <Badge className={getStatusColor(account.status)}>{account.status}</Badge>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Account Information */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Balance Card */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Account Balance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm opacity-90">Current Balance</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(Number.parseFloat(account.balance), account.currency)}
                  </p>
                </div>
                {account.availableFunds && (
                  <div>
                    <p className="text-sm opacity-90">Available Funds</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(Number.parseFloat(account.availableFunds), account.currency)}
                    </p>
                  </div>
                )}
                {account.creditLimit && (
                  <div>
                    <p className="text-sm opacity-90">Credit Limit</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(Number.parseFloat(account.creditLimit), account.currency)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="w-5 h-5" />
                <span>Account Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Account Number</p>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                    {account.maskedNumber || account.accountNo || "Not available"}
                  </p>
                </div>
                {account.bsb && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">BSB</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">{account.bsb}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Account Type</p>
                  <p className="text-sm">{account.class.type.replace("-", " ").toUpperCase()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Currency</p>
                  <p className="text-sm">{account.currency}</p>
                </div>
                {account.accountHolder && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Account Holder</p>
                    <p className="text-sm">{account.accountHolder}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-sm">{new Date(account.lastUpdated).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Card Details */}
          {account.meta?.creditCard && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Credit Card Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {account.meta.creditCard.paymentDueAmount && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Payment Due</p>
                        <p className="text-lg font-semibold text-red-600">
                          {formatCurrency(
                            Number.parseFloat(account.meta.creditCard.paymentDueAmount),
                            account.meta.creditCard.paymentCurrency || account.currency,
                          )}
                        </p>
                      </div>
                    )}
                    {account.meta.creditCard.minPaymentAmount && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Minimum Payment</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(
                            Number.parseFloat(account.meta.creditCard.minPaymentAmount),
                            account.meta.creditCard.paymentCurrency || account.currency,
                          )}
                        </p>
                      </div>
                    )}
                    {account.meta.creditCard.paymentDueDate && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Due Date</p>
                        <p className="text-sm">
                          {new Date(account.meta.creditCard.paymentDueDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Loan Details */}
          {account.meta?.loan && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5" />
                    <span>Loan Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {account.meta.loan.startDate && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Start Date</p>
                        <p className="text-sm">{new Date(account.meta.loan.startDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {account.meta.loan.endDate && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">End Date</p>
                        <p className="text-sm">{new Date(account.meta.loan.endDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {account.meta.loan.repaymentType && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Repayment Type</p>
                        <p className="text-sm">{account.meta.loan.repaymentType.replace("_", " ")}</p>
                      </div>
                    )}
                    {account.meta.loan.originalLoanAmount && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Original Loan Amount</p>
                        <p className="text-sm">
                          {formatCurrency(
                            Number.parseFloat(account.meta.loan.originalLoanAmount),
                            account.meta.loan.originalLoanCurrency || account.currency,
                          )}
                        </p>
                      </div>
                    )}
                    {account.meta.loan.minInstalmentAmount && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Minimum Instalment</p>
                        <p className="text-sm">
                          {formatCurrency(Number.parseFloat(account.meta.loan.minInstalmentAmount), account.currency)}
                        </p>
                      </div>
                    )}
                    {account.meta.loan.nextInstalmentDate && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Next Instalment Date</p>
                        <p className="text-sm">{new Date(account.meta.loan.nextInstalmentDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Interest Rates */}
          {(account.meta?.depositRates || account.meta?.lendingRates) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Percent className="w-5 h-5" />
                  <span>Interest Rates</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {account.meta?.depositRates?.map((rate, index) => (
                  <div key={index} className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">{rate.depositRateType.replace("_", " ")}</p>
                    <p className="text-lg font-semibold text-green-600">
                      {(Number.parseFloat(rate.rate) * 100).toFixed(2)}%
                    </p>
                  </div>
                ))}
                {account.meta?.lendingRates?.map((rate, index) => (
                  <div key={index} className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">{rate.lendingRateType.replace("_", " ")}</p>
                    <p className="text-lg font-semibold text-red-600">
                      {(Number.parseFloat(rate.rate) * 100).toFixed(2)}%
                    </p>
                    {rate.comparisonRate && (
                      <p className="text-sm text-gray-600">
                        Comparison: {(Number.parseFloat(rate.comparisonRate) * 100).toFixed(2)}%
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Features */}
          {account.meta?.features && account.meta.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {account.meta.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{feature.featureType.replace("_", " ")}</p>
                        {feature.additionalInfo && <p className="text-xs text-gray-600">{feature.additionalInfo}</p>}
                      </div>
                      {feature.isActivated !== undefined &&
                        (feature.isActivated ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                        ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fees */}
          {account.meta?.fees && account.meta.fees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Fees</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {account.meta.fees.map((fee, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium">{fee.name}</p>
                        <p className="text-sm font-semibold">
                          {formatCurrency(Number.parseFloat(fee.amount), fee.currency || account.currency)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600">{fee.feeType.replace("_", " ")}</p>
                      {fee.additionalInfo && <p className="text-xs text-gray-500">{fee.additionalInfo}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transaction Intervals */}
          {account.transactionIntervals && account.transactionIntervals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Transaction Intervals</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {account.transactionIntervals.map((interval, idx) => (
                  <div key={idx} className="mb-2">
                    <p className="text-sm">
                      From: {new Date(interval.from).toLocaleString()}
                    </p>
                    <p className="text-sm">
                      To: {new Date(interval.to).toLocaleString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </main>

    <Footer />
  </div>
)
}
