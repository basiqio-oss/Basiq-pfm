import { NextRequest, NextResponse } from "next/server";
import { getBasiqClientToken } from "@/lib/basiq-token";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const clientAccessToken = await getBasiqClientToken(userId);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const consentUrl = `https://consent.basiq.io/home?token=${clientAccessToken}&action=connect`;

    // Return the key as `connectUrl` to match frontend expectation
    return NextResponse.json({ connectUrl: consentUrl });
  } catch (error) {
    console.error("Error generating consent URL:", error);
    return NextResponse.json(
      { error: "Failed to generate consent URL", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
