
"use client";

import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { contractAbi, contractAddress } from '@/lib/contract';
import { parseEther } from 'viem';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminPage() {
  const { address: connectedAddress, isConnected } = useAccount();
  const { toast } = useToast();
  const { writeContractAsync } = useWriteContract();

  const [createRaffleArgs, setCreateRaffleArgs] = useState({
    ticketPrice: '0.001',
    maxTickets: '100',
    durationDays: '7',
  });
  const [drawRaffleId, setDrawRaffleId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const { data: ownerAddress } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'owner',
  });

  const isOwner = isConnected && connectedAddress === ownerAddress;

  const handleCreateRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      toast({ title: 'Error', description: 'Only the contract owner can create raffles.', variant: 'destructive' });
      return;
    }

    setIsCreating(true);
    try {
      const ticketPriceInWei = parseEther(createRaffleArgs.ticketPrice);
      const maxTickets = BigInt(createRaffleArgs.maxTickets);
      const durationSeconds = BigInt(createRaffleArgs.durationDays) * 86400n; // 24 * 60 * 60

      const txHash = await writeContractAsync({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'createRaffle',
        args: [ticketPriceInWei, maxTickets, durationSeconds],
      });

      toast({
        title: 'Transaction Sent',
        description: `Creating raffle... Tx: ${txHash}`,
      });
      
    } catch (error: any) {
      console.error('Failed to create raffle:', error);
      toast({
        title: 'Error Creating Raffle',
        description: error.shortMessage || error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDrawWinner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      toast({ title: 'Error', description: 'Only the contract owner can draw winners.', variant: 'destructive' });
      return;
    }
    if (!drawRaffleId) {
      toast({ title: 'Error', description: 'Please enter a Raffle ID.', variant: 'destructive' });
      return;
    }

    setIsDrawing(true);
    try {
      const txHash = await writeContractAsync({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'drawWinner',
        args: [BigInt(drawRaffleId)],
      });
      
      toast({
        title: 'Transaction Sent',
        description: `Drawing winner for raffle #${drawRaffleId}... Tx: ${txHash}`,
      });

    } catch (error: any) {
      console.error('Failed to draw winner:', error);
      toast({
        title: 'Error Drawing Winner',
        description: error.shortMessage || error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDrawing(false);
    }
  };
  
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 text-center">
        <h1 className="text-3xl font-bold font-headline mb-4">Admin Panel</h1>
        <p className="text-muted-foreground">Please connect your wallet to access the admin panel.</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 text-center">
        <h1 className="text-3xl font-bold font-headline mb-4">Access Denied</h1>
        <p className="text-muted-foreground">You are not authorized to view this page. Only the contract owner can access the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Admin Panel</h1>
        <p className="mt-2 text-muted-foreground">Manage your Onchain Raffle contract.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Raffle</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRaffle} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ticketPrice">Ticket Price (ETH)</Label>
                <Input
                  id="ticketPrice"
                  type="number"
                  step="0.0001"
                  value={createRaffleArgs.ticketPrice}
                  onChange={(e) => setCreateRaffleArgs({ ...createRaffleArgs, ticketPrice: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTickets">Max Tickets Per User</Label>
                <Input
                  id="maxTickets"
                  type="number"
                  value={createRaffleArgs.maxTickets}
                  onChange={(e) => setCreateRaffleArgs({ ...createRaffleArgs, maxTickets: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationDays">Duration (Days)</Label>
                <Input
                  id="durationDays"
                  type="number"
                  value={createRaffleArgs.durationDays}
                  onChange={(e) => setCreateRaffleArgs({ ...createRaffleArgs, durationDays: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Raffle
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-8">
            <Card>
            <CardHeader>
                <CardTitle>Draw Winner</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleDrawWinner} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="raffleId">Raffle ID</Label>
                    <Input
                    id="raffleId"
                    type="number"
                    placeholder="e.g., 1"
                    value={drawRaffleId}
                    onChange={(e) => setDrawRaffleId(e.target.value)}
                    required
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isDrawing}>
                    {isDrawing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Draw Winner & Distribute Prize
                </Button>
                </form>
            </CardContent>
            </Card>

            <Alert>
                <AlertTitle>How It Works</AlertTitle>
                <AlertDescription>
                   The "Draw Winner" function securely selects a winner onchain and automatically transfers the prize pool to their wallet, minus the 10% treasury fee.
                </AlertDescription>
            </Alert>
        </div>

      </div>
    </div>
  );
}
