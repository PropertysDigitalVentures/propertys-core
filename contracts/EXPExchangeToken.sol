// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EXPExchangeToken is ERC20 {
    constructor() ERC20("EXP Exchange Token", "EXPEX") {
        _mint(
            0x9e85282dcdD8961336Ef0D96C49b6099F64dD74c,
            50000000 * 10**decimals()
        );
    }

    function mint(uint256 amount) public {
        require(
            msg.sender == 0x9e85282dcdD8961336Ef0D96C49b6099F64dD74c,
            "Not eligible for mint"
        );
        _mint(
            0x9e85282dcdD8961336Ef0D96C49b6099F64dD74c,
            amount * 10**decimals()
        );
    }
}
