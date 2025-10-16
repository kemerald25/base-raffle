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

interface UserNavProps {
  user: User;
  onDisconnect: () => void;
}

export function UserNav({ user, onDisconnect }: UserNavProps) {
  const userInitial = user.address.slice(2, 4).toUpperCase();

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
             <BalanceDisplay label="Main Account" balance={1.2345} />
             <BalanceDisplay label="Sub Account" balance={0.5678} isSubAccount />
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
