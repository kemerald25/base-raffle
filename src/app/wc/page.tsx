"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useWalletKit } from "@/lib/walletkit.tsx";
import { SessionProposalModal } from "@/components/session-proposal-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { WalletKitTypes } from "@reown/walletkit";

export default function WCPage() {
  const searchParams = useSearchParams();
  const walletKit = useWalletKit();
  const [proposal, setProposal] = useState<WalletKitTypes.SessionProposal["params"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const uri = searchParams.get("uri");
    if (!uri) {
      setError("No WalletConnect URI found in the URL.");
      setIsLoading(false);
      return;
    }

    if (!walletKit.signClient) {
      setError("WalletKit is not initialized.");
      setIsLoading(false);
      return;
    }

    const pair = async () => {
      try {
        console.log("Pairing with URI:", uri);
        await walletKit.pair({ uri });
      } catch (e: any) {
        console.error("Failed to pair:", e);
        setError(`Failed to pair with the dApp: ${e.message}`);
        setIsLoading(false);
      }
    };
    pair();

    const handleProposal = (p: WalletKitTypes.SessionProposal) => {
      console.log("Received session proposal:", p);
      setProposal(p.params);
      setIsLoading(false);
    };

    walletKit.on("session_proposal", handleProposal);

    return () => {
      walletKit.off("session_proposal", handleProposal);
    };
  }, [searchParams, walletKit]);

  const handleApprove = async (approvedNamespaces: any) => {
    if (!proposal || !walletKit.signClient) return;
    try {
        const session = await walletKit.approveSession({
            id: proposal.id,
            namespaces: approvedNamespaces,
        });

        // Redirect back to dApp
        const redirect = session.peer.metadata.redirect;
        if(redirect?.native) {
             window.location.href = redirect.native;
        } else if (redirect?.universal) {
             window.location.href = redirect.universal;
        } else if (window.opener) {
             window.close();
        }

    } catch (e: any) {
        console.error("Failed to approve session:", e);
        setError(`Failed to approve session: ${e.message}`);
    } finally {
        setProposal(null);
    }
  };

  const handleReject = async (rejectionReason: any) => {
    if (!proposal || !walletKit.signClient) return;
    try {
        await walletKit.rejectSession({
            id: proposal.id,
            reason: rejectionReason,
        });
    } catch (e: any) {
        console.error("Failed to reject session:", e);
        setError(`Failed to reject session: ${e.message}`);
    } finally {
        setProposal(null);
        if (window.opener) {
            window.close();
        }
    }
  };

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 md:px-6 py-12 flex justify-center items-center h-screen">
             <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Connecting to dApp</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center py-12">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </CardContent>
            </Card>
        </div>
    );
  }

  if (error) {
     return (
        <div className="container mx-auto px-4 md:px-6 py-12 flex justify-center items-center h-screen">
             <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-destructive">Connection Error</CardTitle>
                </CardHeader>
                <CardContent className="py-8 text-center">
                    <p>{error}</p>
                </CardContent>
            </Card>
        </div>
    );
  }
  
  if (proposal) {
    return (
      <SessionProposalModal
        proposal={proposal}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    );
  }
  
  return (
     <div className="container mx-auto px-4 md:px-6 py-12 flex justify-center items-center h-screen">
         <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-center">Connection Closed</CardTitle>
            </CardHeader>
            <CardContent className="py-8 text-center">
                <p>The connection window can now be closed.</p>
            </CardContent>
        </Card>
    </div>
  );
}
