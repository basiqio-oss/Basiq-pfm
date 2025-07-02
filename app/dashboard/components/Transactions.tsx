"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingCart,
  Car,
  Home,
  Coffee,
  Search,
  MapPin,
  Clock,
  Building,
  CalendarDays,
  Banknote,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useMemo } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { useRouter } from "next/navigation"

interface Transaction {
  id: string
  description: string
  amount: string
  postDate: string
  transactionDate?: string
  category?: string // This is a simplified category, actual Basiq data is in enrich.category
  merchant?: string
  type?: "debit" | "credit"
  status?: string
  class?: {
    // Basiq's top-level class
    title: string
    code: string
  }
  subClass?: {
    title: string
    code: string
  }
  enrich?: {
    cleanDescription?: string
    tags?: string[]
    merchant?: {
      id?: string
      businessName?: string
      website?: string
      abn?: string
      logoMaster?: string
      logoThumb?: string
      phoneNumber?: {
        // Updated: phoneNumber is an object
        local?: string
        international?: string
      }
    }
    location?: {
      routeNo?: string
      route?: string
      postalCode?: string
      suburb?: string
      state?: string
      country?: string
      formattedAddress?: string
      geometry?: {
        lat?: string
        lng?: string
      }
    }
    category?: {
      // Basiq's enriched category
      matchType?: string
      matchScore?: string
      mcc?: string | null
      anzsic?: {
        division?: {
          code?: string
          title?: string
        }
        subdivision?: {
          code?: string
          title?: string
        }
        group?: {
          code?: string
          title?: string
        }
        class?: {
          code?: string
          title?: string
        }
        subclass?: {
          // Note: Basiq uses 'subclass' not 'subClass' here
          code?: string
          title?: string
        }
      }
    }
  }
}

interface TransactionsProps {
  transactions: Transaction[]
}

const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case "shopping":
    case "retail trade": // For "Retail Trade" division
    case "supermarket and grocery stores": // For "Supermarket and Grocery Stores" group/class
      return <ShoppingCart className="w-4 h-4" />
    case "transport":
    case "automotive":
    case "ride share":
      return <Car className="w-4 h-4" />
    case "home":
    case "utilities":
    case "loan repayment":
      return <Home className="w-4 h-4" />
    case "food":
    case "dining":
    case "groceries":
      return <Coffee className="w-4 h-4" />
    case "transfer":
    case "credit card payment":
      return <Banknote className="w-4 h-4" /> // Using Banknote for transfers/payments
    default:
      return <ShoppingCart className="w-4 h-4" />
  }
}

const getCategoryColor = (category: string) => {
  switch (category?.toLowerCase()) {
    case "shopping":
    case "retail trade":
    case "supermarket and grocery stores":
      return "bg-purple-100 text-purple-600 border-purple-300"
    case "transport":
    case "automotive":
    case "ride share":
      return "bg-blue-100 text-blue-600 border-blue-300"
    case "home":
    case "utilities":
    case "loan repayment":
      return "bg-orange-100 text-orange-600 border-orange-300"
    case "food":
    case "dining":
    case "groceries":
      return "bg-green-100 text-green-600 border-green-300"
    case "income":
      return "bg-emerald-100 text-emerald-600 border-emerald-300"
    case "transfer":
    case "credit card payment":
      return "bg-indigo-100 text-indigo-600 border-indigo-300"
    default:
      return "bg-gray-100 text-gray-600 border-gray-300"
  }
}

export default function Transactions({ transactions }: TransactionsProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [visibleCount, setVisibleCount] = useState(5) // State for visible transactions

  // Handle case where transactions might not be an array
  const transactionList = useMemo(() => (Array.isArray(transactions) ? transactions : []), [transactions])

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>()
    transactionList.forEach((t) => {
      // Prioritize enriched categories (subclass, then class, then group, then subdivision, then division)
      if (t.enrich?.category?.anzsic?.subclass?.title) uniqueCategories.add(t.enrich.category.anzsic.subclass.title)
      else if (t.enrich?.category?.anzsic?.class?.title) uniqueCategories.add(t.enrich.category.anzsic.class.title)
      else if (t.enrich?.category?.anzsic?.group?.title) uniqueCategories.add(t.enrich.category.anzsic.group.title)
      else if (t.enrich?.category?.anzsic?.subdivision?.title)
        uniqueCategories.add(t.enrich.category.anzsic.subdivision.title)
      else if (t.enrich?.category?.anzsic?.division?.title)
        uniqueCategories.add(t.enrich.category.anzsic.division.title)
      // Fallback to top-level class/subClass if no enriched category
      else if (t.class?.title) uniqueCategories.add(t.class.title)
      else if (t.subClass?.title) uniqueCategories.add(t.subClass.title)
    })
    return [...uniqueCategories].filter(Boolean).sort()
  }, [transactionList])

  const fullyFilteredTransactions = useMemo(() => {
    return transactionList
      .filter(
        (t) =>
          t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.enrich?.merchant?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .filter((t) => {
        if (!selectedCategory) return true
        const transactionCategory =
          t.enrich?.category?.anzsic?.subclass?.title ||
          t.enrich?.category?.anzsic?.class?.title ||
          t.enrich?.category?.anzsic?.group?.title ||
          t.enrich?.category?.anzsic?.subdivision?.title ||
          t.enrich?.category?.anzsic?.division?.title ||
          t.class?.title ||
          t.subClass?.title
        return transactionCategory === selectedCategory
      })
      .filter((t) => {
        if (!dateRange.from && !dateRange.to) return true
        const transactionDate = new Date(t.postDate || t.transactionDate || "")
        if (dateRange.from && transactionDate < dateRange.from) return false
        if (dateRange.to && transactionDate > dateRange.to) return false
        return true
      })
  }, [transactionList, searchTerm, selectedCategory, dateRange])

  const visibleTransactions = useMemo(() => {
    return fullyFilteredTransactions.slice(0, visibleCount)
  }, [fullyFilteredTransactions, visibleCount])

  // Determine transaction type based on amount
  const getTransactionType = (amount: string): "debit" | "credit" => {
    return Number.parseFloat(amount) < 0 ? "debit" : "credit"
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const formatAmount = (amount: string) => {
    const numAmount = Number.parseFloat(amount)
    return Math.abs(numAmount).toFixed(2)
  }

  const handleTransactionClick = (transactionId: string) => {
    router.push(`/dashboard/transaction/${transactionId}`)
  }

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 5)
  }

  if (transactionList.length === 0) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center space-x-2">
            <ArrowUpRight className="w-5 h-5 text-red-600" />
            <span>Recent Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <ArrowUpRight className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions Yet</h3>
            <p className="text-gray-700 mb-4">
              Your transactions will appear here once your bank account sync is complete.
            </p>
            <p className="text-sm text-gray-500">This may take a few minutes after connecting your account.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900 flex items-center space-x-2">
            <ArrowUpRight className="w-5 h-5 text-red-600" />
            <span>Recent Transactions ({transactionList.length})</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 w-40"
              />
            </div>
          </div>
        </div>

