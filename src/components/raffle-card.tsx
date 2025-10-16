import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Ticket } from 'lucide-react';

import type { Raffle } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CountdownTimer } from './countdown-timer';

interface RaffleCardProps {
  raffle: Raffle;
}

export function RaffleCard({ raffle }: RaffleCardProps) {
  const progress = (raffle.total_tickets_sold / raffle.max_tickets) * 100;

  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={raffle.image_url}
            alt={raffle.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint={raffle.image_hint}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-6">
        <CardTitle className="mb-2 font-headline truncate">{raffle.name}</CardTitle>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">Prize Pool</p>
          <p className="text-2xl font-bold text-primary">
            {raffle.prize_pool.toLocaleString('en-US', { style: 'currency', currency: 'ETH' })}
          </p>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{raffle.total_tickets_sold} / {raffle.max_tickets} tickets</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="text-center bg-muted/50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">Ends In</p>
          <CountdownTimer endTime={raffle.end_timestamp} />
        </div>
      </CardContent>
      <CardFooter className="p-6 bg-card border-t">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-accent" />
            <span className="font-semibold">{raffle.ticket_price} ETH</span>
          </div>
          <Button asChild>
            <Link href={`/raffle/${raffle.id}`}>
              View Raffle <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
