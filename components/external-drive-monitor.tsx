'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface Drive {
  path: string
  name: string
  size: string
}

export default function ExternalDriveMonitor() {
  const [drives, setDrives] = useState<Drive[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDrive, setSelectedDrive] = useState<Drive | null>(null)
  const [walletBalance, setWalletBalance] = useState<any>(null)

  useEffect(() => {
    const checkDrives = async () => {
      try {
        const response = await fetch('/api/drives/list')
        if (!response.ok) throw new Error('Failed to list drives')
        const data = await response.json()
        setDrives(data.drives || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    checkDrives()
    const interval = setInterval(checkDrives, 5000) // Check every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const handleLoadFromDrive = async (drive: Drive) => {
    try {
      const response = await fetch('/api/drives/read-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drive_path: drive.path }),
      })
      if (!response.ok) throw new Error('Failed to read wallet')
      const data = await response.json()
      setSelectedDrive(drive)
      setWalletBalance(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="grid gap-8">
      <Card className="p-8 border-border/40 backdrop-blur-sm">
        <h2 className="text-lg font-semibold mb-4">External Drives</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Detected external storage devices with wallet backups
        </p>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : drives.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No external drives detected</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drives.map((drive) => (
              <div
                key={drive.path}
                className="flex items-center justify-between p-4 bg-muted/50 border border-border/40 rounded-lg transition-smooth hover:bg-muted"
              >
                <div>
                  <p className="font-medium text-foreground">{drive.name}</p>
                  <p className="text-xs text-muted-foreground">{drive.size}</p>
                </div>
                <Button
                  onClick={() => handleLoadFromDrive(drive)}
                  variant="outline"
                  size="sm"
                  className="transition-smooth"
                >
                  Load
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedDrive && walletBalance && (
        <Card className="p-8 border-border/40 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4">Wallet from {selectedDrive.name}</h3>
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg border border-border/40">
              <p className="text-sm text-muted-foreground mb-1">Balance</p>
              <p className="text-3xl font-bold text-foreground">{walletBalance.balance} ETH</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
