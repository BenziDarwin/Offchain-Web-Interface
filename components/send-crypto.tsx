"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sendETH, sendToken, getTransactions } from "@/core/offchain_server";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Transaction } from "@/types/wallet";
import { useChain } from "@/provider/chain-provider";
import { formatUnits, parseUnits } from "ethers";
import {
  getTokensByNetwork,
  POPULAR_TOKENS,
  type NetworkKey,
} from "@/utils/constants";

export default function SendCrypto() {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txId, setTxId] = useState("");
  const [isTokenTransfer, setIsTokenTransfer] = useState(false);
  const { ert, chain, setChain } = useChain();

  const [availableTokens, setAvailableTokens] = useState(
    getTokensByNetwork(chain as NetworkKey),
  );

  // Transaction list state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTxs, setLoadingTxs] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Get credentials from localStorage or your auth system
  const getCredentials = () => {
    const credentials = ert;
    if (!credentials) {
      throw new Error(
        "No wallet credentials found. Please create or import a wallet first.",
      );
    }
    return credentials;
  };

  // Load transactions on component mount
  useEffect(() => {
    loadTransactions();
  }, []);

  const handleNetworkChange = (newNetwork: NetworkKey) => {
    setChain(newNetwork);
    setAvailableTokens(getTokensByNetwork(newNetwork));
    setTokenAddress("");
  };

  const loadTransactions = async () => {
    setLoadingTxs(true);
    setTxError(null);
    try {
      const txs = await getTransactions();
      setTransactions(txs);
      setCurrentPage(1);
    } catch (err) {
      setTxError(
        err instanceof Error ? err.message : "Failed to load transactions",
      );
    } finally {
      setLoadingTxs(false);
    }
  };

  const handleSendETH = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const credentials = getCredentials();
      const transaction = await sendETH(toAddress, amount, credentials);

      setTxId(transaction.id);
      setSuccess(true);
      setToAddress("");
      setAmount("");

      await loadTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const credentials = getCredentials();
      const rawAmount = parseUnits(amount, 18).toString();
      const transaction = await sendToken(
        toAddress,
        rawAmount,
        tokenAddress,
        credentials,
      );

      setTxId(transaction.id);
      setSuccess(true);
      setToAddress("");
      setAmount("");
      setTokenAddress("");

      await loadTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/50";
      case "failed":
        return "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/50";
      case "syncing":
        return "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/50";
      case "pending":
      default:
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/50";
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = sortedTransactions.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="grid gap-8 max-w-6xl w-full">
      {/* Send Form */}
      <Card className="p-8 border-border/40 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6">Send Crypto</h2>

        <div className="mb-6">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={!isTokenTransfer ? "default" : "outline"}
              onClick={() => setIsTokenTransfer(false)}
              className="flex-1"
            >
              Send ETH
            </Button>
            <Button
              type="button"
              variant={isTokenTransfer ? "default" : "outline"}
              onClick={() => setIsTokenTransfer(true)}
              className="flex-1"
            >
              Send Token
            </Button>
          </div>
        </div>

        <form
          onSubmit={isTokenTransfer ? handleSendToken : handleSendETH}
          className="space-y-6"
        >
          {isTokenTransfer && (
            <>
              <div>
                <Label
                  htmlFor="network"
                  className="text-sm font-medium mb-2 block"
                >
                  Network
                </Label>
                <Select
                  value={chain}
                  onValueChange={(value) =>
                    handleNetworkChange(value as NetworkKey)
                  }
                >
                  <SelectTrigger id="network">
                    <SelectValue placeholder="Select a network" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(POPULAR_TOKENS).map((net) => (
                      <SelectItem key={net} value={net}>
                        {net.charAt(0).toUpperCase() + net.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="token"
                  className="text-sm font-medium mb-2 block"
                >
                  Token
                </Label>
                {availableTokens.length > 0 ? (
                  <Select value={tokenAddress} onValueChange={setTokenAddress}>
                    <SelectTrigger id="token">
                      <SelectValue placeholder="Select a token" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTokens.map((token) => (
                        <SelectItem key={token.address} value={token.address}>
                          {token.symbol} ({formatAddress(token.address)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground p-3 border border-border/40 rounded-md">
                    No popular tokens available for this network. Enter address
                    manually:
                  </div>
                )}
                <Input
                  id="token-manual"
                  placeholder="Or paste token address (0x...)"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  disabled={loading}
                  className="transition-smooth mt-2"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="address" className="text-sm font-medium mb-2 block">
              Recipient Address
            </Label>
            <Input
              id="address"
              placeholder="0x..."
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              disabled={loading}
              required
              className="transition-smooth"
            />
          </div>

          <div>
            <Label htmlFor="amount" className="text-sm font-medium mb-2 block">
              Amount {isTokenTransfer ? "(Tokens)" : "(ETH)"}
            </Label>
            <Input
              id="amount"
              type="text"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
              required
              className="transition-smooth"
            />
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-sm text-green-600 dark:text-green-400 space-y-2">
              <p className="font-semibold">Transaction created successfully!</p>
              <p className="text-xs">
                Status: Pending (will sync automatically)
              </p>
              <p className="font-mono text-xs break-all">ID: {txId}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full transition-smooth"
          >
            {loading
              ? "Sending..."
              : `Send ${isTokenTransfer ? "Token" : "ETH"}`}
          </Button>
        </form>
      </Card>

      {/* Transaction List */}
      <Card className="p-8 border-border/40 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Transaction History</h2>
          <Button
            onClick={loadTransactions}
            disabled={loadingTxs}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingTxs ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {txError && (
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 text-sm text-destructive mb-4">
            {txError}
          </div>
        )}

        {loadingTxs && transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions yet
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {paginatedTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="border border-border/40 rounded-lg p-4 hover:bg-accent/5 transition-smooth"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm uppercase">
                          {tx.transaction_type === "eth" ? "ETH" : "Token"}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(tx.status)}`}
                        >
                          {tx.status}
                        </span>
                        {tx.synced_to_chain && (
                          <span className="text-xs px-2 py-1 rounded-full border border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            On-chain
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">From:</span>
                          <p className="font-mono">
                            {formatAddress(tx.from_address)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">To:</span>
                          <p className="font-mono">
                            {formatAddress(tx.to_address)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Amount:</span>
                          <p className="font-semibold">
                            {tx.token_address
                              ? formatUnits(tx.amount, 18)
                              : tx.amount}
                          </p>
                        </div>
                        {tx.token_address && (
                          <div>
                            <span className="text-muted-foreground">
                              Token:
                            </span>
                            <p className="font-mono text-xs">
                              {formatAddress(tx.token_address)}
                            </p>
                          </div>
                        )}
                      </div>

                      {tx.tx_hash && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Tx Hash:
                          </span>
                          <p className="font-mono text-xs break-all">
                            {tx.tx_hash}
                          </p>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        {formatDate(tx.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border/40 pt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({sortedTransactions.length}{" "}
                total)
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
