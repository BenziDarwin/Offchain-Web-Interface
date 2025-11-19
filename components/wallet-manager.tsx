"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createWallet } from "@/core/offchain_server";

interface WalletManagerProps {
  onWalletCreated: () => void;
}

export default function WalletManager({ onWalletCreated }: WalletManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<"initial" | "downloading" | "complete">(
    "initial",
  );

  const handleCreateWallet = async () => {
    setLoading(true);
    setError(null);
    setStep("downloading");

    try {
      const res = await createWallet();
      console.log(res);
      const byteData = res.data.byte_data;

      // Convert the string to a Blob
      const blob = new Blob([byteData], { type: "text/plain" });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "credentials.ert";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setStep("complete");
      setSuccess(true);

      setTimeout(() => onWalletCreated(), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStep("initial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 max-w-2xl mx-auto py-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-2">
          Welcome to Base Zero
        </h2>
        <p className="text-muted-foreground">
          Create your secure self-custody wallet to get started
        </p>
      </div>

      <Card className="p-8 border-border/40 backdrop-blur-sm">
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-muted to-muted/50 rounded-lg p-6 border border-border/40">
            <h3 className="font-semibold text-lg mb-3">About Base Zero</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-foreground font-bold">•</span>
                <span>
                  Non-custodial HD wallet with full control over your private
                  keys
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-bold">•</span>
                <span>Offline-first design with encrypted backup files</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-bold">•</span>
                <span>Send and receive ETH and ERC20 tokens</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-bold">•</span>
                <span>Secure storage on encrypted USB drives</span>
              </li>
            </ul>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === "complete" && success && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-sm">
              <div className="text-green-600 dark:text-green-400 font-semibold mb-2">
                Wallet Created Successfully!
              </div>
              <div className="text-green-600/80 dark:text-green-400/80 space-y-1 text-xs">
                <p>Your wallet backup (.ert file) has been downloaded.</p>
                <p className="font-semibold mt-2">
                  Neplete' ? 'Loading Dashboard...'xt steps:
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Save the .ert file to a USB flash drive</li>
                  <li>Keep the USB drive in a safe location</li>
                  <li>Never share your .ert file with anyone</li>
                </ol>
              </div>
            </div>
          )}

          {step === "downloading" && (
            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 text-sm text-blue-600 dark:text-blue-400">
              Generating and downloading your secure wallet backup...
            </div>
          )}

          <Button
            onClick={handleCreateWallet}
            disabled={loading}
            size="lg"
            className="w-full h-12 text-base font-semibold transition-smooth"
          >
            {loading ? "Creating Wallet..." : "Create New Wallet"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
