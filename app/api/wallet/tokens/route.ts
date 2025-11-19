import { NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { CHAINS, ERC20_ABI, POPULAR_TOKENS } from '@/utils/constants'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const chain = (searchParams.get('chain') || 'mainnet') as keyof typeof CHAINS

    if (!address) {
      return NextResponse.json({ error: 'Address parameter required' }, { status: 400 })
    }

    const rpcUrl = CHAINS[chain]
    if (!rpcUrl) {
      return NextResponse.json({ error: 'Invalid chain' }, { status: 400 })
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const tokens = POPULAR_TOKENS[chain] || []

    const tokenBalances = await Promise.all(
      tokens.map(async (token) => {
        try {
          const contract = new ethers.Contract(token.address, ERC20_ABI, provider)

          const [balance, decimals, symbol, name] = await Promise.all([
            contract.balanceOf(address),
            contract.decimals(),
            contract.symbol(),
            contract.name(),
          ])

          // Convert BigInt values to numbers/strings explicitly
          const decimalsNumber = Number(decimals)
          const formattedBalance = ethers.formatUnits(balance, decimalsNumber)

          return {
            address: token.address,
            symbol: String(symbol),
            name: String(name),
            balance: formattedBalance,
            decimals: decimalsNumber,
          }
        } catch (error) {
          console.error(`Error fetching token ${token.address}:`, error)
          return {
            address: token.address,
            balance: '0',
            decimals: 0,
            symbol: 'Unknown',
            name: 'Unknown Token',
            error: 'Failed to fetch token data',
          }
        }
      })
    )

    // Filter out tokens with zero balance (optional)
    const nonZeroTokens = tokenBalances.filter(token => 
      parseFloat(token.balance) > 0
    )

    return NextResponse.json({
      tokens: nonZeroTokens.length > 0 ? nonZeroTokens : tokenBalances,
    })
  } catch (error) {
    console.error('Token balance error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token balances' }, 
      { status: 500 }
    )
  }
}