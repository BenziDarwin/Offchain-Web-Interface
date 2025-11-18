import { CreateWalletResponse, Transaction, Wallet, Wallets } from "@/types/wallet";
import { AxiosInstance } from "./baseURL";
import { AxiosResponse } from "axios";

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
    const response:AxiosResponse<CreateWalletResponse> = await AxiosInstance.post("/api/wallets",{});
    // Optionally store the wallet in sessionStorage
    sessionStorage.setItem("ert", JSON.stringify(response.data.data.byte_data));
    return response.data;
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
    const response: AxiosResponse<Wallet> = await AxiosInstance.get(`/api/wallets/addresses/by-index?index=${index}`, {headers:{Authorization:`Bearer ${credentials}`}});
    return response.data;
  } catch (error: any) {
    console.error(`Failed to get address at index ${index}:`, error);
    throw new Error(`Failed to get address at index ${index}`);
  }
};

// Send ETH
export const sendETH = async (
  toAddress: string, 
  amount: string, 
  credentials: string
): Promise<Transaction> => {
  try {
    const response = await AxiosInstance.post(
      "/api/transactions/eth", 
      { 
        to_address: toAddress,  // Match backend field name
        amount: amount,
        from_index: 0  // Default to first address, make configurable if needed
      }, 
      {
        headers: { 
          Authorization: `Bearer ${credentials}` 
        }
      }
    );
    
    // Backend wraps response in ApiResponse structure
    return response.data.data;
  } catch (error: any) {
    console.error("Failed to send ETH:", error);
    const errorMsg = error.response?.data?.message || "Failed to send ETH";
    throw new Error(errorMsg);
  }
};

// Send ERC20 token
export const sendToken = async (
  toAddress: string, 
  amount: string, 
  tokenAddress: string, 
  credentials: string
): Promise<Transaction> => {
  try {
    const response = await AxiosInstance.post(
      "/api/transactions/token", 
      { 
        to_address: toAddress,  // Match backend field name
        amount: amount,
        token_address: tokenAddress,  // Match backend field name
        from_index: 0  // Default to first address, make configurable if needed
      }, 
      {
        headers: { 
          Authorization: `Bearer ${credentials}` 
        }
      }
    );
    
    // Backend wraps response in ApiResponse structure
    return response.data.data;
  } catch (error: any) {
    console.error("Failed to send token:", error);
    const errorMsg = error.response?.data?.message || "Failed to send token";
    throw new Error(errorMsg);
  }
};

// Get all transactions
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await AxiosInstance.get("/api/transactions");
    
    // Backend wraps response in ApiResponse structure
    return response.data.data;
  } catch (error: any) {
    console.error("Failed to get transactions:", error);
    const errorMsg = error.response?.data?.message || "Failed to get transactions";
    throw new Error(errorMsg);
  }
};