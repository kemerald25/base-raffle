"use client";
import { Core } from "@walletconnect/core";
import { WalletKit } from "@reown/walletkit";
import { createContext, useContext, ReactNode } from "react";

if (!process.env.NEXT_PUBLIC_PROJECT_ID) {
    throw new Error('You need to provide NEXT_PUBLIC_PROJECT_ID env variable')
}

const core = new Core({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
});

export const walletKit = WalletKit.init({
  core,
  metadata: {
    name: "Base Raffle",
    description: "A production-ready onchain raffle/lottery application on Base with a seamless user experience.",
    url: "https://reown.com/walletkit",
    icons: [],
  },
});

export const WalletKitContext = createContext(walletKit);

export function WalletKitProvider({ children }: { children: ReactNode }) {
    return (
        <WalletKitContext.Provider value={walletKit}>
            {children}
        </WalletKitContext.Provider>
    );
}

export const useWalletKit = () => {
    return useContext(WalletKitContext);
};
