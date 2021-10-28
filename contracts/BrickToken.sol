//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BrickToken is
    ERC20,
    ERC20Burnable,
    Pausable,
    AccessControl,
    ReentrancyGuard
{
    struct Round {
        uint256 BRIX;
        uint256 ETH;
    }

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PROPERTY_ROLE = keccak256("PROPERTY_ROLE"); // Granted to Property NFT Contract

    uint256 public totalETHReceived = 0;
    uint256 public round = 0;
    uint256 public currentPrice;
    uint256 public brixPool; // Keep track of brix avail for purchase

    mapping(uint256 => Round) public rounds;
    mapping(uint256 => bool) public brixDistributed;

    event RoyaltiesReceived(address indexed sender, uint256 amount);
    event PriceUpdated(uint256 indexed round, uint256 roundPrice);
    event BrixInjected(uint256 indexed round, uint256 amount);

    constructor(address propertyAddress) ERC20("BrickToken", "BRIX") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(PROPERTY_ROLE, propertyAddress);
    }

    /// @dev On recieving ETH directly
    receive() external payable {
        totalETHReceived += msg.value;
        rounds[round].ETH += msg.value;
        emit RoyaltiesReceived(msg.sender, msg.value);
    }

    /// @dev To pause the smart contract
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @dev To unpause the smart contract
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /// @dev Buy BRIX with ETH, only if there are reserves in the pool
    function buyBRIX(uint256 amount) public payable nonReentrant {
        require(amount > 0, "BrickToken: Must be greater than 0");
        require(
            getBRIXPool() >= amount,
            "BrickToken: Insufficient Bricks in Pool"
        );
        require(
            msg.value == amount / currentPrice,
            "BrickToken: Incorrect ETH amount"
        ); /// ETH = BRIX / (BRIX / ETH)

        // Remove BRIX from pool
        brixPool -= amount;
        transfer(msg.sender, amount);
    }

    /// @dev Sell BRIX to get ETH
    function sellBRIX(uint256 amount) public nonReentrant {
        require(amount > 0, "BrickToken: Must be greater than 0");
        require(
            balanceOf(msg.sender) >= amount,
            "BrickToken: User does not have enough bricks"
        );

        // Remove BRIX from pool
        brixPool += amount;

        uint256 ethAmount = amount / currentPrice;
        transferFrom(msg.sender, address(this), amount);

        (bool success, ) = msg.sender.call{value: ethAmount}("");
        require(
            success,
            "BrickToken: not able to forward msg value to treasury"
        );
    }

    /// @dev Get amount of BRIX in pool available for purchase
    function getBRIXPool() public view returns (uint256) {
        return brixPool;
    }

    /// @dev Calculates BRIX per ETH
    /// @notice Price of 1 BRIX = totalSupply of BRIX / totalETH in Contract
    function calculatePrice() public view returns (uint256 _price) {
        require(getETHBalance() == 0, "BrickToken: No ETH in reserve");
        require(totalSupply() == 0, "BrickToken: No BRIX minted yet");
        _price = totalSupply() / getETHBalance();
    }

    /// @dev Updates BRIX per ETH for current round
    /// @notice Price of 1 BRIX = totalSupply of BRIX / totalETH in Contract
    function updatePrice() public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(getETHBalance() == 0, "BrickToken: No ETH in reserve");
        require(totalSupply() == 0, "BrickToken: No BRIX minted yet");
        currentPrice = totalSupply() / getETHBalance();

        emit PriceUpdated(round, currentPrice);
    }

    function increaseRound() external onlyRole(PROPERTY_ROLE) {
        round += 1;
    }

    /// @dev Injects BRIX into the smart contract ready to be claimed.
    function updateRoundRewards(uint256 amount)
        external
        onlyRole(PROPERTY_ROLE)
    {
        require(
            !brixDistributed[round],
            "BrickToken: BRIX already injected this round"
        );
        _mint(address(this), amount);
        rounds[round].BRIX += amount;
        emit BrixInjected(round, amount);
    }

    function getETHBalance() public view returns (uint256) {
        return totalETHReceived;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
