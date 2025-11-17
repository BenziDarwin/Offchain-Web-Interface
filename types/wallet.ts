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