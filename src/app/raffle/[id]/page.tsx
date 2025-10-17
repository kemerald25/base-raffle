
"use client";

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CountdownTimer } from '@/components/countdown-timer';
import { TicketPurchaseForm } from './ticket-purchase-form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Users, Ticket as TicketIcon } from 'lucide-react';
import type { Participant } from '@/lib/types';
import { useRaffle } from '@/hooks/use-raffle';
import { Skeleton } from '@/components/ui/skeleton';

export default function RaffleDetailPage({ params }: { params: { id: string } }) {
  const raffleId = parseInt(params.id, 10);
  const { raffle, isLoading, isError } = useRaffle(raffleId);

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="grid lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <Skeleton className="h-[600px] w-full" />
                </div>
                <div className="lg:col-span-2">
                    <Skeleton className="h-[600px] w-full" />
                </div>
            </div>
      </div>
    )
  }
  
  if (isError || !raffle) {
    notFound();
  }

  const participants: Participant[] = [];
  const progress = (raffle.total_tickets_sold / raffle.max_tickets) * 100;

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div className="relative h-96 w-full">
              <Image
                src={raffle.image_url}
                alt={raffle.name}
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 60vw"
                priority
                data-ai-hint={raffle.image_hint}
              />
            </div>
            <CardContent className="p-6">
              <h1 className="text-3xl font-bold font-headline mb-2">{raffle.name}</h1>
              <p className="text-muted-foreground">{raffle.description}</p>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <Users /> Participants ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Tickets</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.length > 0 ? participants.map(p => (
                    <TableRow key={p.user_address}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={p.user.avatar_url} />
                            <AvatarFallback>{p.user.address.slice(2, 4).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium truncate">{`${p.user.address.slice(0, 6)}...${p.user.address.slice(-4)}`}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">{p.quantity}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                            No participants yet. Be the first to join!
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Raffle Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Ends In</p>
                  <CountdownTimer endTime={raffle.end_timestamp} />
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Prize Pool</p>
                  <p className="text-3xl font-bold text-primary">
                    {raffle.prize_pool.toLocaleString('en-US', { style: 'currency', currency: 'ETH' })}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tickets Sold</span>
                    <span>{raffle.total_tickets_sold} / {raffle.max_tickets}</span>
                  </div>
                  <Progress value={progress} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                        <TicketIcon className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                        <div>
                            <p className="text-muted-foreground">Ticket Price</p>
                            <p className="font-semibold">{raffle.ticket_price} ETH</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <Trophy className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                        <div>
                            <p className="text-muted-foreground">Max Per User</p>
                            <p className="font-semibold">{raffle.max_tickets_per_user} tickets</p>
                        </div>
                    </div>
                </div>
              </CardContent>
            </Card>
            
            {raffle.status === 'active' && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Buy Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <TicketPurchaseForm raffle={raffle} />
                </CardContent>
              </Card>
            )}

            {raffle.status === 'drawn' && raffle.winner_address && (
                 <Card className="bg-green-500/10 border-green-500">
                    <CardHeader className="text-center">
                        <CardTitle className="font-headline text-green-400 flex items-center justify-center gap-2">
                            <Trophy /> Winner Announced!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                       <p className="text-sm text-muted-foreground">Congratulations to:</p>
                       <p className="font-mono text-lg font-semibold truncate mt-1">{raffle.winner_address}</p>
                    </CardContent>
                 </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
