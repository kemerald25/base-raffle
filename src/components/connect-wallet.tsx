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
    if (!walletKit.signClient) return;
    
    const onSessionUpdate = () => {
      setSessions([...walletKit.signClient.session.values]);
    };

    walletKit.signClient.on('session_update', onSessionUpdate);
    walletKit.signClient.on('session_delete', onSessionUpdate);
    
    // Initial check
    onSessionUpdate();

    return () => {
      walletKit.signClient.off('session_update', onSessionUpdate);
      walletKit.signClient.off('session_delete', onSessionUpdate);
    };
  }, [walletKit.signClient]);

  useEffect(() => {
    if (sessions.length > 0) {
      const mainAccount = sessions[0].namespaces.eip155.accounts[0];
      const address = mainAccount.split(':').pop() || '';
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

  const handleDisconnect = async () => {
    if (sessions.length > 0 && walletKit.signClient) {
      try {
        await walletKit.disconnectSession({
          topic: sessions[0].topic,
          reason: { code: 6000, message: 'User disconnected' },
        });
      } catch (error) {
        console.error('Failed to disconnect session:', error);
      }
    }
  };

  if (user && sessions.length > 0) {
    return <UserNav user={user} onDisconnect={handleDisconnect} sessions={sessions} />;
  }

  // The button is now for display purposes, as connection is handled by dApp redirection.
  return (
    <Button className="w-full md:w-auto">
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
