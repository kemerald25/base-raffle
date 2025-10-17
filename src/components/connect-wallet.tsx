
"use client";

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ChevronDown, LogOut, Wallet as WalletIcon } from 'lucide-react';
import { BalanceDisplay } from './balance-display';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

export function ConnectWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  const [showSubAccountModal, setShowSubAccountModal] = useState(false);

  // This will be replaced with real sub-account data later
  const subAccount = {
    address: "0xSubAccountAddress...1234",
    balance: 0
  };
  const hasSubAccount = false;


  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        {hasSubAccount && (
          <div className="hidden md:flex flex-col items-end">
             <BalanceDisplay label="Main Account" balance={Number(balance?.formatted) || 0} />
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback>{address ? address.slice(2, 4).toUpperCase() : '?'}</AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[100px]">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not Connected'}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">My Wallet</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{address}</p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
                <BalanceDisplay label="Main Account" balance={Number(balance?.formatted) || 0} />
                {hasSubAccount ? (
                    <BalanceDisplay label="Sub Account" balance={subAccount.balance} isSubAccount />
                ) : (
                    <Button variant="link" className="p-0 h-auto text-sm" onClick={() => setShowSubAccountModal(true)}>
                        Create Sub Account
                    </Button>
                )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => disconnect()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Disconnect</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={showSubAccountModal} onOpenChange={setShowSubAccountModal}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Sub Account</DialogTitle>
                    <DialogDescription>
                        Create a sub account for a seamless, no-popup raffle experience.
                        This feature is coming soon!
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <Button onClick={() => connect({ connector: coinbaseWallet() })} disabled={isPending}>
       <WalletIcon className="mr-2 h-4 w-4"/>
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}
