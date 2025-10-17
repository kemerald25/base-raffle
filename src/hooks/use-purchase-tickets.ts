import { useState } from 'react';
import { useWalletClient, usePublicClient } from 'wagmi';
import { parseEther } from 'viem';
import { contractAddress, contractAbi } from '@/lib/contract';

export function usePurchaseTickets() {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const purchaseTickets = async (
    raffleId: number,
    quantity: number,
    totalCost: number,
    subAccountAddress: `0x${string}`
  ) => {
    if (!walletClient || !publicClient) {
      throw new Error('Wallet not connected');
    }

    setIsPurchasing(true);

    try {
      // Send transaction from sub account
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'buyTickets',
        args: [BigInt(raffleId), BigInt(quantity)],
        account: subAccountAddress,
        value: parseEther(totalCost.toString()),
        chain: walletClient.chain,
      });

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        confirmations: 1,
      });

      if (receipt.status === 'success') {
        return {
          success: true,
          hash,
          message: `Successfully purchased ${quantity} ticket${quantity > 1 ? 's' : ''}!`,
        };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      // Handle specific errors
      if (error?.message?.includes('User rejected')) {
        throw new Error('Transaction was rejected');
      } else if (error?.message?.includes('insufficient funds')) {
        throw new Error('Insufficient funds in your sub account');
      } else if (error?.message?.includes('Max tickets')) {
        throw new Error('You have reached the maximum tickets per user');
      } else {
        throw new Error(error?.message || 'Failed to purchase tickets');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  return { purchaseTickets, isPurchasing };
}