import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('http://127.0.0.1:7671/api/health')
    
    if (response.ok) {
      return NextResponse.json({ status: 'healthy' })
    }
    
    return NextResponse.json(
      { status: 'unhealthy' },
      { status: 503 }
    )
  } catch (error) {
    return NextResponse.json(
      { status: 'unreachable' },
      { status: 503 }
    )
  }
}
