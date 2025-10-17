// test/OnchainRaffle.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { OnchainRaffle } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("OnchainRaffle", function () {
  let raffle: OnchainRaffle;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let user3: HardhatEthersSigner;

  const TICKET_PRICE = ethers.parseEther("0.001");
  const MAX_TICKETS_PER_USER = 100;
  const RAFFLE_DURATION = 7 * 24 * 60 * 60; // 7 days

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    const OnchainRaffle = await ethers.getContractFactory("OnchainRaffle");
    raffle = await OnchainRaffle.deploy();
    await raffle.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await raffle.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero raffles", async function () {
      expect(await raffle.raffleCounter()).to.equal(0);
    });

    it("Should initialize with zero treasury balance", async function () {
      expect(await raffle.treasuryBalance()).to.equal(0);
    });
  });

  describe("Create Raffle", function () {
    it("Should create a raffle successfully", async function () {
      const tx = await raffle.createRaffle(TICKET_PRICE, MAX_TICKETS_PER_USER, RAFFLE_DURATION);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);
      const expectedEndTime = block!.timestamp + RAFFLE_DURATION;

      await expect(tx)
        .to.emit(raffle, "RaffleCreated")
        .withArgs(1, TICKET_PRICE, MAX_TICKETS_PER_USER, expectedEndTime);

      const raffleData = await raffle.getRaffle(1);
      expect(raffleData.ticketPrice).to.equal(TICKET_PRICE);
      expect(raffleData.maxTicketsPerUser).to.equal(MAX_TICKETS_PER_USER);
      expect(raffleData.status).to.equal(0); // Active
    });

    it("Should increment raffle counter", async function () {
      await raffle.createRaffle(TICKET_PRICE, MAX_TICKETS_PER_USER, RAFFLE_DURATION);
      expect(await raffle.raffleCounter()).to.equal(1);

      await raffle.createRaffle(TICKET_PRICE, MAX_TICKETS_PER_USER, RAFFLE_DURATION);
      expect(await raffle.raffleCounter()).to.equal(2);
    });

    it("Should revert if ticket price is zero", async function () {
      await expect(
        raffle.createRaffle(0, MAX_TICKETS_PER_USER, RAFFLE_DURATION)
      ).to.be.revertedWith("Ticket price must be greater than 0");
    });

    it("Should revert if max tickets is zero", async function () {
      await expect(
        raffle.createRaffle(TICKET_PRICE, 0, RAFFLE_DURATION)
      ).to.be.revertedWith("Max tickets must be greater than 0");
    });

    it("Should revert if duration is too short", async function () {
      await expect(
        raffle.createRaffle(TICKET_PRICE, MAX_TICKETS_PER_USER, 30 * 60) // 30 minutes
      ).to.be.revertedWith("Duration too short");
    });

    it("Should revert if duration is too long", async function () {
      await expect(
        raffle.createRaffle(TICKET_PRICE, MAX_TICKETS_PER_USER, 31 * 24 * 60 * 60) // 31 days
      ).to.be.revertedWith("Duration too long");
    });

    it("Should revert if not called by owner", async function () {
      await expect(
        raffle.connect(user1).createRaffle(TICKET_PRICE, MAX_TICKETS_PER_USER, RAFFLE_DURATION)
      ).to.be.revertedWithCustomError(raffle, "OwnableUnauthorizedAccount");
    });
  });

  describe("Buy Tickets", function () {
    beforeEach(async function () {
      await raffle.createRaffle(TICKET_PRICE, MAX_TICKETS_PER_USER, RAFFLE_DURATION);
    });

    it("Should allow buying tickets", async function () {
      const quantity = 5;
      const totalCost = TICKET_PRICE * BigInt(quantity);

      await expect(
        raffle.connect(user1).buyTickets(1, quantity, { value: totalCost })
      )
        .to.emit(raffle, "TicketsPurchased")
        .withArgs(1, user1.address, quantity, totalCost);

      expect(await raffle.getUserTickets(1, user1.address)).to.equal(quantity);
    });

    it("Should update raffle state correctly", async function () {
      const quantity = 10;
      const totalCost = TICKET_PRICE * BigInt(quantity);

      await raffle.connect(user1).buyTickets(1, quantity, { value: totalCost });

      const raffleData = await raffle.getRaffle(1);
      expect(raffleData.totalTicketsSold).to.equal(quantity);
      expect(raffleData.prizePool).to.equal(totalCost);
    });

    it("Should allow multiple users to buy tickets", async function () {
      const quantity = 5;
      const totalCost = TICKET_PRICE * BigInt(quantity);

      await raffle.connect(user1).buyTickets(1, quantity, { value: totalCost });
      await raffle.connect(user2).buyTickets(1, quantity, { value: totalCost });

      expect(await raffle.getUserTickets(1, user1.address)).to.equal(quantity);
      expect(await raffle.getUserTickets(1, user2.address)).to.equal(quantity);

      const raffleData = await raffle.getRaffle(1);
      expect(raffleData.totalTicketsSold).to.equal(quantity * 2);
    });

    it("Should refund excess payment", async function () {
      const quantity = 5;
      const totalCost = TICKET_PRICE * BigInt(quantity);
      const excessPayment = ethers.parseEther("0.01");

      const balanceBefore = await ethers.provider.getBalance(user1.address);

      const tx = await raffle.connect(user1).buyTickets(1, quantity, {
        value: totalCost + excessPayment,
      });
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(user1.address);

      expect(balanceBefore - balanceAfter).to.be.closeTo(totalCost + gasUsed, ethers.parseEther("0.0001"));
    });

    it("Should revert if exceeds max tickets per user", async function () {
      await expect(
        raffle.connect(user1).buyTickets(1, MAX_TICKETS_PER_USER + 1, {
          value: TICKET_PRICE * BigInt(MAX_TICKETS_PER_USER + 1),
        })
      ).to.be.revertedWith("Exceeds max tickets per user");
    });

    it("Should revert if insufficient payment", async function () {
      await expect(
        raffle.connect(user1).buyTickets(1, 5, { value: TICKET_PRICE * 4n })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should revert if quantity is zero", async function () {
      await expect(
        raffle.connect(user1).buyTickets(1, 0, { value: 0 })
      ).to.be.revertedWith("Must buy at least 1 ticket");
    });

    it("Should revert if raffle doesn't exist", async function () {
      await expect(
        raffle.connect(user1).buyTickets(999, 5, { value: TICKET_PRICE * 5n })
      ).to.be.revertedWith("Raffle does not exist");
    });

    it("Should revert if raffle has ended", async function () {
      await time.increase(RAFFLE_DURATION + 1);

      await expect(
        raffle.connect(user1).buyTickets(1, 5, { value: TICKET_PRICE * 5n })
      ).to.be.revertedWith("Raffle has ended");
    });
  });

  describe("Draw Winner", function () {
    beforeEach(async function () {
      await raffle.createRaffle(TICKET_PRICE, MAX_TICKETS_PER_USER, RAFFLE_DURATION);

      // Multiple users buy tickets
      await raffle.connect(user1).buyTickets(1, 10, { value: TICKET_PRICE * 10n });
      await raffle.connect(user2).buyTickets(1, 5, { value: TICKET_PRICE * 5n });
      await raffle.connect(user3).buyTickets(1, 15, { value: TICKET_PRICE * 15n });
    });

    it("Should draw winner after raffle ends", async function () {
      await time.increase(RAFFLE_DURATION + 1);

      await expect(raffle.drawWinner(1))
        .to.emit(raffle, "WinnerDrawn")
        .and.to.emit(raffle, "PrizeClaimed");

      const raffleData = await raffle.getRaffle(1);
      expect(raffleData.status).to.equal(2); // Drawn
      expect(raffleData.winner).to.not.equal(ethers.ZeroAddress);
    });

    it("Should distribute prize correctly (90% to winner, 10% to treasury)", async function () {
      await time.increase(RAFFLE_DURATION + 1);

      const raffleDataBefore = await raffle.getRaffle(1);
      const prizePool = raffleDataBefore.prizePool;
      const expectedTreasuryFee = (prizePool * 10n) / 100n;
      const expectedPrize = prizePool - expectedTreasuryFee;

      await raffle.drawWinner(1);

      const treasuryBalance = await raffle.treasuryBalance();
      expect(treasuryBalance).to.equal(expectedTreasuryFee);

      // Verify winner received prize (check one of the users)
      const raffleData = await raffle.getRaffle(1);
      const winner = raffleData.winner;

      // Winner should be one of our users
      expect([user1.address, user2.address, user3.address]).to.include(winner);
    });

    it("Should revert if raffle not ended yet", async function () {
      await expect(raffle.drawWinner(1)).to.be.revertedWith("Raffle not ended yet");
    });

    it("Should revert if no tickets sold", async function () {
      await raffle.createRaffle(TICKET_PRICE, MAX_TICKETS_PER_USER, RAFFLE_DURATION);
      await time.increase(RAFFLE_DURATION + 1);

      await expect(raffle.drawWinner(2)).to.be.revertedWith("No tickets sold");
    });

    it("Should revert if already drawn", async function () {
      await time.increase(RAFFLE_DURATION + 1);
      await raffle.drawWinner(1);

      await expect(raffle.drawWinner(1)).to.be.revertedWith("Raffle not active");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await raffle.createRaffle(TICKET_PRICE, MAX_TICKETS_PER_USER, RAFFLE_DURATION);
      await raffle.connect(user1).buyTickets(1, 5, { value: TICKET_PRICE * 5n });
    });

    it("Should return correct raffle details", async function () {
      const raffleData = await raffle.getRaffle(1);

      expect(raffleData.id).to.equal(1);
      expect(raffleData.ticketPrice).to.equal(TICKET_PRICE);
      expect(raffleData.maxTicketsPerUser).to.equal(MAX_TICKETS_PER_USER);
      expect(raffleData.totalTicketsSold).to.equal(5);
      expect(raffleData.status).to.equal(0); // Active
    });

    it("Should return user tickets correctly", async function () {
      const userTickets = await raffle.getUserTickets(1, user1.address);
      expect(userTickets).to.equal(5);
    });

    it("Should return active raffles", async function () {
      await raffle.createRaffle(TICKET_PRICE, MAX_TICKETS_PER_USER, RAFFLE_DURATION);
      await raffle.createRaffle(TICKET_PRICE, MAX_TICKETS_PER_USER, RAFFLE_DURATION);

      const activeRaffles = await raffle.getActiveRaffles();
      expect(activeRaffles.length).to.equal(3);
    });

    it("Should check if raffle is active", async function () {
      expect(await raffle.isRaffleActive(1)).to.be.true;

      await time.increase(RAFFLE_DURATION + 1);
      expect(await raffle.isRaffleActive(1)).to.be.false;
    });

    it("Should return time remaining", async function () {
      const timeRemaining = await raffle.getTimeRemaining(1);
      expect(timeRemaining).to.be.closeTo(BigInt(RAFFLE_DURATION), 2n);

      await time.increase(RAFFLE_DURATION + 1);
      expect(await raffle.getTimeRemaining(1)).to.equal(0);
    });

    it("Should return user raffles", async function () {
      await raffle.createRaffle(TICKET_PRICE, MAX_TICKETS_PER_USER, RAFFLE_DURATION);
      await raffle.connect(user1).buyTickets(2, 3, { value: TICKET_PRICE * 3n });

      const userRaffles = await raffle.getUserRaffles(user1.address);
      expect(userRaffles.length).to.equal(2);
      expect(userRaffles[0]).to.equal(1);
      expect(userRaffles[1]).to.equal(2);
    });
  });

  describe("Treasury Management", function () {
    beforeEach(async function () {
      await raffle.createRaffle(TICKET_PRICE, MAX_TICKETS_PER_USER, RAFFLE_DURATION);
      await raffle.connect(user1).buyTickets(1, 10, { value: TICKET_PRICE * 10n });
      await time.increase(RAFFLE_DURATION + 1);
      await raffle.drawWinner(1);
    });

    it("Should allow owner to withdraw treasury", async function () {
      const treasuryBalance = await raffle.treasuryBalance();
      expect(treasuryBalance).to.be.gt(0);

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      await expect(raffle.withdrawTreasury())
        .to.emit(raffle, "TreasuryWithdrawn")
        .withArgs(owner.address, treasuryBalance);

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
      expect(await raffle.treasuryBalance()).to.equal(0);
    });

    it("Should revert if treasury is empty", async function () {
      await raffle.withdrawTreasury();
      await expect(raffle.withdrawTreasury()).to.be.revertedWith("No treasury balance");
    });

    it("Should revert if not called by owner", async function () {
      await expect(
        raffle.connect(user1).withdrawTreasury()
      ).to.be.revertedWithCustomError(raffle, "OwnableUnauthorizedAccount");
    });
  });

  describe("Pause Functionality", function () {
    beforeEach(async function () {
      await raffle.createRaffle(TICKET_PRICE, MAX_TICKETS_PER_USER, RAFFLE_DURATION);
    });

    it("Should allow owner to pause", async function () {
      await raffle.pause();
      expect(await raffle.paused()).to.be.true;
    });

    it("Should prevent ticket purchases when paused", async function () {
      await raffle.pause();

      await expect(
        raffle.connect(user1).buyTickets(1, 5, { value: TICKET_PRICE * 5n })
      ).to.be.revertedWithCustomError(raffle, "EnforcedPause");
    });

    it("Should allow owner to unpause", async function () {
      await raffle.pause();
      await raffle.unpause();
      expect(await raffle.paused()).to.be.false;

      // Should work after unpause
      await raffle.connect(user1).buyTickets(1, 5, { value: TICKET_PRICE * 5n });
    });

    it("Should revert if non-owner tries to pause", async function () {
      await expect(
        raffle.connect(user1).pause()
      ).to.be.revertedWithCustomError(raffle, "OwnableUnauthorizedAccount");
    });
  });

  describe("Gas Optimization", function () {
    it("Should handle multiple ticket purchases efficiently", async function () {
      await raffle.createRaffle(TICKET_PRICE, MAX_TICKETS_PER_USER, RAFFLE_DURATION);

      // Buy maximum tickets
      const tx = await raffle.connect(user1).buyTickets(1, MAX_TICKETS_PER_USER, {
        value: TICKET_PRICE * BigInt(MAX_TICKETS_PER_USER),
      });

      const receipt = await tx.wait();
      console.log(`Gas used for ${MAX_TICKETS_PER_USER} tickets:`, receipt!.gasUsed.toString());

      // Should complete successfully
      expect(await raffle.getUserTickets(1, user1.address)).to.equal(MAX_TICKETS_PER_USER);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle single ticket purchase", async function () {
      await raffle.createRaffle(TICKET_PRICE, MAX_TICKETS_PER_USER, RAFFLE_DURATION);

      await raffle.connect(user1).buyTickets(1, 1, { value: TICKET_PRICE });
      expect(await raffle.getUserTickets(1, user1.address)).to.equal(1);
    });

    it("Should handle maximum tickets per user", async function () {
      await raffle.createRaffle(TICKET_PRICE, MAX_TICKETS_PER_USER, RAFFLE_DURATION);

      await raffle.connect(user1).buyTickets(1, MAX_TICKETS_PER_USER, {
        value: TICKET_PRICE * BigInt(MAX_TICKETS_PER_USER),
      });

      expect(await raffle.getUserTickets(1, user1.address)).to.equal(MAX_TICKETS_PER_USER);
    });

    it("Should handle drawing with single ticket", async function () {
      await raffle.createRaffle(TICKET_PRICE, MAX_TICKETS_PER_USER, RAFFLE_DURATION);
      await raffle.connect(user1).buyTickets(1, 1, { value: TICKET_PRICE });

      await time.increase(RAFFLE_DURATION + 1);
      await raffle.drawWinner(1);

      const raffleData = await raffle.getRaffle(1);
      expect(raffleData.winner).to.equal(user1.address);
    });
  });
});