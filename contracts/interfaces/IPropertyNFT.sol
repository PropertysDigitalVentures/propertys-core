//SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IPropertyNFT is IERC721 {
    function updateRewardOnMint(address _user, uint256 _amount) external;

    function updateReward(address _from, address _to) external;

    function getReward(address _to) external;

    function burn(address _from, uint256 _amount) external;

    function mint(address to, uint256 amount) external;

    function getTotalClaimable(address _user) external view returns (uint256);
}
