"use client";

import { useState, useEffect, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { purchaseTicketAction } from '@/actions/raffle-actions';
import type { Raffle } from '@/lib/types';
import { Loader2, Minus, Plus, Ticket } from 'lucide-react';

interface TicketPurchaseFormProps {
    raffle: Raffle;
}

const initialState = {
  message: '',
  type: '',
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                </>
            ) : (
                <>
                    <Ticket className="mr-2 h-4 w-4" />
                    Buy Tickets Instantly
                </>
            )}
        </Button>
    )
}

export function TicketPurchaseForm({ raffle }: TicketPurchaseFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [totalCost, setTotalCost] = useState(raffle.ticket_price);
  
  const [state, formAction] = useFormState(purchaseTicketAction, initialState);
  const { toast } = useToast();
  
  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.type === 'success' ? 'Purchase Successful!' : (state.type === 'warning' ? 'Heads Up!' : 'Error'),
        description: state.message,
        variant: state.type === 'error' ? 'destructive' : 'default',
      });
    }
  }, [state, toast]);

  const handleQuantityChange = (newQuantity: number) => {
    const maxQuantity = raffle.max_tickets_per_user;
    let finalQuantity = Math.max(1, newQuantity);
    if (finalQuantity > maxQuantity) {
        finalQuantity = maxQuantity;
    }
    setQuantity(finalQuantity);
    setTotalCost(finalQuantity * raffle.ticket_price);
  };

  return (
    <form action={formAction} className="space-y-6">
       <input type="hidden" name="raffleId" value={raffle.id} />
       <input type="hidden" name="ticketPrice" value={raffle.ticket_price} />
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
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
            />
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= raffle.max_tickets_per_user}
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

      <SubmitButton />

      <p className="text-xs text-center text-muted-foreground">
        Your Sub Account will be used for a seamless, no-popup purchase.
      </p>
    </form>
  );
}
