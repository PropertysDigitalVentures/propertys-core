const { ethers } = require("hardhat");
const { GasLogger } = require("../utils/helper.js");

require("dotenv").config();

const chainlinkTokenABI = require("../abis/ChainlinkTokenABI.json");
const gasLogger = new GasLogger();

module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
}) => {
  const { deploy } = deployments;
  const { deployer, adminAddress, collectionOwner, treasuryAddress } =
    await getNamedAccounts();
  const [owner] = await ethers.getSigners();
  const chainId = await getChainId();
  console.log("ChainId: ", chainId);

  // Config
  console.log(`Setting PropertyNFTv2... from ${deployer}`);

  let propertyNFT = await ethers.getContract("PropertyNFT");
  gasLogger.addDeployment(propertyNFT);
};

module.exports.dependencies = ["PropertyNFTv2"];
module.exports.tags = ["PropertyNFTv2Settings"];
