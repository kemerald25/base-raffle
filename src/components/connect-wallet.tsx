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
    if (walletKit.signClient) {
      const activeSessions = walletKit.signClient.session.values;
      setSessions(activeSessions);

      const handleSessionUpdate = () => {
        setSessions([...walletKit.signClient.session.values]);
      };

      walletKit.signClient.on('session_update', handleSessionUpdate);
      walletKit.signClient.on('session_delete', handleSessionUpdate);
      
      return () => {
        walletKit.signClient.off('session_update', handleSessionUpdate);
        walletKit.signClient.off('session_delete', handleSessionUpdate);
      }
    }
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
  
  const handleConnect = async () => {
    // In a real implementation, you would get the URI from a QR code
    // scanner or a dApp connection prompt.
    const uri = prompt("Enter WalletConnect URI");
    if (uri) {
      try {
        await walletKit.pair({ uri });
        console.log("Pairing initiated...");
      } catch (error) {
        console.error("Failed to pair:", error);
      }
    } else {
      console.log("No URI provided.");
    }
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
