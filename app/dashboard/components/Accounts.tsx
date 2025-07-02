"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Banknote, CreditCard, Landmark, Wallet, ChevronRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Account {
  id: string
  name: string
  balance: string
  accountNo: string
  accountNumber?: string
  class: {
    type: string // e.g., "transaction", "credit-card", "loan", "term-deposit"
    product: string
  }
  currency?: string // Added currency to Account interface
}

interface AccountsProps {
  accounts: Account[]
}

const getAccountIcon = (accountType: string) => {
  switch (accountType) {
    case "transaction":
      return <Banknote className="w-5 h-5 text-green-600" />
    case "credit-card":
      return <CreditCard className="w-5 h-5 text-purple-600" />
    case "loan":
      return <Landmark className="w-5 h-5 text-red-600" />
    case "term-deposit":
      return <Wallet className="w-5 h-5 text-blue-600" />
    default:
      return <Banknote className="w-5 h-5 text-gray-600" />
  }
}

const getAccountTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "transaction":
      return "bg-green-100 text-green-800"
    case "credit-card":
      return "bg-purple-100 text-purple-800"
    case "loan":
      return "bg-red-100 text-red-800"
    case "term-deposit":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function Accounts({ accounts }: AccountsProps) {
  const router = useRouter()

  const handleAccountClick = (accountId: string) => {
    router.push(`/dashboard/account/${accountId}`)
  }

  if (!accounts || accounts.length === 0) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center space-x-2">
            <Banknote className="w-5 h-5 text-green-600" />
            <span>Your Accounts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Banknote className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Accounts Connected</h3>
            <p className="text-gray-700 mb-4">Connect your bank accounts to see your financial overview here.</p>
            <p className="text-sm text-gray-500">Click "Connect Bank" on the home page to get started.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center space-x-2">
          <Banknote className="w-5 h-5 text-green-600" />
          <span>Your Accounts ({accounts.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4, scale: 1.01 }}
              onClick={() => handleAccountClick(account.id)}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-green-300 cursor-pointer group"
            >
              <div className="flex items-center space-x-4">
                <motion.div whileHover={{ scale: 1.1 }} className="p-3 rounded-full bg-green-100 text-green-600">
                  {getAccountIcon(account.class.type)}
                </motion.div>
                <div>
                  <p className="font-semibold text-gray-900">{account.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getAccountTypeColor(account.class.type)}>
                      {account.class.type.replace("-", " ")}
                    </Badge>
                    <span className="text-sm text-gray-500">{account.accountNo}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(Number.parseFloat(account.balance), account.currency || "AUD")}
                  </p>
                  <p className="text-xs text-gray-500">{account.class.product}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
