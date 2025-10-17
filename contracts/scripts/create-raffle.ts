// ============================================
// scripts/create-raffle.ts
// ============================================
import { ethers } from "hardhat";

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    throw new Error("Please set CONTRACT_ADDRESS in .env");
  }

  console.log("Creating new raffle...\n");

  const raffle = await ethers.getContractAt("OnchainRaffle", contractAddress);
  
  // Raffle parameters
  const ticketPrice = ethers.parseEther("0.001");
  const maxTicketsPerUser = 50;
  const duration = 3 * 24 * 60 * 60; // 3 days

  const tx = await raffle.createRaffle(
    ticketPrice,
    maxTicketsPerUser,
    duration
  );

  console.log("Transaction hash:", tx.hash);
  const receipt = await tx.wait();

  // Get raffle ID from event
  const event = receipt?.logs.find(
    (log: any) => log.topics[0] === ethers.id("RaffleCreated(uint256,uint256,uint256,uint256)")
  );

  if (event) {
    const raffleId = ethers.AbiCoder.defaultAbiCoder().decode(
      ["uint256"],
      event.topics[1]
    )[0];
    
    console.log(`\n✅ Raffle created with ID: ${raffleId}`);
    console.log(`   Ticket Price: ${ethers.formatEther(ticketPrice)} ETH`);
    console.log(`   Max Tickets/User: ${maxTicketsPerUser}`);
    console.log(`   Duration: ${duration / 86400} days`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
