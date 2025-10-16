"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { UserNav } from './user-nav';
import type { User } from '@/lib/types';
import { Wallet } from 'lucide-react';

export function ConnectWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // In a real app, you'd check a wallet provider's state
    // and fetch user data from an API or blockchain.
    if (isConnected) {
      // Replace with actual user data fetching logic
      const fetchedUser: User = { 
        address: '0x...',
        avatar_url: '',
        total_spent: 0,
        total_tickets_purchased: 0,
        total_won: 0,
      };
      setUser(fetchedUser);
    } else {
      setUser(null);
    }
  }, [isConnected]);
  
  const handleConnect = () => {
    // Replace with your wallet connection logic (e.g., RainbowKit, WalletConnect)
    setIsConnected(true);
  };
  
  const handleDisconnect = () => {
    // Replace with your wallet disconnection logic
    setIsConnected(false);
  };

  if (isConnected && user) {
    return <UserNav user={user} onDisconnect={handleDisconnect} />;
  }

  return (
    <Button onClick={handleConnect} className="w-full md:w-auto">
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
