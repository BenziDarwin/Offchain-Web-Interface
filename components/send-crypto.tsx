'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendETH, sendToken, getTransactions } from '@/core/offchain_server'
import { RefreshCw } from 'lucide-react'
import { Transaction } from '@/types/wallet'
import { useChain } from '@/provider/chain-provider'
import { parseUnits } from 'ethers'

export default function SendCrypto() {
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [txId, setTxId] = useState('')
  const [isTokenTransfer, setIsTokenTransfer] = useState(false)
  const {ert}= useChain();
  
  // Transaction list state
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTxs, setLoadingTxs] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)

  // Get credentials from localStorage or your auth system
  const getCredentials = () => {
    const credentials = ert;
    if (!credentials) {
      throw new Error('No wallet credentials found. Please create or import a wallet first.')
    }
    return credentials
  }

  // Load transactions on component mount
  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    setLoadingTxs(true)
    setTxError(null)
    try {
      const txs = await getTransactions()
      setTransactions(txs)
    } catch (err) {
      setTxError(err instanceof Error ? err.message : 'Failed to load transactions')
    } finally {
      setLoadingTxs(false)
    }
  }

  const handleSendETH = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      const credentials = getCredentials()
      const transaction = await sendETH(toAddress, amount, credentials)
      
      setTxId(transaction.id)
      setSuccess(true)
      setToAddress('')
      setAmount('')
      
      // Refresh transaction list
      await loadTransactions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleSendToken = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      const credentials = getCredentials()
      const rawAmount = parseUnits(amount, 18).toString()
  const transaction = await sendToken(toAddress, rawAmount, tokenAddress, credentials)
      
      setTxId(transaction.id)
      setSuccess(true)
      setToAddress('')
      setAmount('')
      setTokenAddress('')
      
      // Refresh transaction list
      await loadTransactions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/50'
      case 'failed':
        return 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/50'
      case 'syncing':
        return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/50'
      case 'pending':
      default:
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/50'
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="grid gap-8 max-w-6xl w-full">
      {/* Send Form */}
      <Card className="p-8 border-border/40 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6">Send Crypto</h2>
        
        <div className="mb-6">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={!isTokenTransfer ? 'default' : 'outline'}
              onClick={() => setIsTokenTransfer(false)}
              className="flex-1"
            >
              Send ETH
            </Button>
            <Button
              type="button"
              variant={isTokenTransfer ? 'default' : 'outline'}
              onClick={() => setIsTokenTransfer(true)}
              className="flex-1"
            >
              Send Token
            </Button>
          </div>
        </div>

        <form onSubmit={isTokenTransfer ? handleSendToken : handleSendETH} className="space-y-6">
          {isTokenTransfer && (
            <div>
              <Label htmlFor="token" className="text-sm font-medium mb-2 block">
                Token Contract Address
              </Label>
              <Input
                id="token"
                placeholder="0x..."
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                disabled={loading}
                required
                className="transition-smooth"
              />
            </div>
          )}

          <div>
            <Label htmlFor="address" className="text-sm font-medium mb-2 block">
              Recipient Address
            </Label>
            <Input
              id="address"
              placeholder="0x..."
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              disabled={loading}
              required
              className="transition-smooth"
            />
          </div>

          <div>
            <Label htmlFor="amount" className="text-sm font-medium mb-2 block">
              Amount {isTokenTransfer ? '(Tokens)' : '(ETH)'}
            </Label>
            <Input
              id="amount"
              type="text"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
              required
              className="transition-smooth"
            />
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-sm text-green-600 dark:text-green-400 space-y-2">
              <p className="font-semibold">Transaction created successfully!</p>
              <p className="text-xs">Status: Pending (will sync automatically)</p>
              <p className="font-mono text-xs break-all">ID: {txId}</p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full transition-smooth">
            {loading ? 'Sending...' : `Send ${isTokenTransfer ? 'Token' : 'ETH'}`}
          </Button>
        </form>
      </Card>

      {/* Transaction List */}
      <Card className="p-8 border-border/40 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Transaction History</h2>
          <Button
            onClick={loadTransactions}
            disabled={loadingTxs}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loadingTxs ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {txError && (
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 text-sm text-destructive mb-4">
            {txError}
          </div>
        )}

        {loadingTxs && transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions yet
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="border border-border/40 rounded-lg p-4 hover:bg-accent/5 transition-smooth"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm uppercase">
                        {tx.transaction_type === 'eth' ? 'ETH' : 'Token'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                      {tx.synced_to_chain && (
                        <span className="text-xs px-2 py-1 rounded-full border border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          On-chain
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">From:</span>
                        <p className="font-mono">{formatAddress(tx.from_address)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">To:</span>
                        <p className="font-mono">{formatAddress(tx.to_address)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <p className="font-semibold">{tx.amount}</p>
                      </div>
                      {tx.token_address && (
                        <div>
                          <span className="text-muted-foreground">Token:</span>
                          <p className="font-mono text-xs">{formatAddress(tx.token_address)}</p>
                        </div>
                      )}
                    </div>

                    {tx.tx_hash && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Tx Hash:</span>
                        <p className="font-mono text-xs break-all">{tx.tx_hash}</p>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      {formatDate(tx.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}