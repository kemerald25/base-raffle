
"use client";

import { useReadContract, useReadContracts } from 'wagmi';
import { contractAddress, contractAbi } from '@/lib/contract';
import { Raffle } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { formatEther } from 'viem';

const raffleContract = {
  address: contractAddress,
  abi: contractAbi,
} as const;

const raffleStatusMap: Record<number, Raffle['status']> = {
  0: 'active',
  1: 'ended',
  2: 'drawn',
  3: 'cancelled',
};

function formatRaffleData(raffleData: any, id: bigint): Raffle {
  const raffleImage = PlaceHolderImages.find(p => p.id === `raffle-${id}`) || PlaceHolderImages[0];
  return {
    id: Number(id),
    name: `Raffle #${id}`, // The contract doesn't have a name field, so we generate one.
    description: "Participate in this exciting raffle for a chance to win amazing prizes!", // Placeholder description
    ticket_price: parseFloat(formatEther(raffleData.ticketPrice)),
    max_tickets_per_user: Number(raffleData.maxTicketsPerUser),
    end_timestamp: Number(raffleData.endTimestamp) * 1000, // Convert to milliseconds
    total_tickets_sold: Number(raffleData.totalTicketsSold),
    max_tickets: 1000, // This seems to be missing from the contract, using a placeholder
    prize_pool: parseFloat(formatEther(raffleData.prizePool)),
    winner_address: raffleData.winner === '0x0000000000000000000000000000000000000000' ? undefined : raffleData.winner,
    status: raffleStatusMap[raffleData.status] || 'ended',
    image_url: raffleImage.imageUrl,
    image_hint: raffleImage.imageHint,
    createdAt: Number(raffleData.createdAt) * 1000,
  };
}

export function useActiveRaffles() {
  const { data: activeRaffleIds, isLoading: isLoadingIds, error: errorIds } = useReadContract({
    ...raffleContract,
    functionName: 'getActiveRaffles',
  });

  const raffleContracts = activeRaffleIds
    ? activeRaffleIds.map(id => ({
        ...raffleContract,
        functionName: 'getRaffle',
        args: [id],
      }))
    : [];

  const { data: rafflesData, isLoading: isLoadingRaffles, error: errorRaffles } = useReadContracts({
    contracts: raffleContracts,
    query: {
      enabled: !!activeRaffleIds && activeRaffleIds.length > 0,
    }
  });

  const raffles = rafflesData?.map((raffle, index) => {
    const id = activeRaffleIds?.[index] ?? 0n;
    return formatRaffleData(raffle.result, id);
  }).filter(r => r.status === 'active') || [];

  return {
    raffles,
    isLoading: isLoadingIds || isLoadingRaffles,
    error: errorIds || errorRaffles,
  };
}
