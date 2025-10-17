// ============================================
// scripts/deploy.ts
// ============================================
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Starting deployment to Base...\n");

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deployer address: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} ETH\n`);

  if (balance === 0n) {
    throw new Error("❌ Deployer has no ETH. Please fund the account first.");
  }

  // Deploy OnchainRaffle contract
  console.log("📝 Deploying OnchainRaffle contract...");
  const OnchainRaffle = await ethers.getContractFactory("OnchainRaffle");
  const raffle = await OnchainRaffle.deploy();

  await raffle.waitForDeployment();
  const raffleAddress = await raffle.getAddress();

  console.log(`✅ OnchainRaffle deployed to: ${raffleAddress}\n`);

  // Create first raffle for testing
  console.log("🎟️  Creating initial test raffle...");
  
  const ticketPrice = ethers.parseEther("0.001"); // 0.001 ETH per ticket
  const maxTicketsPerUser = 100;
  const duration = 7 * 24 * 60 * 60; // 7 days

  const createTx = await raffle.createRaffle(
    ticketPrice,
    maxTicketsPerUser,
    duration
  );
  
  await createTx.wait();
  console.log("✅ Initial raffle created (ID: 1)");
  console.log(`   Ticket Price: ${ethers.formatEther(ticketPrice)} ETH`);
  console.log(`   Max Tickets/User: ${maxTicketsPerUser}`);
  console.log(`   Duration: ${duration / 86400} days\n`);

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    contractAddress: raffleAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    initialRaffle: {
      id: 1,
      ticketPrice: ethers.formatEther(ticketPrice),
      maxTicketsPerUser,
      durationDays: duration / 86400,
    },
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save to JSON file
  const filename = `${network.name}-${network.chainId}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

  console.log(`📄 Deployment info saved to: deployments/${filename}\n`);

  // Verification instructions
  console.log("🔍 To verify the contract on BaseScan, run:");
  console.log(`   npx hardhat verify --network ${network.name} ${raffleAddress}\n`);

  console.log("✨ Deployment complete!\n");
  console.log("Next steps:");
  console.log("1. Verify contract on BaseScan (see command above)");
  console.log("2. Update frontend with contract address");
  console.log("3. Test by buying tickets");
  console.log("4. Draw winner after raffle ends");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });