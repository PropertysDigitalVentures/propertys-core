const { ethers, getNamedAccounts, deployments } = require("hardhat");
const fs = require("fs");

const { chunkArray, GasLogger } = require("../utils/helper");

const PAWhitelist = require("../data/whitelist/propertyAgents.json"); // Tier 1
const SBWhitelist = require("../data/whitelist/seniorBrokers.json"); // Tier 2
const ERWhitelist = require("../data/whitelist/executiveRealtors.json"); // Tier 3 (highest)

const partnerWhitelist = require("../data/whitelist/partnerWhitelist.json");

gasLogger = new GasLogger();

async function main() {
  const chainId = await getChainId();
  const [owner] = await ethers.getSigners();
  console.log("🚀 | main | chainId", chainId);
  let propertyNFT;
  if (chainId === "4") {
    propertyNFT = await ethers.getContract("BobbyFischer", owner);
  } else if (chainId === "1") {
    propertyNFT = await ethers.getContract("PropertyNFT", owner);
  } else if (chainId === "31337") {
    propertyNFT = await ethers.getContract("BobbyFischer", owner);
  }

  // Combine Whitelists and store to temp file (combinedWhitelist.js)
  let combinedWhitelistAddresses = [];
  let combinedWhitelistTiers = [];

  // PA Whitelist
  for (address of PAWhitelist) {
    combinedWhitelistAddresses.push(address);
    combinedWhitelistTiers.push(1);
  }

  // PA Whitelist
  for (address of SBWhitelist) {
    combinedWhitelistAddresses.push(address);
    combinedWhitelistTiers.push(2);
  }

  // PA Whitelist
  for (address of ERWhitelist) {
    combinedWhitelistAddresses.push(address);
    combinedWhitelistTiers.push(3);
  }

  // Check for duplicates
  let findDuplicates = (arr) =>
    arr.filter((item, index) => arr.indexOf(item) != index);

  if (findDuplicates(combinedWhitelistAddresses).length > 0) {
    console.log("🔴 Duplicates Found");
    console.log(findDuplicates(combinedWhitelistAddresses)); // All duplicates
    console.log([...new Set(findDuplicates(combinedWhitelistAddresses))]); // Unique duplicates
    process.exit(1);
  }

  if (combinedWhitelistAddresses.length === 0) {
    console.log("🔴 0 Whitelist Records");
    process.exit(1);
  }

  fs.writeFileSync(
    "./data/combinedWhitelistAddresses.json",
    JSON.stringify(combinedWhitelistAddresses, null, 2),
    {
      flag: "w+",
    }
  );

  fs.writeFileSync(
    "./data/combinedWhitelistTiers.json",
    JSON.stringify(combinedWhitelistTiers, null, 2),
    {
      flag: "w+",
    }
  );

  // Chunk Whitelists into 300s
  let chunkAddresses = chunkArray(combinedWhitelistAddresses, 300);

  let chunkTiers = chunkArray(combinedWhitelistTiers, 300);

  // Whitelist Private Sales
  for (let i = 0; i < chunkAddresses.length; i++) {
    tx = await (
      await propertyNFT.whitelistUsers(chunkAddresses[i], chunkTiers[i])
    ).wait();

    gasLogger.addTransaction(tx);
  }

  if (partnerWhitelist.length === 0) {
    console.log("🔴 0 Partner Whitelist Records");
    process.exit(1);
  }

  // Whitelist Partners
  await (await propertyNFT.whitelistPartners(partnerWhitelist)).wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
