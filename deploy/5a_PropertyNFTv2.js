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
  console.log(`Deploying PropertyNFTv2... from ${deployer}`);

  let propertyNFT = await deploy("PropertyNFTv2", {
    from: deployer,
    args: [],
  });

  gasLogger.addDeployment(propertyNFT);
};

module.exports.tags = ["PropertyNFTv2"];
