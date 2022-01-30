// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";

import "./interfaces/IBrickToken.sol";
import "./interfaces/IPropertyNFT.sol";

/// Manage Reward Logic
contract PropertyGame is
    PausableUpgradeable,
    AccessControlEnumerableUpgradeable
{
    // round startTime
    uint256 startTime;
    // claim windows
    uint256 claimWindow = 3 days;
    // when claimPeriod is active or not
    bool isClaimPeriod;
    // round end time
    uint256 roundEndTime;


// EXAMPLE 1: Pure Street until City — Beige Bay: 
// 1x House = 10 $BRIX
// 1x Pure Street: 7x10 $BRIX + 300 $BRIX (Street Bonus) = 370 $BRIX
// 1x District: 3x 370 $BRIX + 500 $BRIX (District Bonus) = 1610 $BRIX
// 1x City: 5x 1610 $BRIX + 1000 $BRIX (City Bonus) = 9050 $BRIX

    // reward emmittion rate per 30 days
    uint HouseRewards = 10;
    uint Streetreward = 70;
    uint DistrictRewards = 370;
    uint CityRewards = 1610;

    // Bonus rewards
    uint StreetBonus = 300;
    uint DistrictBonus = 500;
    uint CityBonus = 1000;


// EXAMPLE 2: Impure Street — Any 7 cards from any 7 cities.
// 1x House = 10 $BRIX
// 1x Impure Street = 7x Random Houses = 7x10 $BRIX + 150 $BRIX = 220 $BRIX


// impure Bonus rewards
 uint StreetBonus = 150;


    

    // amount of times a token is used to claim
    mapping(uint256 => uint256) tokenClaim;

    IBrickToken public BRICK_TOKEN;
    IPropertyNFT public PROPERTY_NFT;

    // Map tokenId to StreetId
    // Map tokenId to DistrictId
    // Map tokenId to CityId

    mapping (uint => uint) StreetId;
    mapping (uint => uint) DistrictId;
    mapping (uint => uint) CityId;

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
    /// @dev Calculate reward base on token

           // Caluclate Street 
        // Calculate District 
        // Calculate City 





    /// @dev Caluclate Street Bonus

    /// @dev  Calculate District Bonus

    /// @dev Calculate City Bonus

    /// @dev Set BRICK_TOKEN
    function setBrickToken(address _brickToken) public {
        BRICK_TOKEN = IBrickToken(_brickToken);
    }

    /// @dev Set PROPERTY_NFT
    function setProperty_nft(address _propertyNFT) public {
        PROPERTY_NFT = IPropertyNFT(_propertyNFT);
    }

    /// @dev calculate current Round

    function getCurrentRound() public returns (uint256) {
        startTime = block.timestamp;
        uint timeElapse;
       timeElapse = block.timestamp - startTime;
    }

    /// @dev claim token
    function claim(uint256[] _tokenId) public {
       // IERC721(PROPERTY_NFT).parsePostalCode()
        for (uint256 i = 0; i < _tokenId.length; i++) {
            require(tokenClaimed[i] < getCurrentRound(), "Reward has been claimed for this token");
            tokenClaimed[i] += 1;
        }
    }
}
