"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft, User, Mail, Link as LinkIcon, CreditCard, ClipboardCopy, Check,
  XCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ModernLoader } from "@/components/modern-loader"
import Header from "@/app/dashboard/components/Header"
import Footer from "@/app/dashboard/components/Footer"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Connection {
  id: string
  links: {
    self: string
  }
}

interface Account {
  id: string
  links: {
    self: string
  }
}

interface UserDetail {
  id: string
  email: string
  connections: {
    count: number
    data: Connection[]
  }
  accounts: {
    count: number
    data: Account[]
  }
  links: {
    self: string
    connections: string
    accounts: string
    transactions: string
    auth_link?: string | null
  }
}

const CopyableText = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm break-all">{value}</span>
      <button
        onClick={handleCopy}
        className="text-muted-foreground hover:text-primary"
        title="Copy to clipboard"
        aria-label="Copy to clipboard"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <ClipboardCopy className="w-4 h-4" />}
      </button>
    </div>
  )
}

const DetailRow = ({
  icon,
  label,
  value,
  isLink = false,
}: {
  icon: React.ReactNode
  label: string
  value?: string | React.ReactNode | null
  isLink?: boolean
}) => {
  if (!value) return null
  return (
    <div className="flex items-start space-x-3">
      <div className="text-muted-foreground mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {isLink && typeof value === "string" ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline break-all"
          >
            {value}
          </a>
        ) : typeof value === "string" ? (
          <p className="text-sm text-foreground break-words">{value}</p>
        ) : (
          value
        )}
      </div>
    </div>
  )
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")

  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const userData = localStorage.getItem("basiq_user")
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
    async function fetchUserDetails() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/basiq/user?userId=${userId}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to fetch user.")
        setUser(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetails()
  }, [userId])

  return (
    <>
      <Header
        user={{
          name: username,
          email: email,
          connectionStatus: "connected"
        }}
      />

      <main className="p-6 md:p-10 max-w-7xl mx-auto bg-white flex flex-col">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="mb-6 self-start"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {loading && (
          <div className="flex-grow flex items-center justify-center">
            <ModernLoader size="lg" text="Loading user details..." />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="max-w-xl mx-auto">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && !user && (
          <p className="text-center">No user data found.</p>
        )}

        {!loading && !error && user && (
          <div className="grid md:grid-cols-3 gap-6 flex-grow">
            {/* Main section */}
            <div className="md:col-span-2 space-y-6">
              <Card className="bg-white text-black border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>User Overview</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DetailRow
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={user.email}
                  />
                </CardContent>
              </Card>

              <Card className="bg-white text-black border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Connections</CardTitle>
                  <CardDescription>Linked bank or financial institutions</CardDescription>
                </CardHeader>
                <CardContent>
                  {user.connections?.count > 0 ? (
                    <ul className="list-disc pl-5 space-y-2">
                      {user.connections.data.map((conn) => (
                        <li key={conn.id}>
                          <a
                            href={conn.links.self}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            <LinkIcon className="inline h-4 w-4 mr-1" />
                            {conn.id}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No connections found.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white text-black border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Accounts</CardTitle>
                  <CardDescription>Linked user accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  {user.accounts?.count > 0 ? (
                    <ul className="list-disc pl-5 space-y-2">
                      {user.accounts.data.map((account) => (
                        <li key={account.id}>
                          <a
                            href={account.links.self}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            <CreditCard className="inline h-4 w-4 mr-1" />
                            {account.id}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No accounts found.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-white text-black border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DetailRow
                    icon={<User className="h-4 w-4" />}
                    label="User ID"
                    value={<CopyableText value={user.id} />}
                  />
                  <DetailRow
                    icon={<LinkIcon className="h-4 w-4" />}
                    label="Self Link"
                    value={user.links?.self}
                    isLink
                  />
                  <DetailRow
                    icon={<LinkIcon className="h-4 w-4" />}
                    label="Connections Link"
                    value={user.links?.connections}
                    isLink
                  />
                  <DetailRow
                    icon={<LinkIcon className="h-4 w-4" />}
                    label="Accounts Link"
                    value={user.links?.accounts}
                    isLink
                  />
                  <DetailRow
                    icon={<LinkIcon className="h-4 w-4" />}
                    label="Transactions Link"
                    value={user.links?.transactions}
                    isLink
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Get Started button and modal placed here */}
        <div className="flex justify-center mt-10">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" size="lg">
                Get Started
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl w-full">
              <DialogHeader>
                <DialogTitle>Get Started Video</DialogTitle>
              </DialogHeader>

              <div
                style={{
                  position: "relative",
                  paddingBottom: "calc(50.18807092960774% + 41px)",
                  height: 0,
                  width: "100%",
                }}
              >
                <iframe
                  src="https://demo.arcade.software/WF7rtWDNNFwS1rdr2ba0?embed&embed_mobile=modal&embed_desktop=inline&show_copy_link=true"
                  title="Generate a Full Personal Finance Report and Test API Endpoints"
                  frameBorder="0"
                  loading="lazy"
                  allow="clipboard-write"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    colorScheme: "light",
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

      </main>

      <Footer />
    </>
  )
}
