// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";

import "./interfaces/IBrickToken.sol";
import "./interfaces/IPropertyNFT.sol";

/// Manage Reward Logic
contract PropertyGame is
    PausableUpgradeable,
    AccessControlEnumerableUpgradeable
{
    IBrickToken public BRICK_TOKEN;
    IPropertyNFT public PROPERTY_NFT;

    // Map tokenId to StreetId
    // Map tokenId to DistrictId
    // Map tokenId to CityId

    // Street Bonuses
    // District Bonuses
    // City Bonuses

    // Each Street / District / City Bonus can only be claimed once
    // Last Timestamp of Street Rewards Claimed (to make sure user does not transfer and do double claim)
    // Last Timestamp of District Rewards Claimed (to make sure user does not transfer and do double claim)
    // Last Timestamp of City Rewards Claimed (to make sure user does not transfer and do double claim)

    constructor(address propertyNFT, address brickToken) {
        PROPERTY_NFT = IPropertyNFT(propertyNFT);
        BRICK_TOKEN = IBrickToken(brickToken);
    }

    /// @dev Calculate BRIX Rewards based on address
    function calculateRewards(address user) public {
        // Caluclate Street Bonus
        // Calculate District Bonus
        // Calculate City Bonus
    }

    /// @dev Set BRICK_TOKEN

    /// @dev Set PROPERTY_NFT
}
