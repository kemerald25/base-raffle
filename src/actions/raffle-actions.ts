'use server';

import { z } from 'zod';
import { createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { contractAddress, contractAbi } from '@/lib/contract';

const schema = z.object({
  raffleId: z.coerce.number(),
  ticketPrice: z.coerce.number(),
  quantity: z.coerce.number(),
  subAccountAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

// Define the raffle structure type for better type safety
type RaffleStruct = {
  id: bigint;
  ticketPrice: bigint;
  maxTicketsPerUser: bigint;
  endTimestamp: bigint;
  totalTicketsSold: bigint;
  prizePool: bigint;
  winner: `0x${string}`;
  status: number;
  createdAt: bigint;
};

export async function purchaseTicketAction(
  prevState: { message: string; type: string },
  formData: FormData
) {
  try {
    const validatedFields = schema.safeParse({
      raffleId: formData.get('raffleId'),
      ticketPrice: formData.get('ticketPrice'),
      quantity: formData.get('quantity'),
      subAccountAddress: formData.get('subAccountAddress'),
    });

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      
      // Check if the error is specifically about the sub account address
      if (errors.subAccountAddress) {
        return { 
          message: 'Please create a Sub Account first to enable instant purchases.', 
          type: 'error' 
        };
      }
      
      return { message: 'Invalid form data. Please try again.', type: 'error' };
    }
    
    const { raffleId, ticketPrice, quantity, subAccountAddress } = validatedFields.data;
    const totalCost = quantity * ticketPrice;

    // Use Base Sepolia for testing, change to base for production
    const chain = process.env.NEXT_PUBLIC_CHAIN === 'mainnet' ? base : baseSepolia;

    // Create public client for reading blockchain data
    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    // Check if raffle exists and is active
    try {
      const raffle = await publicClient.readContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'getRaffle',
        args: [BigInt(raffleId)],
      }) as RaffleStruct;

      if (!raffle) {
        return {
          message: 'Raffle not found.',
          type: 'error',
        };
      }

      // Check if raffle is active
      const isActive = await publicClient.readContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'isRaffleActive',
        args: [BigInt(raffleId)],
      }) as boolean;

      if (!isActive) {
        return {
          message: 'This raffle is no longer active.',
          type: 'error',
        };
      }

      // Check how many tickets user already has
      const userTicketCount = await publicClient.readContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'getUserTickets',
        args: [BigInt(raffleId), subAccountAddress as `0x${string}`],
      }) as bigint;

      // Access maxTicketsPerUser using property name instead of array index
      const maxTicketsPerUser = Number(raffle.maxTicketsPerUser);
      
      if (Number(userTicketCount) + quantity > maxTicketsPerUser) {
        return {
          message: `You can only purchase ${maxTicketsPerUser - Number(userTicketCount)} more ticket(s) for this raffle.`,
          type: 'error',
        };
      }

    } catch (error: any) {
      console.error('Error checking raffle status:', error);
      return {
        message: 'Failed to verify raffle status. Please try again.',
        type: 'error',
      };
    }

    // Note: The actual transaction needs to be sent from the client side
    // because we need the user's wallet to sign the transaction
    // This is a server action that validates the data before the client sends the transaction
    
    console.log('Purchase ticket data validated:', {
      raffleId,
      ticketPrice,
      quantity,
      totalCost,
      subAccountAddress,
      contractAddress,
      chain: chain.name,
    });

    // Return success with transaction details that the client will use
    return {
      message: `Ready to purchase ${quantity} ticket${quantity > 1 ? 's' : ''} (${totalCost.toFixed(4)} ETH). Please confirm the transaction in your wallet.`,
      type: 'info',
      data: {
        raffleId,
        quantity,
        totalCost,
        subAccountAddress,
      }
    };
  } catch (e: any) {
    console.error('Purchase ticket error:', e);
    return { message: 'An unexpected error occurred.', type: 'error' };
  }
}