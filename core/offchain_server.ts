import { CreateWalletResponse, Wallet, Wallets } from "@/types/wallet";
import { AxiosInstance } from "./baseURL";

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  token?: string;
  status: string;
}

// Health check
export const getHealth = async (): Promise<{ success: string, data:string }> => {
  try {
    const response:{ success: string, data:string } = await AxiosInstance.get("/api/health");
    return response;
  } catch (error: any) {
    console.error("Health check failed:", error);
    throw new Error("Health check failed");
  }
};

// Create HD wallet
export const createWallet = async (): Promise<CreateWalletResponse> => {
  try {
    const response:CreateWalletResponse = await AxiosInstance.post("/api/wallets",{});
    // Optionally store the wallet in sessionStorage
    sessionStorage.setItem("ert", JSON.stringify(response.data.byte_data));
    return response;
  } catch (error: any) {
    console.error("Failed to create wallet:", error);
    throw new Error("Failed to create wallet");
  }
};

// List stored addresses
export const getWalletAddresses = async (credentials:string): Promise<Wallets[]> => {
  try {
    const response = await AxiosInstance.get("/api/wallets/addresses", {headers:{Authorization:`Bearer ${credentials}`}});
    return response.data;
  } catch (error: any) {
    console.error("Failed to list wallet addresses:", error);
    throw new Error("Failed to list wallet addresses");
  }
};

// Get address by index
export const getAddressByIndex = async (index: number, credentials: string): Promise<Wallet> => {
  try {
    const response: Wallet = await AxiosInstance.get(`/api/wallets/addresses/by-index?index=${index}`, {headers:{Authorization:`Bearer ${credentials}`}});
    return response;
  } catch (error: any) {
    console.error(`Failed to get address at index ${index}:`, error);
    throw new Error(`Failed to get address at index ${index}`);
  }
};

// Send ETH
export const sendETH = async (to: string, amount: number): Promise<Transaction> => {
  try {
    const response = await AxiosInstance.post("/api/transactions/eth", { to, amount });
    return response.data;
  } catch (error: any) {
    console.error("Failed to send ETH:", error);
    throw new Error("Failed to send ETH");
  }
};

// Send ERC20 token
export const sendToken = async (to: string, amount: number, token: string): Promise<Transaction> => {
  try {
    const response = await AxiosInstance.post("/api/transactions/token", { to, amount, token });
    return response.data;
  } catch (error: any) {
    console.error("Failed to send token:", error);
    throw new Error("Failed to send token");
  }
};

// Get all transactions
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await AxiosInstance.get("/api/transactions");
    return response.data;
  } catch (error: any) {
    console.error("Failed to get transactions:", error);
    throw new Error("Failed to get transactions");
  }
};
