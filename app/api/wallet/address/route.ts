import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('http://127.0.0.1:7671/api/wallets/addresses', {
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch address' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      address: data[0] || '0x0000000000000000000000000000000000000000',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch address' },
      { status: 500 }
    )
  }
}
