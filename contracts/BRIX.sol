

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
// import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract BrixToken is ERC20, Pausable, Ownable {
    
    constructor() ERC20("BrixToken", "BRIX") {}


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

