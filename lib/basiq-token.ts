import { Buffer } from "buffer" // Node.js Buffer for base64 encoding

const REFRESH_INTERVAL = 1000 * 60 * 30 // 30 minutes
let serverToken: string | undefined = undefined
let serverTokenRefreshDate = 0

/**
 * Fetches and caches the Basiq server access token.
 * The token is refreshed if it's expired or not yet fetched.
 * @returns {Promise<string>} The server access token.
 */
export async function getBasiqServerToken(): Promise<string> {
  if (!serverToken || Date.now() - serverTokenRefreshDate > REFRESH_INTERVAL) {
    console.log("Server token expired or not found. Fetching new server token...")
    await updateServerToken()
  }
  return serverToken as string // Assert as string because updateServerToken ensures it's set
}


/**
 * Fetches a new Basiq client access token for a specific user.
 * Client tokens are not cached as they are user-specific and short-lived.
 * @param {string} userId The ID of the user for whom to get the client token.
 * @returns {Promise<string>} The client access token.
 */
export async function getBasiqClientToken(userId: string): Promise<string> {
  console.log(`Fetching new client token for userId: ${userId}`)
  return await getNewToken("CLIENT_ACCESS", userId)
}

/**
 * Internal function to update the cached server token.
 */
async function updateServerToken() {
  serverToken = await getNewToken("SERVER_ACCESS")
  serverTokenRefreshDate = Date.now()
  console.log("Server token updated successfully.")
}

/**
 * Fetches a new token from the Basiq API.
 * Handles both SERVER_ACCESS and CLIENT_ACCESS scopes.
 * @param {'SERVER_ACCESS' | 'CLIENT_ACCESS'} scope The scope of the token to request.
 * @param {string} [userId] Optional user ID for CLIENT_ACCESS scope.
 * @returns {Promise<string>} The new access token.
 * @throws {Error} If the API key is not configured, or if the Basiq API returns an error.
 */
async function getNewToken(scope: "SERVER_ACCESS" | "CLIENT_ACCESS", userId?: string): Promise<string> {
  const apiKey = process.env.BASIQ_API_KEY

  if (!apiKey) {
    console.error("ERROR: BASIQ_API_KEY is undefined or empty in environment variables!")
    throw new Error("API key not configured. Please set BASIQ_API_KEY in your environment.")
  }

  // --- ADDED DEBUGGING LOGS AND CHECKS ---
  console.log("DEBUG: BASIQ_API_KEY loaded. Length:", apiKey.length)
  console.log("DEBUG: BASIQ_API_KEY starts with:", apiKey.substring(0, Math.min(apiKey.length, 10)) + "...")

  // Check if it looks like it's already base64 encoded or contains a colon
  if (apiKey.includes(":") || apiKey.endsWith("==") || apiKey.endsWith("=")) {
    console.warn(
      "WARNING: BASIQ_API_KEY might be already Base64 encoded or contain a colon. It should be the raw key from Basiq dashboard (e.g., 'sk_live_...').",
    )
  }
  // --- END ADDED DEBUGGING LOGS AND CHECKS ---

  // Correctly base64 encode the RAW API key for the Basic Authorization header
  // The format is 'API_KEY:' base64 encoded.
  let finalAuthHeaderValue: string

  // Check if the API key looks like it's already Base64 encoded (contains ':' and ends with '=' or '==')
  // This is a heuristic, but common for pre-encoded Basic auth strings.
  const isAlreadyBase64Encoded = apiKey.includes(":") || apiKey.endsWith("==") || apiKey.endsWith("=")

  if (isAlreadyBase64Encoded) {
    console.log("DEBUG: BASIQ_API_KEY appears to be pre-encoded. Using it directly.")
    finalAuthHeaderValue = apiKey
  } else {
    console.log("DEBUG: BASIQ_API_KEY appears to be raw. Base64 encoding it.")
    finalAuthHeaderValue = Buffer.from(`${apiKey}:`).toString("base64")
  }

  console.log(
    "DEBUG: Final Authorization header value (truncated):",
    `Basic ${finalAuthHeaderValue.substring(0, Math.min(finalAuthHeaderValue.length, 20))}...`,
  )

  const bodyParams = new URLSearchParams()
  bodyParams.append("scope", scope)
  if (scope === "CLIENT_ACCESS" && userId) {
    bodyParams.append("userId", userId)
  }

  try {
    const response = await fetch("https://au-api.basiq.io/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${finalAuthHeaderValue}`, // Use the determined value here
        Accept: "application/json",
        "basiq-version": "3.0",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams.toString(),
    })

    const responseText = await response.text()
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse Basiq token response as JSON:", parseError)
      throw new Error(`Invalid JSON response from Basiq token endpoint: ${responseText}`)
    }

    if (!response.ok) {
      console.error("Basiq token API error details:", data)
      const errorMessage = data.message || data.error_description || data.error || "Unknown error from Basiq API"
      if (data.data && Array.isArray(data.data)) {
        const errors = data.data.map((error: any) => `${error.title}: ${error.detail}`).join(", ")
        throw new Error(`Basiq API Error: ${errors}`)
      }
      throw new Error(`HTTP ${response.status}: ${errorMessage}`)
    }

    if (!data.access_token) {
      throw new Error("Access token not found in Basiq response.")
    }

    return data.access_token
  } catch (error) {
    console.error("Error fetching Basiq token:", error)
    throw error // Re-throw to be handled by the calling API route
  }
}
