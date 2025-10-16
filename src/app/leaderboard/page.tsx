import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Ticket } from "lucide-react";
import { User } from "@/lib/types";

export default function LeaderboardPage() {
    const topWinners: User[] = [];
    const topPlayers: User[] = [];

    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight font-headline">Leaderboard</h1>
                <p className="mt-2 text-muted-foreground">See who's leading the pack in the world of Base Raffle.</p>
            </div>
            
            <Tabs defaultValue="top-winners">
                <div className="flex justify-center mb-6">
                    <TabsList>
                        <TabsTrigger value="top-winners"><Trophy className="mr-2 h-4 w-4"/>Top Winners</TabsTrigger>
                        <TabsTrigger value="top-players"><Ticket className="mr-2 h-4 w-4"/>Top Players</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="top-winners">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Winners by Prize Amount</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Rank</TableHead>
                                        <TableHead>Player</TableHead>
                                        <TableHead className="text-right">Total Won</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topWinners.length > 0 ? topWinners.map((user, index) => (
                                        <TableRow key={user.address}>
                                            <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={user.avatar_url} />
                                                        <AvatarFallback>{user.address.slice(2, 4).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium truncate">{`${user.address.slice(0, 8)}...${user.address.slice(-6)}`}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-green-500 text-lg">
                                                {user.total_won.toLocaleString('en-US', { style: 'currency', currency: 'ETH' })}
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                                No winners yet. Be the first!
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="top-players">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Players by Tickets Purchased</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Rank</TableHead>
                                        <TableHead>Player</TableHead>
                                        <TableHead className="text-right">Tickets Purchased</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topPlayers.length > 0 ? topPlayers.map((user, index) => (
                                        <TableRow key={user.address}>
                                            <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={user.avatar_url} />
                                                        <AvatarFallback>{user.address.slice(2, 4).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium truncate">{`${user.address.slice(0, 8)}...${user.address.slice(-6)}`}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-primary text-lg">
                                                {user.total_tickets_purchased}
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                         <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                                No players yet. Join a raffle!
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
