'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronDown } from 'lucide-react'
import { useChain } from '@/provider/chain-provider'

interface Balance {
  eth: string
  usd: string
  chain: string
  chainId: number
}

interface Token {
  address: string
  symbol: string
  name: string
  balance: string
  decimals?: number
  error?: string
}

const CHAIN_OPTIONS = [
  { value: 'mainnet', label: 'Ethereum Mainnet' },
  { value: 'sepolia', label: 'Sepolia Testnet' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'tron', label: 'Tron' },
  { value: 'ganache', label: 'Ganache Local' },
]

export default function Dashboard({ address }: { address: string }) {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const {chain, setChain} = useChain();
  const [showChainMenu, setShowChainMenu] = useState(false)

  useEffect(() => {
  if (!address || !chain) return;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/wallet/balance?address=${address}&chain=${chain}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to load balance");

      setBalance({
        eth: data.eth,
        usd: data.usd,
        chain: data.chain,
        chainId: data.chainId,
      });

      const chainRes = await fetch(`/api/wallet/tokens?address=${address}&chain=${chain}`);
       const chainData = await chainRes.json();
      setTokens(chainData.tokens);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [address, chain]);


  return (
    <div className="grid gap-4">
      <div className="relative">
        <button
          onClick={() => setShowChainMenu(!showChainMenu)}
          className="w-full md:w-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border/40 hover:border-border/60 transition-colors"
        >
          <span className="text-sm font-medium text-foreground">
            {CHAIN_OPTIONS.find((c) => c.value === chain)?.label || 'Select Chain'}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>

        {showChainMenu && (
          <div className="absolute top-full mt-2 w-full md:w-56 bg-background border border-border/40 rounded-lg shadow-lg z-50 overflow-hidden">
            {CHAIN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setChain(opt.value)
                  setShowChainMenu(false)
                }}
                className={`w-full text-left px-4 py-2 transition-colors ${
                  chain === opt.value
                    ? 'bg-foreground/10 text-foreground'
                    : 'text-muted-foreground hover:bg-foreground/5'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <Card className="overflow-hidden border-border/40 backdrop-blur-sm">
        <div className="p-8">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-sm font-medium text-muted-foreground">Total Balance</h2>
            {loading ? (
              <Skeleton className="h-12 w-48" />
            ) : error ? (
              <p className="text-destructive text-sm">{error}</p>
            ) : (
              <>
                <p className="text-5xl font-bold text-foreground tracking-tight">
                  {balance?.eth || '0'} ETH
                </p>
                <p className="text-lg text-muted-foreground">≈ ${balance?.usd || '0'} USD</p>
              </>
            )}
          </div>

          <div className="h-1 w-full bg-gradient-to-r from-muted via-foreground/20 to-transparent rounded-full" />
        </div>
      </Card>

      {tokens.length > 0 && (
        <Card className="overflow-hidden border-border/40 backdrop-blur-sm">
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Token Balances</h3>
            <div className="space-y-3">
              {tokens.map((token) => (
                <div
                  key={token.address}
                  className="flex justify-between items-center p-3 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-foreground">{token.symbol}</p>
                    <p className="text-xs text-muted-foreground">{token.name}</p>
                  </div>
                  <p className="font-mono text-sm text-foreground">
                    {parseFloat(token.balance).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 border-border/40 backdrop-blur-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Network</span>
              <span className="font-semibold text-foreground text-xs">{balance?.chain}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Chain ID</span>
              <span className="font-semibold text-foreground">{balance?.chainId}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border/40 backdrop-blur-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Wallet Status</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-foreground">Active</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
