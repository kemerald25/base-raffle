"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import type { WalletKitTypes } from "@reown/walletkit";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";

interface SessionProposalModalProps {
  proposal: WalletKitTypes.SessionProposal["params"];
  onApprove: (approvedNamespaces: any) => Promise<void>;
  onReject: (rejectionReason: any) => Promise<void>;
}

export function SessionProposalModal({
  proposal,
  onApprove,
  onReject,
}: SessionProposalModalProps) {
  const { proposer, requiredNamespaces, optionalNamespaces } = proposal;
  const proposerUrl = new URL(proposer.metadata.url);

  const handleApprove = () => {
    // This is a placeholder. In a real wallet, you'd get the actual accounts from user's wallet.
    const placeholderAccounts = [
        'eip155:1:0x453d506b1543dcA64f57Ce6e7Bb048466e85e228',
        'eip155:137:0x453d506b1543dcA64f57Ce6e7Bb048466e85e228'
    ];

    const approvedNamespaces = buildApprovedNamespaces({
      proposal: proposal,
      supportedNamespaces: {
        eip155: {
          chains: ['eip155:1', 'eip155:137'], // Supported chains
          methods: ['personal_sign', 'eth_sendTransaction', 'eth_signTypedData_v4'], // Supported methods
          events: ['accountsChanged', 'chainChanged'], // Supported events
          accounts: placeholderAccounts,
        },
      },
    });
    onApprove(approvedNamespaces);
  };

  const handleReject = () => {
    onReject(getSdkError("USER_REJECTED"));
  };

  return (
    <Dialog open={!!proposal}>
      <DialogContent>
        <DialogHeader>
          <div className="flex flex-col items-center text-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={proposer.metadata.icons[0]}
                alt={proposer.metadata.name}
              />
              <AvatarFallback>
                {proposer.metadata.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <DialogTitle className="text-xl">
              {proposer.metadata.name} wants to connect
            </DialogTitle>
            <DialogDescription>{proposerUrl.hostname}</DialogDescription>
          </div>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div>
                <h3 className="font-medium mb-2">Permissions Requested:</h3>
                <div className="flex flex-wrap gap-2">
                    {Object.values(requiredNamespaces).flatMap(ns => ns.methods).map(method => (
                        <Badge key={method} variant="secondary">{method}</Badge>
                    ))}
                     {Object.values(optionalNamespaces).flatMap(ns => ns.methods).map(method => (
                        <Badge key={method} variant="outline">{method}</Badge>
                    ))}
                </div>
            </div>
             <div>
                <h3 className="font-medium mb-2">Chains:</h3>
                <div className="flex flex-wrap gap-2">
                    {Object.values(requiredNamespaces).flatMap(ns => ns.chains).map(chain => (
                        <Badge key={chain} variant="secondary">{chain}</Badge>
                    ))}
                    {Object.values(optionalNamespaces).flatMap(ns => ns.chains).map(chain => (
                        <Badge key={chain} variant="outline">{chain}</Badge>
                    ))}
                </div>
            </div>
        </div>
        <DialogFooter className="grid grid-cols-2 gap-4">
          <Button variant="destructive" size="lg" onClick={handleReject}>
            <X className="mr-2 h-4 w-4" /> Reject
          </Button>
          <Button size="lg" onClick={handleApprove}>
            <Check className="mr-2 h-4 w-4" /> Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
