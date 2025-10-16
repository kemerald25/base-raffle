"use client";

import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from '@/lib/types';
import { BalanceDisplay } from './balance-display';
import { Ticket, LogOut } from 'lucide-react';
import { SessionTypes } from '@walletconnect/types';

interface UserNavProps {
  user: User;
  onDisconnect: () => void;
  sessions: SessionTypes.Struct[];
}

export function UserNav({ user, onDisconnect, sessions }: UserNavProps) {
  // In a real app, these would come from your wallet connection/backend
  const mainBalance = 0;
  const subAccountBalance = 0;
  const userInitial = user.address ? user.address.slice(2, 4).toUpperCase() : '...';

  const getAccountsForChain = (chainId: string) => {
    const namespace = sessions[0]?.namespaces?.eip155;
    if (!namespace) return [];
    return namespace.accounts
      .filter(acc => acc.startsWith(chainId))
      .map(acc => acc.split(':').pop());
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar_url} alt={`@${user.address}`} />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Wallet</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.address}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <div className="px-2 py-1.5">
             <BalanceDisplay label="Main Account" balance={mainBalance} />
             <BalanceDisplay label="Sub Account" balance={subAccountBalance} isSubAccount />
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/my-tickets">
            <Ticket className="mr-2 h-4 w-4" />
            <span>My Tickets</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDisconnect}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
