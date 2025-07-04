"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Handshake,
  UserPlus,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Copy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"

interface HeaderProps {
  user?: {
    name: string
    email: string
    connectionStatus?: string
  }
  isLoading?: boolean
}

export default function Header({ user }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [loadingConsent, setLoadingConsent] = useState(false)
  const [loadingUserDetails, setLoadingUserDetails] = useState(false)
  const [loadingAddAccount, setLoadingAddAccount] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("basiq_user")
    router.push("/")
  }

  const handleExportClientToken = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("basiq_user") || "{}")
      const token = storedUser.clientAccessToken

      if (!token) return alert("No client token found in localStorage")

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(token)
        alert("Client token copied to clipboard!")
      } else {
        alert("Clipboard API not supported.")
      }
    } catch (error) {
      alert("Failed to fetch or copy client token.")
      console.error(error)
    }
  }

  const handleViewUserDetails = async () => {
    try {
      setLoadingUserDetails(true)
      const storedUser = JSON.parse(localStorage.getItem("basiq_user") || "{}")
      const userId = storedUser.userId || user?.email

      if (!userId) return alert("User ID is missing")

      const res = await fetch(`/api/basiq/user?userId=${encodeURIComponent(userId)}`)
      if (!res.ok) {
        const err = await res.json()
        alert(`Failed to fetch user details: ${err.error || res.statusText}`)
        return
      }

      const userDetails = await res.json()
      console.log("User Details:", userDetails)
      router.push(`/user/${encodeURIComponent(userId)}`)
    } catch (e) {
      console.error(e)
      alert("Error fetching user details")
    } finally {
      setLoadingUserDetails(false)
    }
  }

  const handleConsentManagement = async () => {
    try {
      setLoadingConsent(true)
      const storedUser = JSON.parse(localStorage.getItem("basiq_user") || "{}")
      const userId = storedUser.userId || user?.email

      if (!userId) return alert("User ID is missing")

      const res = await fetch("/api/basiq/consent-manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert("Failed to get consent URL: " + err.error)
        return
      }

      const { consentUrl } = await res.json()
      if (consentUrl) {
        window.location.href = consentUrl
      } else {
        alert("Consent URL not received")
      }
    } catch (e) {
      console.error(e)
      alert("Error fetching consent URL")
    } finally {
      setLoadingConsent(false)
    }
  }

  const handleAddAnotherAccount = async () => {
    try {
      setLoadingAddAccount(true)
      const storedUser = JSON.parse(localStorage.getItem("basiq_user") || "{}")
      const userId = storedUser.userId || user?.email

      if (!userId) return alert("User ID is missing")

      const res = await fetch("/api/basiq/connect-more", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        alert(`Failed to get connect URL: ${errorData.error || res.statusText}`)
        return
      }

      const { connectUrl } = await res.json()
      if (connectUrl) {
        window.location.href = connectUrl
      } else {
        alert("Connect URL not received")
      }
    } catch (error) {
      console.error(error)
      alert("Error connecting another account")
    } finally {
      setLoadingAddAccount(false)
    }
  }

  return (
    <TooltipProvider>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Basiq Personal Finance Management Demo</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Smart financial insights powered by Basiq</p>
              </div>
            </motion.div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-4">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportClientToken}
                    className="flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Token</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center">
                  Use the client access token to make API requests to Basiq. This token is valid for 60 minutes.
                </TooltipContent>
              </Tooltip>

              {user && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 p-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-600">{user.email}</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={e => { e.preventDefault(); handleViewUserDetails() }} disabled={loadingUserDetails}>
                      <User className="w-4 h-4 mr-2" />
                      <span>{loadingUserDetails ? "Loading..." : "User Details"}</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={e => { e.preventDefault(); handleAddAnotherAccount() }} disabled={loadingAddAccount}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      <span>{loadingAddAccount ? "Loading..." : "Add another account"}</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={e => { e.preventDefault(); handleConsentManagement() }} disabled={loadingConsent}>
                      <Handshake className="w-4 h-4 mr-2" />
                      <span>{loadingConsent ? "Loading..." : "Consent Management"}</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu content */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="px-6 py-4 space-y-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleExportClientToken()
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Token</span>
                </Button>

                {user && (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full text-left"
                      onClick={() => {
                        handleViewUserDetails()
                        setIsMobileMenuOpen(false)
                      }}
                      disabled={loadingUserDetails}
                    >
                      <User className="w-5 h-5 mr-2 inline" />
                      {loadingUserDetails ? "Loading..." : "User Details"}
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full text-left"
                      onClick={() => {
                        handleAddAnotherAccount()
                        setIsMobileMenuOpen(false)
                      }}
                      disabled={loadingAddAccount}
                    >
                      <UserPlus className="w-5 h-5 mr-2 inline" />
                      {loadingAddAccount ? "Loading..." : "Add another account"}
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full text-left"
                      onClick={() => {
                        handleConsentManagement()
                        setIsMobileMenuOpen(false)
                      }}
                      disabled={loadingConsent}
                    >
                      <Handshake className="w-5 h-5 mr-2 inline" />
                      {loadingConsent ? "Loading..." : "Consent Management"}
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full text-left text-red-600"
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="w-5 h-5 mr-2 inline" />
                      Sign out
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </TooltipProvider>
  )
}
