"use client";

import { useAccount, useConnect, useDisconnect, useBalance, useWalletClient } from 'wagmi';
import { baseAccount } from 'wagmi/connectors';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ChevronDown, LogOut, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import { BalanceDisplay } from './balance-display';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { base } from 'wagmi/chains';

interface SubAccount {
  address: `0x${string}`;
  factory?: `0x${string}`;
  factoryData?: `0x${string}`;
}

export function ConnectWallet() {
  const { address, isConnected, connector } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address, chainId: base.id });
  const { data: walletClient } = useWalletClient();

  const [showSubAccountModal, setShowSubAccountModal] = useState(false);
  const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
  const [isCreatingSubAccount, setIsCreatingSubAccount] = useState(false);
  const [isCheckingSubAccount, setIsCheckingSubAccount] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: subAccountBalance } = useBalance({ 
    address: subAccount?.address,
    chainId: base.id 
  });

  // Get the provider from wagmi connector
  const getProvider = async () => {
    if (!connector) return null;
    try {
      const provider = await connector.getProvider();
      return provider;
    } catch (error) {
      console.error('Failed to get provider:', error);
      return null;
    }
  };

  // Check for existing sub account when connected
  useEffect(() => {
    const checkSubAccount = async () => {
      if (!isConnected || !address || isCheckingSubAccount) return;

      setIsCheckingSubAccount(true);
      try {
        const provider = await getProvider();
        if (!provider || typeof provider.request !== 'function') {
          console.log('Provider not available or invalid');
          return;
        }

        // Use wallet_getSubAccounts RPC method to get existing sub accounts
        const response = await provider.request({
          method: 'wallet_getSubAccounts',
          params: [{
            version: '1',
            account: address,
            domain: typeof window !== 'undefined' ? window.location.origin : undefined,
            chainId: base.id
          }]
        }) as any;

        console.log('Sub accounts response:', response);

        // Check if sub account exists
        if (response?.subAccounts && response.subAccounts.length > 0) {
          const existingSubAccount = response.subAccounts[0];
          setSubAccount({
            address: existingSubAccount.address as `0x${string}`,
            factory: existingSubAccount.factory as `0x${string}` | undefined,
            factoryData: existingSubAccount.factoryData as `0x${string}` | undefined
          });
          console.log('Found existing sub account:', existingSubAccount.address);
        } else {
          console.log('No existing sub account found');
          setSubAccount(null);
        }
      } catch (error: any) {
        console.log('Sub account check error:', error?.message || error);
        // If method not supported, silently handle
        if (error?.code === -32601) {
          console.log('wallet_getSubAccounts not supported by this wallet');
        }
      } finally {
        setIsCheckingSubAccount(false);
      }
    };

    checkSubAccount();
  }, [isConnected, address, connector]);

  const hasSubAccount = !!subAccount;

  const createSubAccount = async () => {
    if (!address || !isConnected) {
      setErrorMessage('Wallet not connected. Please connect your Base Account first.');
      return;
    }

    setIsCreatingSubAccount(true);
    setErrorMessage(null);

    try {
      const provider = await getProvider();
      if (!provider || typeof provider.request !== 'function') {
        throw new Error('Base Account provider not available. Please ensure you are using Base Account (Smart Wallet).');
      }

      console.log('Creating sub account for address:', address);

      // Use wallet_addSubAccount RPC method to create sub account
      const newSubAccount = await provider.request({
        method: 'wallet_addSubAccount',
        params: [{
          version: '1',
          account: {
            type: 'create',
          },
        }]
      }) as SubAccount;

      console.log('Sub account created:', newSubAccount);

      if (newSubAccount?.address) {
        setSubAccount(newSubAccount);
        setShowSubAccountModal(false);
        setErrorMessage(null);
      } else {
        throw new Error('Failed to create sub account: No address returned');
      }
      
    } catch (error: any) {
      console.error('Failed to create sub account:', error);
      
      // Handle specific error codes
      let message = 'Failed to create sub account. ';
      
      if (error?.code === 4100) {
        message += 'Please ensure your wallet is properly connected.';
      } else if (error?.code === -32603) {
        message += 'This feature requires Base Account (Smart Wallet).';
      } else if (error?.code === -32601) {
        message += 'Your wallet does not support sub accounts. Please use Base Account (Smart Wallet).';
      } else if (error?.code === 4001) {
        message += 'You rejected the request.';
      } else if (error?.message) {
        message += error.message;
      } else {
        message += 'Please try again or contact support.';
      }
      
      setErrorMessage(message);
    } finally {
      setIsCreatingSubAccount(false);
    }
  };

  const handleConnect = () => {
    connect({ 
      connector: baseAccount({
        appName: 'Your Raffle App',
        appLogoUrl: 'https://your-app-logo-url.com/logo.png',
        appChainIds: [base.id],
        // Enable automatic sub account creation on connect
        subAccounts: {
          creation: 'on-connect', // Automatically create sub account when user connects
          defaultAccount: 'sub', // Use sub account as default
          funding: 'auto', // Auto spend permissions enabled
        }
      })
    });
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        {hasSubAccount && (
          <div className="hidden md:flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Sub Account Active</span>
            </div>
            <BalanceDisplay label="Main Account" balance={Number(balance?.formatted) || 0} />
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-blue-500 text-white">
                  {address ? address.slice(2, 4).toUpperCase() : '?'}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[100px]">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not Connected'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Base Account</p>
                <p className="text-xs leading-none text-muted-foreground truncate">{address}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-2 space-y-2">
              <BalanceDisplay label="Main Account" balance={Number(balance?.formatted) || 0} />
              {hasSubAccount ? (
                <div className="space-y-1">
                  <BalanceDisplay
                    label="Sub Account"
                    balance={Number(subAccountBalance?.formatted) || 0}
                    isSubAccount
                  />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>Frictionless transactions enabled</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sub Account: {subAccount.address.slice(0, 6)}...{subAccount.address.slice(-4)}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowSubAccountModal(true)}
                    disabled={isCheckingSubAccount}
                  >
                    {isCheckingSubAccount ? 'Checking...' : 'Create Sub Account'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Enable seamless transactions without repeated prompts
                  </p>
                </div>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.open('https://account.base.app', '_blank')}>
              <Wallet className="mr-2 h-4 w-4" />
              <span>Manage at account.base.app</span>
            </DropdownMenuItem>
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
                Create a sub account for a seamless, no-popup raffle experience powered by Base Account.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-4">
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-medium">Benefits:</p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Frictionless transactions without repeated signing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Spend directly from your main account balance via spend permissions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Full control and management at account.base.app</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Perfect for high-frequency transactions like raffles</span>
                  </li>
                </ul>
              </div>

              {errorMessage && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-sm text-destructive">{errorMessage}</p>
                </div>
              )}

              <Button
                onClick={createSubAccount}
                disabled={isCreatingSubAccount}
                className="w-full"
              >
                {isCreatingSubAccount ? 'Creating Sub Account...' : 'Create Sub Account'}
              </Button>
              
              <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>This feature requires Base Account (Coinbase Smart Wallet)</p>
                <p>Your sub account will be linked to this app only</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <Button onClick={handleConnect} disabled={isPending} className="gap-2">
      <Wallet className="h-4 w-4" />
      {isPending ? 'Connecting...' : 'Sign in with Base'}
    </Button>
  );
}