export interface Wallet {success:boolean;data:WalletData}
export interface WalletData {address:string;public_key:string}
export interface CreateWalletResponse {
    success: boolean,
    data: {
        byte_data: string,
        addresses: string[],
        created_at: string
    },
    message: string
}

export interface Wallets {success:boolean;data:WalletData[]}

export interface Transaction {
  id: string
  transaction_type: 'eth' | 'token'
  from_address: string
  to_address: string
  amount: string
  token_address?: string
  status: 'pending' | 'completed' | 'failed' | 'syncing'
  created_at: string
  synced_to_chain: boolean
  tx_hash?: string
  nonce?: number
  gas_price?: string
  gas_limit?: number
}