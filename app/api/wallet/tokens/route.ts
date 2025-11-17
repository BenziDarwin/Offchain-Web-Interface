import { NextResponse } from 'next/server'
import { ethers } from 'ethers'

// Common token ABIs for balance checking
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
]

const POPULAR_TOKENS = {
  mainnet: [
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC' },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT' },
    { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI' },
  ],
  sepolia: [
    { address: '0xf08A50178dfcDE18524ATA7364dc53f0e7B7b8f1', symbol: 'USDC' },
  ],
  polygon: [
    { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC' },
    { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT' },
  ],
}

const CHAINS = {
  mainnet: 'https://eth-mainnet.g.alchemy.com/v2/demo',
  sepolia: 'https://eth-sepolia.g.alchemy.com/v2/demo',
  polygon: 'https://polygon-rpc.com',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  optimism: 'https://mainnet.optimism.io',
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const chain = (searchParams.get('chain') || 'mainnet') as keyof typeof CHAINS

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter required' },
        { status: 400 }
      )
    }

    const rpcUrl = CHAINS[chain]
    if (!rpcUrl) {
      return NextResponse.json(
        { error: 'Invalid chain' },
        { status: 400 }
      )
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const tokens = POPULAR_TOKENS[chain as keyof typeof POPULAR_TOKENS] || []

    const tokenBalances = await Promise.all(
      tokens.map(async (token) => {
        try {
          const contract = new ethers.Contract(token.address, ERC20_ABI, provider)
          const [balance, decimals, name] = await Promise.all([
            contract.balanceOf(address),
            contract.decimals(),
            contract.name(),
          ])
          
          const formattedBalance = ethers.formatUnits(balance, decimals)
          
          return {
            address: token.address,
            symbol: token.symbol,
            name,
            balance: formattedBalance,
            decimals,
          }
        } catch (err) {
          return {
            address: token.address,
            symbol: token.symbol,
            balance: '0',
            error: 'Failed to fetch',
          }
        }
      })
    )

    return NextResponse.json({
      tokens: tokenBalances.filter((t) => parseFloat(t.balance) > 0 || t.error),
    })
  } catch (error) {
    console.error('Token balance error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token balances' },
      { status: 500 }
    )
  }
}
