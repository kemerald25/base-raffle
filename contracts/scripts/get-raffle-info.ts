// ============================================
// scripts/get-raffle-info.ts
// ============================================
import { ethers } from "hardhat";

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const raffleId = process.env.RAFFLE_ID || "1";
  
  if (!contractAddress) {
    throw new Error("Please set CONTRACT_ADDRESS in .env");
  }

  const raffle = await ethers.getContractAt("OnchainRaffle", contractAddress);
  const raffleData = await raffle.getRaffle(raffleId);
  
  console.log("\n📊 Raffle Information");
  console.log("=====================");
  console.log(`ID: ${raffleData.id}`);
  console.log(`Ticket Price: ${ethers.formatEther(raffleData.ticketPrice)} ETH`);
  console.log(`Max Tickets/User: ${raffleData.maxTicketsPerUser}`);
  console.log(`Total Tickets Sold: ${raffleData.totalTicketsSold}`);
  console.log(`Prize Pool: ${ethers.formatEther(raffleData.prizePool)} ETH`);
  console.log(`Status: ${["Active", "Ended", "Drawn", "Cancelled"][Number(raffleData.status)]}`);
  
  const endDate = new Date(Number(raffleData.endTimestamp) * 1000);
  console.log(`End Time: ${endDate.toLocaleString()}`);
  
  if (raffleData.winner !== ethers.ZeroAddress) {
    console.log(`Winner: ${raffleData.winner}`);
  }
  
  // Get active raffles
  const activeRaffles = await raffle.getActiveRaffles();
  console.log(`\n🎟️  Active Raffles: ${activeRaffles.length}`);
  
  // Get treasury balance
  const treasury = await raffle.treasuryBalance();
  console.log(`💰 Treasury Balance: ${ethers.formatEther(treasury)} ETH\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });