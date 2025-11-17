import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const r = await fetch("http://localhost:5005/wallet");
    const wallet = await r.json();

    if (!wallet || wallet.status === "not_found") {
      return res.status(200).json({ found: false });
    }

    // Return the wallet content directly
    res.status(200).json({ found: true, wallet: wallet.walletData });
  } catch (e: any) {
    res.status(500).json({ found: false, error: e.message });
  }
}
