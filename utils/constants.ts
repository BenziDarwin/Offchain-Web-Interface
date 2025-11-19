export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
]

export const POPULAR_TOKENS = {
  mainnet: [
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC' },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT' },
    { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI' },
  ],
  sepolia: [
    { address: '0xf08A50178dfcDE18524ATA7364dc53f0e7B7b8f1', symbol: 'TEST' },
  ],
  polygon: [
    { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC' },
    { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT' },
  ],
  ganache: [
    { address: '0xbd59b592Be6E97908d3D180E796521d8e57f7051', symbol: 'MTK' },
  ],
  arbitrum: [],
  optimism: [],
}

export const CHAINS = {
  mainnet: 'https://eth-mainnet.g.alchemy.com/v2/demo',
  sepolia: 'https://eth-sepolia.g.alchemy.com/v2/demo',
  polygon: 'https://polygon-rpc.com',
  ganache: 'http://localhost:7545',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  optimism: 'https://mainnet.optimism.io',
}

export type NetworkKey = keyof typeof POPULAR_TOKENS

export interface Token {
  address: string
  symbol: string
}

export function getTokensByNetwork(network: NetworkKey): Token[] {
  return POPULAR_TOKENS[network] || []
}