
'use client'

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Ticket, Trophy, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RaffleCard } from '@/components/raffle-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, formatDistanceToNow } from 'date-fns';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Winner } from '@/lib/types';
import { useActiveRaffles } from '@/hooks/use-raffles';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { raffles: activeRaffles, isLoading } = useActiveRaffles();
  const totalPrizesWon = 0;
  const recentWinners: Winner[] = [];
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative w-full py-20 md:py-32 lg:py-40 bg-card overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 -z-10"></div>
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-block bg-primary text-primary-foreground rounded-full px-4 py-1 text-sm font-medium mb-4">
              ⚡ Zero Pop-ups, Instant Play
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground font-headline">
              The Future of Onchain Raffles is Here
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground">
              Experience seamless, no-popup ticket purchases with Base Sub Accounts. Deposit once, play instantly.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/raffles">
                  Explore Active Raffles <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#how-it-works">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">
              Active Raffles
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Your chance to win big is just a click away. No transaction pop-ups, just pure excitement.
            </p>
          </div>
          {isLoading ? (
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-[480px] w-full" />
                <Skeleton className="h-[480px] w-full" />
                <Skeleton className="h-[480px] w-full" />
             </div>
          ) : activeRaffles.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeRaffles.slice(0, 3).map((raffle) => (
                <RaffleCard key={raffle.id} raffle={raffle} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No active raffles at the moment. Check back soon!</p>
          )}
          <div className="text-center mt-12">
            <Button asChild variant="link" className="text-primary text-lg">
              <Link href="/raffles">
                View All Raffles <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="w-full py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              A revolutionary 3-step process for a frictionless raffle experience.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-4 mb-4">
                <div className="bg-primary rounded-full p-3 text-primary-foreground">
                  <Users className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-headline">1. Create Sub Account</h3>
              <p className="text-muted-foreground">One-time setup to create your secure, app-specific wallet with a spending limit you control.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-4 mb-4">
                <div className="bg-primary rounded-full p-3 text-primary-foreground">
                  <Ticket className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-headline">2. Buy Tickets Instantly</h3>
              <p className="text-muted-foreground">Purchase tickets for any raffle without ever seeing a wallet pop-up. It's that fast.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-4 mb-4">
                <div className="bg-primary rounded-full p-3 text-primary-foreground">
                  <Trophy className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-headline">3. Win & Get Paid</h3>
              <p className="text-muted-foreground">Winners are drawn provably fair onchain. Prizes are deposited to your account automatically.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <Trophy className="text-accent" />
                  Recent Winners
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentWinners.length > 0 ? (
                  <ul className="space-y-4">
                    {recentWinners.map((winner) => (
                      <li key={winner.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={winner.user.avatar_url} alt={winner.user.address} />
                            <AvatarFallback>{winner.user.address.slice(2, 4).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold truncate">{`${winner.user.address.slice(0, 6)}...${winner.user.address.slice(-4)}`}</p>
                            <p className="text-sm text-muted-foreground">
                              Won in Raffle #{winner.raffle_id} &bull; {formatDistanceToNow(new Date(winner.won_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-500">
                            {winner.prize_amount.toLocaleString('en-US', { style: 'currency', currency: 'ETH' })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(winner.won_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No recent winners.</p>
                )}
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center justify-center text-center bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="font-headline">Total Prizes Won</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl md:text-6xl font-bold">
                  {totalPrizesWon.toLocaleString('en-US', { style: 'currency', currency: 'ETH', minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </p>
                <p className="mt-2 text-primary-foreground/80">Across all raffles on the platform</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
