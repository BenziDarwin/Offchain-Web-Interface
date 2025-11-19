// pages/api/qr/generate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import QRCode from "qrcode";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: "Missing data field" });
    }

    // Generate the QR Code as a Base64 data URL
    const qr = await QRCode.toDataURL(data);

    return res.status(200).json({ qr });
  } catch (error) {
    console.error("QR generation failed:", error);
    return res.status(500).json({ error: "Failed to generate QR code" });
  }
}
