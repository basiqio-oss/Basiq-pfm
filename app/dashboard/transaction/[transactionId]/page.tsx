"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Globe,
  Hash,
  HelpCircle,
  Home,
  MapPin,
  Phone,
  Tag,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ModernLoader } from "@/components/modern-loader"
import { formatCurrency } from "@/lib/utils"
import { TransactionMap } from "@/components/TransactionMap"
import Header from "@/app/dashboard/components/Header"
import Footer from "@/app/dashboard/components/Footer"
// Full type definition based on the Basiq API response
interface TransactionDetail {
  type: string
  id: string
  status: string
  description: string
  reference?: string
  amount: string
  currency: string
  account: string
  balance?: string
  direction: "debit" | "credit"
  class: string
  institution: string
  connection: string
  transactionDate?: string
  postDate: string
  subClass?: {
    code: number
    title: string
  }
  enrich?: {
    location?: {
      country?: string
      formattedAddress?: string
      geometry?: {
        lat?: string
        lng?: string
      }
      postalCode?: string
      route?: string
      routeNo?: string
      state?: string
      suburb?: string
    }
    cleanDescription?: string
    tags?: string[]
    merchant?: {
      id: string
      businessName: string
      ABN?: string
      logoMaster?: string
      logoThumb?: string
      phoneNumber?: {
        international?: string
        local?: string
      }
      website?: string
    }
    category?: {
      matchType?: string
      matchScore?: string
      mcc?: {
        code: string
        title: string
      }
      anzsic?: {
        division: { title: string; code: string }
        subdivision?: { title: string; code: string }
        group?: { title: string; code: string }
        class: { title: string; code: string }
        subclass?: { title: string; code: string }
      }
    }
  }
  links: {
    account: string
    institution: string
    self: string
  }
}

const DetailRow = ({
  icon,
  label,
  value,
  isLink = false,
}: {
  icon: React.ReactNode
  label: string
  value?: string | null
  isLink?: boolean
}) => {
  if (!value) return null
  return (
    <div className="flex items-start space-x-3">
      <div className="text-muted-foreground mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline break-all"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-foreground break-words">{value}</p>
        )}
      </div>
    </div>
  )
}

