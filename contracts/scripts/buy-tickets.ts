// ============================================
// scripts/buy-tickets.ts (for testing)
// ============================================
import { ethers } from "hardhat";

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const raffleId = process.env.RAFFLE_ID || "1";
  const quantity = process.env.TICKET_QUANTITY || "5";
  
  if (!contractAddress) {
    throw new Error("Please set CONTRACT_ADDRESS in .env");
  }

  console.log(`Buying ${quantity} tickets for raffle ${raffleId}...\n`);

  const raffle = await ethers.getContractAt("OnchainRaffle", contractAddress);
  const raffleData = await raffle.getRaffle(raffleId);
  
  const totalCost = raffleData.ticketPrice * BigInt(quantity);
  
  console.log(`Ticket price: ${ethers.formatEther(raffleData.ticketPrice)} ETH`);
  console.log(`Total cost: ${ethers.formatEther(totalCost)} ETH\n`);

  const tx = await raffle.buyTickets(raffleId, quantity, {
    value: totalCost,
  });

  console.log("Transaction hash:", tx.hash);
  await tx.wait();

  console.log(`\n✅ Successfully purchased ${quantity} tickets!`);
  
  const [signer] = await ethers.getSigners();
  const userTickets = await raffle.getUserTickets(raffleId, signer.address);
  console.log(`   Your total tickets: ${userTickets}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });