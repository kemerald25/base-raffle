export interface Raffle {
  id: number;
  name: string;
  description: string;
  ticket_price: number;
  max_tickets_per_user: number;
  end_timestamp: number;
  total_tickets_sold: number;
  max_tickets: number;
  prize_pool: number;
  winner_address?: string;
  status: 'active' | 'ended' | 'drawn';
  image_url: string;
  image_hint: string;
}

export interface Ticket {
  id: string;
  raffle_id: number;
  user_address: string;
  quantity: number;
  purchase_timestamp: number;
}

export interface User {
  address: string;
  sub_account_address?: string;
  total_tickets_purchased: number;
  total_won: number;
  total_spent: number;
  avatar_url: string;
}

export interface Winner {
  id: string;
  raffle_id: number;
  winner_address: string;
  prize_amount: number;
  won_at: number;
  user: User;
}

export interface Participant {
  user_address: string;
  quantity: number;
  user: User;
}