export default function TransactionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const transactionId = params.transactionId as string
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")

  const [transaction, setTransaction] = useState<TransactionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!transactionId) return

    async function fetchTransactionDetails() {
      setLoading(true)
      setError(null)
      try {
        const userData = localStorage.getItem("basiq_user")
        if (!userData) {
          throw new Error("User data not found. Please log in again.")
        }
        const user = JSON.parse(userData)
        const userId = user.userId
        const email = user?.email || ""
        const username = email.split("@")[0]

        // Save email and username to state
        setEmail(email)
        setUsername(username)

        if (!userId) {
          throw new Error("User ID not found in local storage.")
        }

        const response = await fetch(`/api/basiq/transactions/${transactionId}?userId=${userId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch transaction details.")
        }
        setTransaction(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.")
      } finally {
        setLoading(false)
      }
    }

    fetchTransactionDetails()
  }, [transactionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="p-4 md:p-8">
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <ModernLoader
            size="lg"
            text="Loading transaction details..."
            subtext="Fetching enriched transaction data from Basiq"
          />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <Button variant="outline" onClick={() => router.push("/dashboard")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <Alert variant="destructive">
          <HelpCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <Button variant="outline" onClick={() => router.push("/dashboard")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <p>No transaction details found.</p>
      </div>
    )
  }

  const isDebit = transaction.direction === "debit"
  const amountColor = isDebit ? "text-red-600" : "text-green-600"
  const AmountIcon = isDebit ? TrendingDown : TrendingUp


  return (
    <div className="bg-gray-50 min-h-screen">
      <Header
        user={{
          name: username,
          email: email,
          connectionStatus: "connected"
        }}
      />
      <main className="p-4 md:p-8 max-w-7xl mx-auto flex-grow">
        <Button variant="outline" onClick={() => router.push("/dashboard")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      {transaction.enrich?.merchant?.businessName || transaction.description}
                    </CardTitle>
                    <CardDescription>{transaction.enrich?.cleanDescription || "Transaction Details"}</CardDescription>
                  </div>
                  <Badge variant={isDebit ? "destructive" : "default"}>{transaction.direction}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className={`text-4xl font-bold ${amountColor}`}>

                  {formatCurrency(transaction.amount, transaction.currency)}
                </div>
                <AmountIcon className={`h-12 w-12 ${amountColor}`} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enrichment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {transaction.enrich?.merchant && (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center">
                      <Building className="mr-2 h-4 w-4" /> Merchant
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6">
                      <DetailRow
                        icon={<User className="h-4 w-4" />}
                        label="Business Name"
                        value={transaction.enrich.merchant.businessName}
                      />
                      <DetailRow
                        icon={<Hash className="h-4 w-4" />}
                        label="ABN"
                        value={transaction.enrich.merchant.ABN}
                      />
                      <DetailRow
                        icon={<Phone className="h-4 w-4" />}
                        label="Phone"
                        value={
                          transaction.enrich.merchant.phoneNumber?.local ||
                          transaction.enrich.merchant.phoneNumber?.international
                        }
                      />
                      <DetailRow
                        icon={<Globe className="h-4 w-4" />}
                        label="Website"
                        value={transaction.enrich.merchant.website}
                        isLink
                      />
                    </div>
                  </div>
                )}

                {transaction.enrich?.location && (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center">
                      <MapPin className="mr-2 h-4 w-4" /> Location
                    </h3>
                    <div className="space-y-2 pl-6">
                      <DetailRow
                        icon={<Home className="h-4 w-4" />}
                        label="Address"
                        value={transaction.enrich.location.formattedAddress}
                      />
                      {transaction.enrich?.location?.geometry?.lat &&
                        transaction.enrich?.location?.geometry?.lng && (
                          <TransactionMap
                            lat={parseFloat(transaction.enrich.location.geometry.lat)}
                            lng={parseFloat(transaction.enrich.location.geometry.lng)}
                            label={transaction.enrich?.merchant?.businessName || "Transaction Location"}
                          />
                        )}
                    </div>
                  </div>
                )}

                {transaction.enrich?.category?.anzsic && (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center">
                      <Tag className="mr-2 h-4 w-4" /> Category
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6">
                      <DetailRow
                        label="Division"
                        icon={<div className="w-4" />}
                        value={`${transaction.enrich.category.anzsic.division.title} (${transaction.enrich.category.anzsic.division.code})`}
                      />
                      <DetailRow
                        label="Subdivision"
                        icon={<div className="w-4" />}
                        value={
                          transaction.enrich.category.anzsic.subdivision &&
                          `${transaction.enrich.category.anzsic.subdivision.title} (${transaction.enrich.category.anzsic.subdivision.code})`
                        }
                      />
                      <DetailRow
                        label="Group"
                        icon={<div className="w-4" />}
                        value={
                          transaction.enrich.category.anzsic.group &&
                          `${transaction.enrich.category.anzsic.group.title} (${transaction.enrich.category.anzsic.group.code})`
                        }
                      />
                      <DetailRow
                        label="Class"
                        icon={<div className="w-4" />}
                        value={`${transaction.enrich.category.anzsic.class.title} (${transaction.enrich.category.anzsic.class.code})`}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailRow icon={<Hash className="h-4 w-4" />} label="Transaction ID" value={transaction.id} />
                <DetailRow icon={<CreditCard className="h-4 w-4" />} label="Account ID" value={transaction.account} />
                <DetailRow
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Balance After"
                  value={transaction.balance ? formatCurrency(transaction.balance, transaction.currency) : "N/A"}
                />
                <DetailRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Posted Date"
                  value={new Date(transaction.postDate).toLocaleString()}
                />
                <DetailRow
                  icon={<Clock className="h-4 w-4" />}
                  label="Transaction Date"
                  value={transaction.transactionDate ? new Date(transaction.transactionDate).toLocaleString() : "N/A"}
                />
                <div className="flex items-start space-x-3">
                  <div className="text-muted-foreground mt-1">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant="outline">{transaction.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
