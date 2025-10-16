"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { UserNav } from './user-nav';
import { getUserById } from '@/lib/data';
import type { User } from '@/lib/types';
import { Wallet } from 'lucide-react';

export function ConnectWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // In a real app, you'd check a wallet provider's state
    // For this mock, we'll just set a default user when "connected"
    if (isConnected) {
      const mockUser = getUserById('0x1234567890123456789012345678901234567890');
      setUser(mockUser || null);
    } else {
      setUser(null);
    }
  }, [isConnected]);
  
  const handleConnect = () => {
    setIsConnected(true);
  };
  
  const handleDisconnect = () => {
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
