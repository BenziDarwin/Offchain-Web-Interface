import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { drive_path } = body;

    // Look for .ert file on the drive
    const ertPath = join(drive_path, "wallet.ert");

    try {
      const walletData = await fs.readFile(ertPath, "utf-8");
      const parsedData = JSON.parse(walletData);

      return NextResponse.json({
        success: true,
        balance: parsedData.balance || "0",
        address: parsedData.address || "Unknown",
      });
    } catch (error) {
      return NextResponse.json(
        { error: ".ert file not found on drive" },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("Drive read error:", error);
    return NextResponse.json(
      { error: "Failed to read from drive" },
      { status: 500 },
    );
  }
}
