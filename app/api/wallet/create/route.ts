import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.BASE_URL}/api/wallets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to create wallet" },
        { status: response.status },
      );
    }

    const data = await response.json();

    // The backend returns wallet data that should be zipped and saved as .ert file
    // For now, we'll return it as-is for the client to handle
    return NextResponse.json({
      success: true,
      walletData: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Wallet creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
