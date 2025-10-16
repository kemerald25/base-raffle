import type { Raffle, Ticket, User, Winner, Participant } from './types';
import { PlaceHolderImages } from './placeholder-images';

const users: User[] = [
  { address: '0x1234567890123456789012345678901234567890', sub_account_address: '0xabc...', total_tickets_purchased: 15, total_won: 2.5, total_spent: 0.5, avatar_url: 'https://i.pravatar.cc/150?u=0x123' },
  { address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', sub_account_address: '0xdef...', total_tickets_purchased: 5, total_won: 0, total_spent: 0.1, avatar_url: 'https://i.pravatar.cc/150?u=0xabc' },
  { address: '0xfedcba9876543210fedcba9876543210fedcba98', sub_account_address: '0xghi...', total_tickets_purchased: 25, total_won: 10.1, total_spent: 1.2, avatar_url: 'https://i.pravatar.cc/150?u=0xfed' },
  { address: '0x1111111111111111111111111111111111111111', sub_account_address: '0xjkl...', total_tickets_purchased: 2, total_won: 0, total_spent: 0.05, avatar_url: 'https://i.pravatar.cc/150?u=0x111' },
  { address: '0x2222222222222222222222222222222222222222', sub_account_address: '0x mno...', total_tickets_purchased: 50, total_won: 1.5, total_spent: 2.0, avatar_url: 'https://i.pravatar.cc/150?u=0x222' },
];

const now = new Date();
const raffles: Raffle[] = [
  { 
    id: 1, 
    name: 'ETH Genesis Jackpot', 
    description: 'A chance to win a massive pot of ETH. This is the biggest raffle of the year with a guaranteed prize pool.',
    ticket_price: 0.05, 
    max_tickets_per_user: 10, 
    end_timestamp: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).getTime(), 
    total_tickets_sold: 125,
    max_tickets: 1000,
    prize_pool: 6.25, 
    status: 'active',
    image_url: PlaceHolderImages.find(p => p.id === 'raffle-1')?.imageUrl || '',
    image_hint: PlaceHolderImages.find(p => p.id === 'raffle-1')?.imageHint || '',
  },
  { 
    id: 2, 
    name: 'Golden Ticket', 
    description: 'Your golden opportunity to win a substantial amount of ETH. Limited tickets available, get yours before they are gone.',
    ticket_price: 0.1, 
    max_tickets_per_user: 5, 
    end_timestamp: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).getTime(), 
    total_tickets_sold: 45,
    max_tickets: 500,
    prize_pool: 4.5, 
    status: 'active',
    image_url: PlaceHolderImages.find(p => p.id === 'raffle-2')?.imageUrl || '',
    image_hint: PlaceHolderImages.find(p => p.id === 'raffle-2')?.imageHint || '',
  },
  { 
    id: 3, 
    name: 'The Speeder', 
    description: 'Fast-paced raffle ending in just 24 hours. Quick thrills and a chance at an instant prize.',
    ticket_price: 0.01, 
    max_tickets_per_user: 50, 
    end_timestamp: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).getTime(), 
    total_tickets_sold: 850,
    max_tickets: 5000,
    prize_pool: 8.5, 
    status: 'active',
    image_url: PlaceHolderImages.find(p => p.id === 'raffle-3')?.imageUrl || '',
    image_hint: PlaceHolderImages.find(p => p.id === 'raffle-3')?.imageHint || '',
  },
  { 
    id: 4, 
    name: 'The Collector\'s Draw', 
    description: 'A raffle for the discerning collector. High value, high stakes.',
    ticket_price: 1, 
    max_tickets_per_user: 1, 
    end_timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).getTime(), 
    total_tickets_sold: 10,
    max_tickets: 10,
    prize_pool: 9.5, 
    winner_address: '0xfedcba9876543210fedcba9876543210fedcba98',
    status: 'drawn',
    image_url: PlaceHolderImages.find(p => p.id === 'raffle-4')?.imageUrl || '',
    image_hint: PlaceHolderImages.find(p => p.id === 'raffle-4')?.imageHint || '',
  },
  { 
    id: 5, 
    name: 'Community Choice', 
    description: 'A raffle by the community, for the community. All profits go to the treasury.',
    ticket_price: 0.02, 
    max_tickets_per_user: 20, 
    end_timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).getTime(), 
    total_tickets_sold: 1000,
    max_tickets: 1000,
    prize_pool: 18, 
    winner_address: '0x1234567890123456789012345678901234567890',
    status: 'drawn',
    image_url: PlaceHolderImages.find(p => p.id === 'raffle-5')?.imageUrl || '',
    image_hint: PlaceHolderImages.find(p => p.id === 'raffle-5')?.imageHint || '',
  },
   { 
    id: 6, 
    name: 'The Challenger Deep', 
    description: 'A deep prize pool for those willing to dive in. The biggest prize on the platform yet!',
    ticket_price: 0.2, 
    max_tickets_per_user: 10, 
    end_timestamp: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).getTime(), 
    total_tickets_sold: 300,
    max_tickets: 2000,
    prize_pool: 60, 
    status: 'active',
    image_url: PlaceHolderImages.find(p => p.id === 'raffle-6')?.imageUrl || '',
    image_hint: PlaceHolderImages.find(p => p.id === 'raffle-6')?.imageHint || '',
  },
];

const tickets: Ticket[] = [
  { id: 't1', raffle_id: 1, user_address: '0x1234567890123456789012345678901234567890', quantity: 5, purchase_timestamp: new Date(now.getTime() - 60 * 60 * 1000).getTime() },
  { id: 't2', raffle_id: 1, user_address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', quantity: 10, purchase_timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).getTime() },
  { id: 't3', raffle_id: 2, user_address: '0x1234567890123456789012345678901234567890', quantity: 1, purchase_timestamp: new Date(now.getTime() - 30 * 60 * 1000).getTime() },
  { id: 't4', raffle_id: 4, user_address: '0xfedcba9876543210fedcba9876543210fedcba98', quantity: 1, purchase_timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).getTime() },
  { id: 't5', raffle_id: 5, user_address: '0x1234567890123456789012345678901234567890', quantity: 10, purchase_timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).getTime() },
  { id: 't6', raffle_id: 5, user_address: '0x2222222222222222222222222222222222222222', quantity: 20, purchase_timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).getTime() },
  { id: 't7', raffle_id: 1, user_address: '0xfedcba9876543210fedcba9876543210fedcba98', quantity: 5, purchase_timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).getTime() },
  { id: 't8', raffle_id: 3, user_address: '0x2222222222222222222222222222222222222222', quantity: 50, purchase_timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).getTime() },
  { id: 't9', raffle_id: 6, user_address: '0x1234567890123456789012345678901234567890', quantity: 10, purchase_timestamp: new Date().getTime() },
  { id: 't10', raffle_id: 6, user_address: '0xfedcba9876543210fedcba9876543210fedcba98', quantity: 10, purchase_timestamp: new Date().getTime() },
];


const winners: Winner[] = raffles
  .filter(r => r.status === 'drawn' && r.winner_address)
  .map(r => ({
    id: `w-${r.id}`,
    raffle_id: r.id,
    winner_address: r.winner_address!,
    prize_amount: r.prize_pool * 0.9, // assuming 90% prize pool
    won_at: r.end_timestamp,
    user: users.find(u => u.address === r.winner_address)!,
  }));


// Data access functions
export const getRaffles = (): Raffle[] => raffles;
export const getActiveRaffles = (): Raffle[] => raffles.filter(r => r.status === 'active');
export const getRaffleById = (id: number): Raffle | undefined => raffles.find(r => r.id === id);

export const getTicketsByUser = (userAddress: string): Ticket[] => tickets.filter(t => t.user_address === userAddress);
export const getTicketsByRaffle = (raffleId: number): Ticket[] => tickets.filter(t => t.raffle_id === raffleId);

export const getParticipantsByRaffle = (raffleId: number): Participant[] => {
  const raffleTickets = getTicketsByRaffle(raffleId);
  const participantsMap = new Map<string, number>();

  raffleTickets.forEach(ticket => {
    participantsMap.set(ticket.user_address, (participantsMap.get(ticket.user_address) || 0) + ticket.quantity);
  });
  
  return Array.from(participantsMap.entries()).map(([user_address, quantity]) => ({
    user_address,
    quantity,
    user: users.find(u => u.address === user_address)!
  })).sort((a, b) => b.quantity - a.quantity);
};


export const getUsers = (): User[] => users;
export const getUserById = (address: string): User | undefined => users.find(u => u.address === address);

export const getWinners = (): Winner[] => winners.sort((a,b) => b.won_at - a.won_at);
export const getRecentWinners = (): Winner[] => getWinners();

export const getTotalPrizesWon = (): number => winners.reduce((total, winner) => total + winner.prize_amount, 0);

export const getLeaderboardByWins = (): User[] => {
    return users.slice().sort((a, b) => b.total_won - a.total_won);
};

export const getLeaderboardByTickets = (): User[] => {
    return users.slice().sort((a, b) => b.total_tickets_purchased - a.total_tickets_purchased);
};
