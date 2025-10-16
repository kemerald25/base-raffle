import { Button } from "./ui/button";
import { PlusCircle, ArrowDownCircle } from "lucide-react";

interface BalanceDisplayProps {
  label: string;
  balance: number;
  isSubAccount?: boolean;
}

export function BalanceDisplay({ label, balance, isSubAccount = false }: BalanceDisplayProps) {
  return (
    <div className="p-2 rounded-md hover:bg-muted/50">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="font-semibold text-sm">
            {balance.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} ETH
          </span>
        </div>
        {isSubAccount && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <PlusCircle className="h-4 w-4 text-green-500" />
              <span className="sr-only">Add Funds</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ArrowDownCircle className="h-4 w-4 text-red-500" />
               <span className="sr-only">Withdraw Funds</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
