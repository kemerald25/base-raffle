"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Raffle } from '@/lib/types';
import { Loader2, Minus, Plus, Ticket } from 'lucide-react';
import { useAccount } from 'wagmi';
import { encodeFunctionData, parseEther } from 'viem';
import { contractAddress, contractAbi as RaffleABI } from '@/lib/contract';

interface TicketPurchaseFormProps {
    raffle: Raffle;
}

interface EIP1193Provider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
}

export function TicketPurchaseForm({ raffle }: TicketPurchaseFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [totalCost, setTotalCost] = useState(raffle.ticket_price);
  const [subAccountAddress, setSubAccountAddress] = useState<string>('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { address, isConnected, connector } = useAccount();
  const { toast } = useToast();

  // Get provider from connector with proper typing
  const getProvider = async (): Promise<EIP1193Provider | null> => {
    if (!connector) return null;
    try {
      const provider = await connector.getProvider() as EIP1193Provider;
      return provider;
    } catch (error) {
      console.error('Failed to get provider:', error);
      return null;
    }
  };

  // Check for sub account on mount and when wallet connects
  useEffect(() => {
    const checkSubAccount = async () => {
      if (!isConnected || !address) return;

      try {
        const provider = await getProvider();
        
        if (!provider || typeof provider.request !== 'function') {
          return;
        }

        // Use wallet_getSubAccounts to check for existing sub account
        const response = await provider.request({
          method: 'wallet_getSubAccounts',
          params: [{
            version: '1',
            account: address,
            domain: typeof window !== 'undefined' ? window.location.origin : undefined,
          }]
        }) as any;

        // Check if sub account exists
        if (response?.subAccounts && response.subAccounts.length > 0) {
          const existingSubAccount = response.subAccounts[0];
          setSubAccountAddress(existingSubAccount.address);
          console.log('Sub account found:', existingSubAccount.address);
        } else {
          setSubAccountAddress('');
        }
      } catch (error: any) {
        // Silently handle expected errors
        if (error?.code === -32601) {
          console.log('wallet_getSubAccounts not supported');
        } else if (error?.code !== 4100 && error?.code !== -32603) {
          console.error('Failed to check for sub account:', error);
        }
      }
    };

    checkSubAccount();
    
    // Poll for sub account every 3 seconds to detect when user creates one
    const interval = setInterval(checkSubAccount, 3000);
    
    return () => clearInterval(interval);
  }, [isConnected, address, connector]);

  const handleQuantityChange = (newQuantity: number) => {
    const maxQuantity = raffle.max_tickets_per_user;
    let finalQuantity = Math.max(1, newQuantity);
    if (finalQuantity > maxQuantity) {
        finalQuantity = maxQuantity;
    }
    setQuantity(finalQuantity);
    setTotalCost(finalQuantity * raffle.ticket_price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subAccountAddress) {
      toast({
        title: 'Sub Account Required',
        description: 'Please create a Sub Account from your wallet menu to enable instant, no-popup purchases.',
        variant: 'destructive',
      });
      return;
    }

    if (!isConnected || !address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsPurchasing(true);

    try {
      const provider = await getProvider();
      
      if (!provider || typeof provider.request !== 'function') {
        throw new Error('Provider not available');
      }

      // Encode the contract function call
      const data = encodeFunctionData({
        abi: RaffleABI,
        functionName: 'buyTickets',
        args: [BigInt(raffle.id), BigInt(quantity)],
      });

      const valueInWei = parseEther(totalCost.toString());

      console.log('Sending transaction from sub account:', subAccountAddress);
      console.log('Contract:', contractAddress);
      console.log('Value:', valueInWei.toString());

      // Use wallet_sendCalls (EIP-5792) for sub account transactions
      const txHash = await provider.request({
        method: 'wallet_sendCalls',
        params: [{
          version: '1.0',
          chainId: `0x${(84532).toString(16)}`, // Base Sepolia chain ID in hex
          from: subAccountAddress,
          calls: [{
            to: contractAddress,
            data: data,
            value: `0x${valueInWei.toString(16)}`, // Convert to hex string
          }]
        }]
      });

      console.log('Transaction sent:', txHash);

      toast({
        title: 'Success!',
        description: `Successfully purchased ${quantity} ticket${quantity > 1 ? 's' : ''}! Transaction is being processed.`,
      });

      // Reset quantity after successful purchase
      setQuantity(1);
      setTotalCost(raffle.ticket_price);

      // Optional: Wait a bit and refresh the page or raffle data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('Transaction error:', error);
      
      let errorMessage = 'Failed to purchase tickets. ';
      
      if (error?.code === 4001) {
        errorMessage += 'Transaction was rejected.';
      } else if (error?.code === -32602) {
        errorMessage += 'Invalid transaction parameters.';
      } else if (error?.code === -32603) {
        errorMessage += 'Internal error. Please try again.';
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      toast({
        title: 'Purchase Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const hasSubAccount = !!subAccountAddress;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isPurchasing}
            >
                <Minus className="h-4 w-4" />
            </Button>
            <Input
                id="quantity"
                name="quantity"
                type="number"
                className="h-11 text-center text-lg font-bold"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 1)}
                min="1"
                max={raffle.max_tickets_per_user}
                disabled={isPurchasing}
            />
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= raffle.max_tickets_per_user || isPurchasing}
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
        <p className="text-sm text-muted-foreground">Max per user: {raffle.max_tickets_per_user}</p>
      </div>
      
      <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
        <span className="font-medium">Total Cost</span>
        <span className="font-bold text-lg text-primary">
            {totalCost.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} ETH
        </span>
      </div>

      <Button 
        type="submit" 
        size="lg" 
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" 
        disabled={isPurchasing || !hasSubAccount || !isConnected}
      >
        {isPurchasing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Transaction...
          </>
        ) : !isConnected ? (
          <>
            <Ticket className="mr-2 h-4 w-4" />
            Connect Wallet First
          </>
        ) : !hasSubAccount ? (
          <>
            <Ticket className="mr-2 h-4 w-4" />
            Create Sub Account First
          </>
        ) : (
          <>
            <Ticket className="mr-2 h-4 w-4" />
            Buy Tickets Instantly
          </>
        )}
      </Button>

      {hasSubAccount ? (
        <p className="text-xs text-center text-muted-foreground">
          ✓ Sub Account active ({subAccountAddress.slice(0, 6)}...{subAccountAddress.slice(-4)}) - Enjoy seamless, no-popup purchases!
        </p>
      ) : isConnected ? (
        <p className="text-xs text-center text-yellow-600 dark:text-yellow-500">
          ⚠ Create a Sub Account from your wallet menu to enable instant purchases without transaction popups.
        </p>
      ) : (
        <p className="text-xs text-center text-muted-foreground">
          Please connect your Base Account to continue.
        </p>
      )}
    </form>
  );
}