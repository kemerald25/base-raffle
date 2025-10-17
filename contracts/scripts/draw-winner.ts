// ============================================
// scripts/draw-winner.ts
// ============================================
import { ethers } from "hardhat";

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const raffleId = process.env.RAFFLE_ID;
  
  if (!contractAddress || !raffleId) {
    throw new Error("Please set CONTRACT_ADDRESS and RAFFLE_ID in .env");
  }

  console.log(`Drawing winner for raffle ${raffleId}...\n`);

  const raffle = await ethers.getContractAt("OnchainRaffle", contractAddress);
  
  // Check if raffle has ended
  const raffleData = await raffle.getRaffle(raffleId);
  const currentTime = Math.floor(Date.now() / 1000);
  
  if (currentTime < Number(raffleData.endTimestamp)) {
    throw new Error("Raffle has not ended yet");
  }

  console.log(`Total tickets sold: ${raffleData.totalTicketsSold}`);
  console.log(`Prize pool: ${ethers.formatEther(raffleData.prizePool)} ETH\n`);

  const tx = await raffle.drawWinner(raffleId);
  console.log("Transaction hash:", tx.hash);
  
  const receipt = await tx.wait();
  
  // Get winner from event
  const event = receipt?.logs.find(
    (log: any) => log.topics[0] === ethers.id("WinnerDrawn(uint256,address,uint256)")
  );

  if (event) {
    const winner = ethers.AbiCoder.defaultAbiCoder().decode(
      ["address", "uint256"],
      event.data
    );
    
    console.log(`\n🎉 Winner drawn!`);
    console.log(`   Winner: ${winner[0]}`);
    console.log(`   Prize: ${ethers.formatEther(winner[1])} ETH`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });