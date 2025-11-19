"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import Dashboard from "@/components/dashboard";
import WalletManager from "@/components/wallet-manager";
import SendCrypto from "@/components/send-crypto";
import ReceiveCrypto from "@/components/receive-crypto";
import { getAddressByIndex } from "@/core/offchain_server";
import { useChain } from "@/provider/chain-provider";

export default function Home() {
  const [walletDetected, setWalletDetected] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address, setAddress, ert, setErt } = useChain();

  const checkForExternalWallet = async () => {
    try {
      const res = await fetch("/api/wallet");
      const data = await res.json();

      if (data.found) {
        setErt(data.wallet);
        const walletRes = await getAddressByIndex(0, data.wallet);

        if (walletRes) {
          if (walletRes.data) {
            setAddress(walletRes.data.address);
            setWalletDetected(true);
            setError(null);
          } else {
            setError("Failed to retrieve wallet address");
            setWalletDetected(false);
          }
        } else {
          setError("Failed to fetch wallet address");
          setWalletDetected(false);
        }
      } else {
        setWalletDetected(false);
      }
    } catch (err: any) {
      console.error("Error checking wallet:", err);
      setError("Error checking wallet: " + err.message);
      setWalletDetected(false);
    }
  };

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const checkWalletContinuously = async () => {
      const isFirstCheck = checking;

      await checkForExternalWallet();

      if (isFirstCheck) {
        setChecking(false);
      }
    };

    // Initial check
    checkWalletContinuously();

    // Set interval to keep checking every 2 seconds
    intervalId = setInterval(checkWalletContinuously, 2000);

    // Cleanup
    return () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, []);

  if (checking) {
    return (
      <main className="min-h-screen bg-background">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-muted via-transparent to-transparent rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-muted via-transparent to-transparent rounded-full blur-3xl opacity-20" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Base Zero
            </h2>
            <p className="text-muted-foreground mb-8">Detecting wallet...</p>
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-foreground/40 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-foreground/40 animate-pulse delay-100" />
              <div className="w-2 h-2 rounded-full bg-foreground/40 animate-pulse delay-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background transition-smooth">
      {/* Background gradient elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-muted via-transparent to-transparent rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-muted via-transparent to-transparent rounded-full blur-3xl opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <header className="border-b border-border/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Base Zero
              </h1>
              <p className="text-muted-foreground text-sm">
                Premium self-custody crypto wallet
              </p>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {!walletDetected ? (
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
                  <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-3 text-amber-900 dark:text-amber-100">
                      Important: USB Drive Required
                    </h3>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                      Base Zero requires an external USB drive to function. Your
                      wallet will be stored as an encrypted .ert file on the
                      drive.
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Please prepare a USB flash drive before creating your
                      wallet.
                    </p>
                  </div>

                  <WalletManager onWalletCreated={() => {}} />

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {error}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ) : (
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="send">Send</TabsTrigger>
                <TabsTrigger value="receive">Receive</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="transition-smooth">
                {address ? (
                  <Dashboard address={address} />
                ) : (
                  <div>Loading...</div>
                )}
              </TabsContent>

              <TabsContent value="send" className="transition-smooth">
                <SendCrypto />
              </TabsContent>

              <TabsContent value="receive" className="transition-smooth">
                <ReceiveCrypto />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </main>
  );
}
