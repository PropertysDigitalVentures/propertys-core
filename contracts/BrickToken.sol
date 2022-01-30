// //SPDX-License-Identifier: MIT
// pragma solidity 0.8.4;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
// import "@openzeppelin/contracts/security/Pausable.sol";
// import "@openzeppelin/contracts/access/AccessControl.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// contract BrickToken is
//     ERC20,
//     ERC20Burnable,
//     Pausable,
//     AccessControl,
//     ReentrancyGuard
// {

//     bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
//     bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
//     bytes32 public constant PROPERTY_ROLE = keccak256("PROPERTY_ROLE"); // Granted to Property NFT Contract

//     uint256 public totalETHReceived = 0;
//     uint256 public round = 0;
//     uint256 public currentPrice;
//     uint256 public brixPool; // Keep track of brix avail for purchase

//     mapping(uint256 => Round) public rounds;
//     mapping(uint256 => bool) public brixDistributed;

//     event RoyaltiesReceived(address indexed sender, uint256 amount);
//        constructor(address propertyAddress) ERC20("BrickToken", "BRIX") {
//         _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
//         _setupRole(PAUSER_ROLE, msg.sender);
//         _setupRole(MINTER_ROLE, msg.sender);
//         _setupRole(PROPERTY_ROLE, propertyAddress);
//     }

//     /// @dev On recieving ETH directly
//     receive() external payable {
//         totalETHReceived += msg.value;
//         rounds[round].ETH += msg.value;
//         emit RoyaltiesReceived(msg.sender, msg.value);
//     }

//     /// @dev To pause the smart contract
//     function pause() public onlyRole(PAUSER_ROLE) {
//         _pause();
//     }

//     /// @dev To unpause the smart contract
//     function unpause() public onlyRole(PAUSER_ROLE) {
//         _unpause();
//     }

//     function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
//         _mint(to, amount);
//     }

    

  
//     /// @dev Injects BRIX into the smart contract ready to be claimed.
   
//     function _beforeTokenTransfer(
//         address from,
//         address to,
//         uint256 amount
//     ) internal override whenNotPaused {
//         super._beforeTokenTransfer(from, to, amount);
//     }
// }



// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
// import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract BrickToken is ERC20, Pausable, Ownable {
    
    constructor() ERC20("BrickToken", "BRIX") {}


    function mints(uint256 amount) public    onlyOwner{
            _mint(msg.sender, amount);
    }
     function transfer(address recipient, uint256 amount) public virtual override whenNotPaused returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }
    /**
     * @dev See {ERC20-_mint}.
     */

    function _mint(address account, uint256 amount)
        internal
        virtual
        override
        whenNotPaused
    {
        super._mint(account, amount * 10**uint256(ERC20.decimals()));
        // super._mint(account, amount);
    }


    function _Pause() public onlyOwner {
         _pause();
    }

    function _UnPause() public onlyOwner {
         _unpause();
         
    }
}

