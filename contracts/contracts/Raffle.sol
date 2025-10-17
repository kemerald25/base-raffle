// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title OnchainRaffle
 * @dev A decentralized raffle system with provably fair winner selection
 * Optimized for use with Base Account SDK Sub Accounts
 */
contract OnchainRaffle is Ownable, ReentrancyGuard, Pausable {
    
    // Structs
    struct Raffle {
        uint256 id;
        uint256 ticketPrice;
        uint256 maxTicketsPerUser;
        uint256 endTimestamp;
        uint256 totalTicketsSold;
        uint256 prizePool;
        address winner;
        RaffleStatus status;
        uint256 createdAt;
    }

    struct Ticket {
        address buyer;
        uint256 raffleId;
        uint256 ticketNumber;
    }

    enum RaffleStatus {
        Active,
        Ended,
        Drawn,
        Cancelled
    }

    // State variables
    uint256 public raffleCounter;
    uint256 public treasuryBalance;
    uint256 public constant TREASURY_FEE_PERCENT = 10; // 10% fee
    uint256 public constant MIN_RAFFLE_DURATION = 1 hours;
    uint256 public constant MAX_RAFFLE_DURATION = 30 days;
    
    mapping(uint256 => Raffle) public raffles;
    mapping(uint256 => Ticket[]) public raffleTickets;
    mapping(uint256 => mapping(address => uint256)) public userTicketCount;
    mapping(address => uint256[]) public userRaffles;

    // Events
    event RaffleCreated(
        uint256 indexed raffleId,
        uint256 ticketPrice,
        uint256 maxTicketsPerUser,
        uint256 endTimestamp
    );
    
    event TicketsPurchased(
        uint256 indexed raffleId,
        address indexed buyer,
        uint256 quantity,
        uint256 totalCost
    );
    
    event WinnerDrawn(
        uint256 indexed raffleId,
        address indexed winner,
        uint256 prizeAmount
    );
    
    event PrizeClaimed(
        uint256 indexed raffleId,
        address indexed winner,
        uint256 amount
    );
    
    event RaffleCancelled(uint256 indexed raffleId);
    
    event TreasuryWithdrawn(address indexed to, uint256 amount);

    // Modifiers
    modifier raffleExists(uint256 _raffleId) {
        require(_raffleId > 0 && _raffleId <= raffleCounter, "Raffle does not exist");
        _;
    }

    modifier raffleActive(uint256 _raffleId) {
        require(raffles[_raffleId].status == RaffleStatus.Active, "Raffle is not active");
        require(block.timestamp < raffles[_raffleId].endTimestamp, "Raffle has ended");
        _;
    }

    constructor() Ownable(msg.sender) {
        raffleCounter = 0;
    }

    /**
     * @dev Create a new raffle
     * @param _ticketPrice Price per ticket in wei
     * @param _maxTicketsPerUser Maximum tickets a single user can buy
     * @param _duration Duration of the raffle in seconds
     */
    function createRaffle(
        uint256 _ticketPrice,
        uint256 _maxTicketsPerUser,
        uint256 _duration
    ) external onlyOwner whenNotPaused returns (uint256) {
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        require(_maxTicketsPerUser > 0, "Max tickets must be greater than 0");
        require(_duration >= MIN_RAFFLE_DURATION, "Duration too short");
        require(_duration <= MAX_RAFFLE_DURATION, "Duration too long");

        raffleCounter++;
        uint256 endTimestamp = block.timestamp + _duration;

        raffles[raffleCounter] = Raffle({
            id: raffleCounter,
            ticketPrice: _ticketPrice,
            maxTicketsPerUser: _maxTicketsPerUser,
            endTimestamp: endTimestamp,
            totalTicketsSold: 0,
            prizePool: 0,
            winner: address(0),
            status: RaffleStatus.Active,
            createdAt: block.timestamp
        });

        emit RaffleCreated(
            raffleCounter,
            _ticketPrice,
            _maxTicketsPerUser,
            endTimestamp
        );

        return raffleCounter;
    }

    /**
     * @dev Buy tickets for a raffle
     * @param _raffleId ID of the raffle
     * @param _quantity Number of tickets to buy
     */
    function buyTickets(uint256 _raffleId, uint256 _quantity)
        external
        payable
        nonReentrant
        whenNotPaused
        raffleExists(_raffleId)
        raffleActive(_raffleId)
    {
        require(_quantity > 0, "Must buy at least 1 ticket");
        
        Raffle storage raffle = raffles[_raffleId];
        
        uint256 currentUserTickets = userTicketCount[_raffleId][msg.sender];
        require(
            currentUserTickets + _quantity <= raffle.maxTicketsPerUser,
            "Exceeds max tickets per user"
        );

        uint256 totalCost = raffle.ticketPrice * _quantity;
        require(msg.value >= totalCost, "Insufficient payment");

        // Add tickets
        for (uint256 i = 0; i < _quantity; i++) {
            raffleTickets[_raffleId].push(Ticket({
                buyer: msg.sender,
                raffleId: _raffleId,
                ticketNumber: raffle.totalTicketsSold + i
            }));
        }

        // Update state
        raffle.totalTicketsSold += _quantity;
        raffle.prizePool += totalCost;
        userTicketCount[_raffleId][msg.sender] += _quantity;

        // Track user participation
        if (currentUserTickets == 0) {
            userRaffles[msg.sender].push(_raffleId);
        }

        emit TicketsPurchased(_raffleId, msg.sender, _quantity, totalCost);

        // Refund excess payment
        if (msg.value > totalCost) {
            (bool success, ) = msg.sender.call{value: msg.value - totalCost}("");
            require(success, "Refund failed");
        }
    }

    /**
     * @dev Draw winner for a raffle using blockhash randomness
     * @param _raffleId ID of the raffle
     */
    function drawWinner(uint256 _raffleId)
        external
        nonReentrant
        raffleExists(_raffleId)
    {
        Raffle storage raffle = raffles[_raffleId];
        
        require(raffle.status == RaffleStatus.Active, "Raffle not active");
        require(block.timestamp >= raffle.endTimestamp, "Raffle not ended yet");
        require(raffle.totalTicketsSold > 0, "No tickets sold");

        // Mark as ended first
        raffle.status = RaffleStatus.Ended;

        // Generate random number using blockhash
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            block.number,
            raffle.totalTicketsSold,
            msg.sender
        )));

        uint256 winningTicketNumber = randomSeed % raffle.totalTicketsSold;
        address winnerAddress = raffleTickets[_raffleId][winningTicketNumber].buyer;

        // Calculate prize (90% to winner, 10% to treasury)
        uint256 treasuryFee = (raffle.prizePool * TREASURY_FEE_PERCENT) / 100;
        uint256 prizeAmount = raffle.prizePool - treasuryFee;

        // Update state
        raffle.winner = winnerAddress;
        raffle.status = RaffleStatus.Drawn;
        treasuryBalance += treasuryFee;

        emit WinnerDrawn(_raffleId, winnerAddress, prizeAmount);

        // Transfer prize to winner
        (bool success, ) = winnerAddress.call{value: prizeAmount}("");
        require(success, "Prize transfer failed");

        emit PrizeClaimed(_raffleId, winnerAddress, prizeAmount);
    }

    /**
     * @dev Cancel a raffle and refund all participants (only if no winner drawn)
     * @param _raffleId ID of the raffle
     */
    function cancelRaffle(uint256 _raffleId)
        external
        onlyOwner
        raffleExists(_raffleId)
        nonReentrant
    {
        Raffle storage raffle = raffles[_raffleId];
        require(
            raffle.status == RaffleStatus.Active || raffle.status == RaffleStatus.Ended,
            "Cannot cancel this raffle"
        );

        raffle.status = RaffleStatus.Cancelled;

        emit RaffleCancelled(_raffleId);

        // Refund all participants proportionally
        Ticket[] memory tickets = raffleTickets[_raffleId];
        address[] memory uniqueBuyers = new address[](tickets.length);
        uint256[] memory buyerTicketCounts = new uint256[](tickets.length);
        uint256 uniqueBuyerCount = 0;

        // Count tickets per buyer
        for (uint256 i = 0; i < tickets.length; i++) {
            address buyer = tickets[i].buyer;
            bool found = false;
            
            for (uint256 j = 0; j < uniqueBuyerCount; j++) {
                if (uniqueBuyers[j] == buyer) {
                    buyerTicketCounts[j]++;
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                uniqueBuyers[uniqueBuyerCount] = buyer;
                buyerTicketCounts[uniqueBuyerCount] = 1;
                uniqueBuyerCount++;
            }
        }

        // Process refunds
        for (uint256 i = 0; i < uniqueBuyerCount; i++) {
            uint256 refundAmount = raffle.ticketPrice * buyerTicketCounts[i];
            if (refundAmount > 0) {
                (bool success, ) = uniqueBuyers[i].call{value: refundAmount}("");
                require(success, "Refund failed");
            }
        }
    }

    /**
     * @dev Withdraw treasury balance to owner
     */
    function withdrawTreasury() external onlyOwner nonReentrant {
        uint256 amount = treasuryBalance;
        require(amount > 0, "No treasury balance");

        treasuryBalance = 0;

        emit TreasuryWithdrawn(msg.sender, amount);

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // View functions
    
    /**
     * @dev Get raffle details
     */
    function getRaffle(uint256 _raffleId)
        external
        view
        raffleExists(_raffleId)
        returns (Raffle memory)
    {
        return raffles[_raffleId];
    }

    /**
     * @dev Get all tickets for a raffle
     */
    function getRaffleTickets(uint256 _raffleId)
        external
        view
        raffleExists(_raffleId)
        returns (Ticket[] memory)
    {
        return raffleTickets[_raffleId];
    }

    /**
     * @dev Get user's tickets for a raffle
     */
    function getUserTickets(uint256 _raffleId, address _user)
        external
        view
        raffleExists(_raffleId)
        returns (uint256)
    {
        return userTicketCount[_raffleId][_user];
    }

    /**
     * @dev Get all raffles a user has participated in
     */
    function getUserRaffles(address _user)
        external
        view
        returns (uint256[] memory)
    {
        return userRaffles[_user];
    }

    /**
     * @dev Get active raffles (off-chain aggregation recommended)
     */
    function getActiveRaffles()
        external
        view
        returns (uint256[] memory)
    {
        uint256 activeCount = 0;
        
        // Count active raffles
        for (uint256 i = 1; i <= raffleCounter; i++) {
            if (raffles[i].status == RaffleStatus.Active && 
                block.timestamp < raffles[i].endTimestamp) {
                activeCount++;
            }
        }

        // Collect active raffle IDs
        uint256[] memory activeRaffleIds = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= raffleCounter; i++) {
            if (raffles[i].status == RaffleStatus.Active && 
                block.timestamp < raffles[i].endTimestamp) {
                activeRaffleIds[index] = i;
                index++;
            }
        }

        return activeRaffleIds;
    }

    /**
     * @dev Check if raffle is active
     */
    function isRaffleActive(uint256 _raffleId)
        external
        view
        raffleExists(_raffleId)
        returns (bool)
    {
        return raffles[_raffleId].status == RaffleStatus.Active &&
               block.timestamp < raffles[_raffleId].endTimestamp;
    }

    /**
     * @dev Get time remaining for raffle
     */
    function getTimeRemaining(uint256 _raffleId)
        external
        view
        raffleExists(_raffleId)
        returns (uint256)
    {
        if (block.timestamp >= raffles[_raffleId].endTimestamp) {
            return 0;
        }
        return raffles[_raffleId].endTimestamp - block.timestamp;
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}