{/* Category Dropdown */}
{categories.length > 0 && (
  <div className="mt-4">
    <label htmlFor="categoryFilter" className="text-sm font-medium text-gray-700 mr-2">
      Filter by Category:
    </label>
    <select
      id="categoryFilter"
      value={selectedCategory || ""}
      onChange={(e) => setSelectedCategory(e.target.value || null)}
      className="w-full border border-gray-300 text-gray-900 text-sm rounded-md p-2 bg-white shadow-sm focus:ring-red-500 focus:border-red-500"

    >
      <option value="">All Categories</option>
      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  </div>
)}

      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-700">No transactions found for the selected filters.</div>
          ) : (
            visibleTransactions.map((transaction, index) => {
              const transactionType = getTransactionType(transaction.amount)
              // Prioritize enriched categories (subclass, then class, then group, then subdivision, then division)
              const category =
                transaction.enrich?.category?.anzsic?.subclass?.title ||
                transaction.enrich?.category?.anzsic?.class?.title ||
                transaction.enrich?.category?.anzsic?.group?.title ||
                transaction.enrich?.category?.anzsic?.subdivision?.title ||
                transaction.enrich?.category?.anzsic?.division?.title ||
                transaction.class?.title ||
                transaction.subClass?.title ||
                "Uncategorized"

              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4, scale: 1.01 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-red-300 cursor-pointer"
                  onClick={() => handleTransactionClick(transaction.id)}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`p-3 rounded-full ${
                        transactionType === "debit" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                      }`}
                    >
                      {transactionType === "debit" ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </motion.div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">
                          {transaction.enrich?.merchant?.businessName || transaction.description}
                        </p>
                        <p
                          className={`text-lg font-bold ${transactionType === "debit" ? "text-red-600" : "text-green-600"}`}
                        >
                          {transactionType === "debit" ? "-" : "+"}${formatAmount(transaction.amount)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                        <span className="text-sm text-gray-700 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(transaction.postDate || transaction.transactionDate || "")}
                        </span>

                        {category && (
                          <Badge className={`text-xs border ${getCategoryColor(category)}`}>
                            <div className="flex items-center space-x-1">
                              {getCategoryIcon(category)}
                              <span>{category}</span>
                            </div>
                          </Badge>
                        )}

                        {transaction.status && (
                          <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-600">
                            {transaction.status}
                          </Badge>
                        )}
                      </div>

                      {/* Enrichment Data */}
                      {transaction.enrich && (
                        <div className="mt-2 space-y-1">
                          {/* Location Information */}
                          {transaction.enrich.location && (
                            <div className="flex items-center space-x-2 text-xs text-gray-700">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {transaction.enrich.location.formattedAddress ||
                                  `${transaction.enrich.location.suburb || ""} ${transaction.enrich.location.state || ""} ${transaction.enrich.location.postalCode || ""}`.trim()}
                              </span>
                              {transaction.enrich.location.geometry?.lat &&
                                transaction.enrich.location.geometry?.lng && (
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${transaction.enrich.location.geometry.lat},${transaction.enrich.location.geometry.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-500 underline"
                                  >
                                    View Map
                                  </a>
                                )}
                            </div>
                          )}

                          {/* Merchant Information */}
                          {transaction.enrich.merchant && (
                            <div className="flex items-center space-x-2 text-xs text-gray-700">
                              <Building className="w-3 h-3" />
                              <div className="flex items-center space-x-2">
                                {transaction.enrich.merchant.website && (
                                  <a
                                    href={transaction.enrich.merchant.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-500 underline"
                                  >
                                    Website
                                  </a>
                                )}
                                {/* Fixed: Access local or international property of phoneNumber object */}
                                {transaction.enrich.merchant.phoneNumber &&
                                  (transaction.enrich.merchant.phoneNumber.local ||
                                    transaction.enrich.merchant.phoneNumber.international) && (
                                    <span>
                                      📞{" "}
                                      {transaction.enrich.merchant.phoneNumber.local ||
                                        transaction.enrich.merchant.phoneNumber.international}
                                    </span>
                                  )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Original description if different from merchant name */}
                      {transaction.enrich?.merchant?.businessName &&
                        transaction.enrich.merchant.businessName !== transaction.description && (
                          <p className="text-xs text-gray-500">Original: {transaction.description}</p>
                        )}
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>

        {visibleCount < fullyFilteredTransactions.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <Button
              onClick={handleShowMore}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
            >
              Show More
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
