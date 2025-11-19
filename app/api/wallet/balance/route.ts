import { NextResponse } from "next/server";
import { ethers } from "ethers";

const CHAINS = {
  mainnet: {
    id: 1,
    name: "Ethereum Mainnet",
    rpc: "https://eth-mainnet.g.alchemy.com/v2/demo",
  },
  sepolia: {
    id: 11155111,
    name: "Sepolia Testnet",
    rpc: "https://eth-sepolia.g.alchemy.com/v2/demo",
  },
  polygon: {
    id: 137,
    name: "Polygon",
    rpc: "https://polygon-rpc.com",
  },
  arbitrum: {
    id: 42161,
    name: "Arbitrum",
    rpc: "https://arb1.arbitrum.io/rpc",
  },
  optimism: {
    id: 10,
    name: "Optimism",
    rpc: "https://mainnet.optimism.io",
  },
  ganache: {
    id: 1337,
    name: "Ganache Local",
    rpc: "http://127.0.0.1:7545",
  },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const chain = (searchParams.get("chain") ||
      "mainnet") as keyof typeof CHAINS;

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter required" },
        { status: 400 },
      );
    }

    const chainConfig = CHAINS[chain];
    if (!chainConfig) {
      return NextResponse.json({ error: "Invalid chain" }, { status: 400 });
    }

    const provider = new ethers.JsonRpcProvider(chainConfig.rpc);

    // Get ETH balance
    const balance = await provider.getBalance(address);
    const ethBalance = ethers.formatEther(balance);

    // Get USD price (simplified - in production use a price API)
    const usdBalance = (parseFloat(ethBalance) * 2500).toFixed(2); // Mock price

    return NextResponse.json({
      eth: ethBalance,
      usd: usdBalance,
      chain: chainConfig.name,
      chainId: chainConfig.id,
    });
  } catch (error) {
    console.error("Balance fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch balance" },
      { status: 500 },
    );
  }
}
