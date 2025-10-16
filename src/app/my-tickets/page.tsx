import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { ArrowRight } from "lucide-react";
import type { User, Ticket, Raffle } from "@/lib/types";

export default function MyTicketsPage() {
    // In a real app this would come from the connected wallet
    const user: User | undefined = undefined;

    if (!user) {
        return (
            <div className="container mx-auto px-4 md:px-6 py-12 text-center">
                 <h1 className="text-3xl font-bold font-headline mb-4">My Profile</h1>
                 <p className="text-muted-foreground">Please connect your wallet to view your tickets and profile.</p>
            </div>
        )
    }
    
    const allRaffles: Raffle[] = [];
    const userTickets: Ticket[] = [];
    
    const activeTickets = userTickets.map(ticket => {
        const raffle = allRaffles.find(r => r.id === ticket.raffle_id);
        return { ticket, raffle };
    }).filter(t => t.raffle?.status === 'active');
    
    const pastTickets = userTickets.map(ticket => {
        const raffle = allRaffles.find(r => r.id === ticket.raffle_id);
        return { ticket, raffle };
    }).filter(t => t.raffle?.status !== 'active');

    const wins = pastTickets.filter(t => t.raffle?.status === 'drawn' && t.raffle.winner_address === user.address).length;
    const losses = pastTickets.filter(t => t.raffle?.status === 'drawn' && t.raffle.winner_address !== user.address).length;

    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="flex items-center gap-4 mb-8">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.address.slice(2, 4).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl font-bold font-headline">My Profile</h1>
                    <p className="text-muted-foreground font-mono text-sm truncate">{user.address}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader><CardTitle>Total Spent</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{user.total_spent.toFixed(2)} ETH</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Total Won</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold text-green-500">{user.total_won.toFixed(2)} ETH</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Tickets Purchased</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{user.total_tickets_purchased}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Win/Loss Record</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{wins}W / {losses}L</p></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="active">
                <TabsList>
                    <TabsTrigger value="active">Active Tickets</TabsTrigger>
                    <TabsTrigger value="history">Raffle History</TabsTrigger>
                </TabsList>
                <TabsContent value="active">
                    <Card>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Raffle</TableHead>
                                        <TableHead>Your Tickets</TableHead>
                                        <TableHead>Ends In</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeTickets.map(({ticket, raffle}) => (
                                        <TableRow key={ticket.id}>
                                            <TableCell className="font-medium">{raffle?.name}</TableCell>
                                            <TableCell>{ticket.quantity}</TableCell>
                                            <TableCell>{new Date(raffle?.end_timestamp || 0).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/raffle/${raffle?.id}`} className="text-primary hover:underline">
                                                   View <ArrowRight className="inline h-4 w-4"/>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                             {activeTickets.length === 0 && <p className="text-center text-muted-foreground py-8">You have no tickets in active raffles.</p>}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="history">
                     <Card>
                        <CardContent className="pt-6">
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Raffle</TableHead>
                                        <TableHead>Your Tickets</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Result</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                     {pastTickets.map(({ticket, raffle}) => {
                                        const isWinner = raffle?.winner_address === user.address;
                                        return (
                                            <TableRow key={ticket.id}>
                                                <TableCell className="font-medium">{raffle?.name}</TableCell>
                                                <TableCell>{ticket.quantity}</TableCell>
                                                <TableCell>
                                                    <Badge variant={raffle?.status === 'drawn' ? 'secondary' : 'default'}>
                                                        {raffle?.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {raffle?.status === 'drawn' ? (
                                                        isWinner ? <Badge className="bg-green-500">WIN</Badge> : <Badge variant="destructive">LOSS</Badge>
                                                    ) : (
                                                        <span>-</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                     })}
                                </TableBody>
                            </Table>
                            {pastTickets.length === 0 && <p className="text-center text-muted-foreground py-8">No past raffles to show.</p>}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
