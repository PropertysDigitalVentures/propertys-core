// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";

import "./interfaces/IBrickToken.sol";
import "./interfaces/IPropertyNFT.sol";
import "./interfaces/IPropertyGame.sol";

/// Manage Addresses of Propertys
contract AddressProvider is AccessControlEnumerableUpgradeable {
    IBrickToken public BRICK_TOKEN;
    IPropertyNFT public PROPERTY_NFT;
    IPropertyGame public PROPERTY_GAME;

    // Map tokenId to StreetId
    // Map tokenId to DistrictId
    // Map tokenId to CityId

    // Street Bonuses
    // District Bonuses
    // City Bonuses

    // Round Claimed

    // Implementation Free Space
    uint256[50] private __gap;

    constructor(
        address propertyNFT,
        address brickToken,
        address propertyGame
    ) {
        BRICK_TOKEN = IBrickToken(brickToken);
        PROPERTY_NFT = IPropertyNFT(propertyNFT);
        PROPERTY_GAME = IPropertyGame(propertyGame);
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
