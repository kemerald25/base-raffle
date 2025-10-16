import { getActiveRaffles } from "@/lib/data"
import { RaffleCard } from "@/components/raffle-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RafflesPage() {
  const raffles = getActiveRaffles();

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-headline">Active Raffles</h1>
          <p className="mt-2 text-muted-foreground">Find your next big win. All tickets purchased seamlessly with your Sub Account.</p>
        </div>
        <div className="flex items-center gap-4">
            <Select>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ending-soon">Ending Soon</SelectItem>
                    <SelectItem value="prize-high">Prize: High to Low</SelectItem>
                    <SelectItem value="prize-low">Prize: Low to High</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
      
      {raffles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {raffles.map((raffle) => (
            <RaffleCard key={raffle.id} raffle={raffle} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">No Active Raffles</h2>
            <p className="text-muted-foreground">Please check back later for new and exciting raffles!</p>
        </div>
      )}
    </div>
  )
}
