'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

export default function ReceiveCrypto() {
  const [address, setAddress] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await fetch('/api/wallet/address')
        if (!response.ok) throw new Error('Failed to fetch address')
        const data = await response.json()
        setAddress(data.address)
        
        // Generate QR code
        const qrResponse = await fetch('/api/qr/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: data.address }),
        })
        if (!qrResponse.ok) throw new Error('Failed to generate QR')
        const qrData = await qrResponse.json()
        setQrCode(qrData.qr_code)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchAddress()
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid gap-8 max-w-2xl">
      <Card className="p-8 border-border/40 backdrop-blur-sm">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Receive Crypto</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Share your wallet address or QR code to receive funds
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-64 w-64 mx-auto rounded-lg" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 text-sm text-destructive">
              {error}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              {qrCode && (
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <img src={qrCode || "/placeholder.svg"} alt="QR Code" className="w-64 h-64" />
                </div>
              )}

              <div className="w-full">
                <Label className="text-sm font-medium mb-2 block">Your Address</Label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={address}
                    readOnly
                    className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-sm font-mono text-foreground"
                  />
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="transition-smooth"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
