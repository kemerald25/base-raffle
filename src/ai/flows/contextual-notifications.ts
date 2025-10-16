'use server';

/**
 * @fileOverview A flow for generating contextual UI notifications and toasts based on user actions and wallet balance.
 *
 * - generateContextualNotification - A function that generates a notification message.
 * - ContextualNotificationInput - The input type for the generateContextualNotification function.
 * - ContextualNotificationOutput - The return type for the generateContextualNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextualNotificationInputSchema = z.object({
  userAction: z.string().describe('The action performed by the user (e.g., ticket purchase, sub-account creation).'),
  walletBalance: z.number().describe('The current wallet balance of the user.'),
  spendingLimit: z.number().optional().describe('The spending limit set by the user.'),
  raffleStatus: z.string().optional().describe('The current status of the raffle (e.g., active, ended, drawn).'),
  prizeAmount: z.number().optional().describe('The prize amount for a raffle.'),
});
export type ContextualNotificationInput = z.infer<typeof ContextualNotificationInputSchema>;

const ContextualNotificationOutputSchema = z.object({
  notificationMessage: z.string().describe('The generated notification message to display to the user.'),
  toastType: z.enum(['success', 'info', 'warning', 'error']).describe('The type of toast to display (success, info, warning, error).'),
});
export type ContextualNotificationOutput = z.infer<typeof ContextualNotificationOutputSchema>;

export async function generateContextualNotification(input: ContextualNotificationInput): Promise<ContextualNotificationOutput> {
  return contextualNotificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextualNotificationPrompt',
  input: {schema: ContextualNotificationInputSchema},
  output: {schema: ContextualNotificationOutputSchema},
  prompt: `You are a UI notification expert, skilled at creating helpful and informative messages for users of a decentralized application.

  Based on the user's action, wallet balance, spending limit, raffle status, and prize amount, generate a concise and user-friendly notification message. Also determine the most appropriate toast type (success, info, warning, error) for the notification.

  Here's the information:
  User Action: {{{userAction}}}
  Wallet Balance: {{{walletBalance}}}
  Spending Limit: {{{spendingLimit}}}
  Raffle Status: {{{raffleStatus}}}
  Prize Amount: {{{prizeAmount}}}

  Ensure the notification is tailored to the context and provides clear guidance or feedback to the user.

  Examples:
  - If the user successfully purchases a ticket, generate a success message confirming the purchase.
  - If the user's wallet balance is low, generate a warning message prompting them to add funds.
  - If a raffle has ended and the user has won, generate a success message congratulating them and informing them about the prize.
`,
});

const contextualNotificationFlow = ai.defineFlow(
  {
    name: 'contextualNotificationFlow',
    inputSchema: ContextualNotificationInputSchema,
    outputSchema: ContextualNotificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
