import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: string | number, currency = "AUD") {
  const numericAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
  if (isNaN(numericAmount)) {
    return ""
  }
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency,
  }).format(numericAmount)
}
