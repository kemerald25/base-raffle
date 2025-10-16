"use server";

import { generateContextualNotification } from '@/ai/flows/contextual-notifications';
import { revalidatePath } from 'next/cache';

type FormState = {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error' | '';
};

export async function purchaseTicketAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const quantity = Number(formData.get('quantity'));
  const raffleId = Number(formData.get('raffleId'));
  const ticketPrice = Number(formData.get('ticketPrice'));
  const totalCost = quantity * ticketPrice;

  // In a real app, you would get this from the connected user's wallet
  const walletBalance = 0; // ETH
  const spendingLimit = 0; // ETH

  try {
    // Simulate checking if the sub-account has enough balance
    if (walletBalance < totalCost) {
      const result = await generateContextualNotification({
        userAction: `Failed to purchase ${quantity} ticket(s) for Raffle #${raffleId}.`,
        walletBalance: walletBalance,
        spendingLimit: spendingLimit,
      });
      return { message: "Insufficient funds in Sub Account. " + result.notificationMessage, type: result.toastType };
    }

    // Simulate the transaction
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newBalance = walletBalance - totalCost;

    // Call GenAI flow for a success notification
    const result = await generateContextualNotification({
        userAction: `Successfully purchased ${quantity} ticket(s) for Raffle #${raffleId}.`,
        walletBalance: newBalance,
        spendingLimit: spendingLimit,
    });
    
    // In a real app, you'd update the database here.
    
    // Revalidate paths to show updated data
    revalidatePath(`/raffle/${raffleId}`);
    revalidatePath('/my-tickets');

    return { message: result.notificationMessage, type: result.toastType };

  } catch (error) {
    console.error('Purchase failed:', error);
    return {
      message: 'An unexpected error occurred. Please try again.',
      type: 'error',
    };
  }
}
