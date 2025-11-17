'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SendCrypto() {
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [txHash, setTxHash] = useState('')

  const handleSendETH = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/transactions/send-eth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_address: toAddress,
          amount: amount,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send transaction')
      }

      const data = await response.json()
      setTxHash(data.tx_hash)
      setSuccess(true)
      setToAddress('')
      setAmount('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-8 max-w-2xl">
      <Card className="p-8 border-border/40 backdrop-blur-sm">
        <form onSubmit={handleSendETH} className="space-y-6">
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
              className="transition-smooth"
            />
          </div>

          <div>
            <Label htmlFor="amount" className="text-sm font-medium mb-2 block">
              Amount (ETH)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.0"
              step="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
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
              <p className="font-semibold">Transaction sent successfully!</p>
              <p className="font-mono text-xs break-all">{txHash}</p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full transition-smooth">
            {loading ? 'Sending...' : 'Send ETH'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
