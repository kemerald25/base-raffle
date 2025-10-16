"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { UserNav } from './user-nav';
import type { User } from '@/lib/types';
import { Wallet } from 'lucide-react';
import { useWalletKit } from '@/lib/walletkit.tsx';
import { SessionTypes } from '@walletconnect/types';

export function ConnectWallet() {
  const walletKit = useWalletKit();
  const [sessions, setSessions] = useState<SessionTypes.Struct[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const activeSessions = walletKit.getActiveSessions();
    setSessions(Object.values(activeSessions));
  }, [walletKit]);

  useEffect(() => {
    // In a real app, you'd check a wallet provider's state
    // and fetch user data from an API or blockchain.
    if (sessions.length > 0) {
      const mainAccount = sessions[0].namespaces.eip155.accounts[0];
      const address = mainAccount.split(':').pop() || '';
      // Replace with actual user data fetching logic
      const fetchedUser: User = { 
        address: address,
        avatar_url: `https://effigy.im/a/${address}.svg`,
        total_spent: 0,
        total_tickets_purchased: 0,
        total_won: 0,
      };
      setUser(fetchedUser);
    } else {
      setUser(null);
    }
  }, [sessions]);
  
  const handleConnect = async () => {
    // For demo purposes, we will just open a new tab to the wallet.
    // In a real app, you would use walletKit.pair({ uri }) after getting uri from a dApp
    // For now we will just simulate a connection for the UI
    window.open(window.location.origin, '_blank');
  };
  
  const handleDisconnect = async () => {
    if (sessions[0]) {
        await walletKit.disconnectSession({
            topic: sessions[0].topic,
            reason: { code: 6000, message: 'User disconnected' },
        });
        setSessions([]);
    }
  };

  if (sessions.length > 0 && user) {
    return <UserNav user={user} onDisconnect={handleDisconnect} sessions={sessions} />;
  }

  return (
    <Button onClick={handleConnect} className="w-full md:w-auto">
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
