import type {Metadata} from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster"
import { WalletKitContext, walletKit } from '@/lib/walletkit';

export const metadata: Metadata = {
  title: 'Base Raffle - Onchain Raffle DApp',
  description: 'A production-ready onchain raffle/lottery application on Base with a seamless user experience.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased min-h-screen flex flex-col")}>
        <WalletKitContext.Provider value={walletKit}>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <Toaster />
        </WalletKitContext.Provider>
      </body>
    </html>
  );
}
