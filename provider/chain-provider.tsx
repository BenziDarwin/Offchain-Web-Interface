"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface Balance {
  eth: string;
  usd: string;
  chain: string;
  chainId: number;
}

interface Token {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  decimals?: number;
  error?: string;
}

interface ChainContextType {
  chain: string;
  setChain: (chain: string) => void;
  address: string;
  setAddress: (address: string) => void;
  ert: string;
  setErt: (address: string) => void;
  balance: Balance | null;
  tokens: Token[];
  loading: boolean;
  error: string | null;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

export const CHAIN_OPTIONS = [
  { value: "mainnet", label: "Ethereum Mainnet" },
  { value: "sepolia", label: "Sepolia Testnet" },
  { value: "polygon", label: "Polygon" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "optimism", label: "Optimism" },
  { value: "ganache", label: "Ganache Local" },
];

export function ChainProvider({ children }: { children: React.ReactNode }) {
  const [chain, setChain] = useState("mainnet");
  const [ert, setErt] = useState<string>("");
  const [balance, setBalance] = useState<Balance | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -------------------------
  // Fetch balances + tokens
  // -------------------------
  const fetchBalances = async () => {
    try {
      setLoading(true);
      setError(null);

      const balanceRes = await fetch(
        `/api/wallet/balance?address=${address}&chain=${chain}`,
      );

      if (!balanceRes.ok) throw new Error("Failed to fetch balance");
      const balanceData = await balanceRes.json();
      setBalance(balanceData);

      const tokensRes = await fetch(
        `/api/wallet/tokens?address=${address}&chain=${chain}`,
      );

      if (tokensRes.ok) {
        const tokensData = await tokensRes.json();
        setTokens(tokensData.tokens);
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh & refetch when chain changes
  useEffect(() => {
    fetchBalances();
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, [chain, address]);

  return (
    <ChainContext.Provider
      value={{
        chain,
        setChain,
        address,
        setAddress,
        ert,
        setErt,
        balance,
        tokens,
        loading,
        error,
      }}
    >
      {children}
    </ChainContext.Provider>
  );
}

export function useChain() {
  const ctx = useContext(ChainContext);
  if (!ctx) throw new Error("useChain must be used inside <ChainProvider>");
  return ctx;
}
