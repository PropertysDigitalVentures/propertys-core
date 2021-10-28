const { ethers } = require("hardhat");

const { GasLogger } = require("../utils/helper.js");
const gasLogger = new GasLogger();

require("dotenv").config();

module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
}) => {
  const { deploy } = deployments;
  const { deployer, adminAddress, treasuryAddress } = await getNamedAccounts();
  const [owner] = await ethers.getSigners();

  // Config

  // DEPLOY Random
  console.log(`Deploying EXPExchangeToken... from ${deployer}`);

  let brickToken = await deploy("EXPExchangeToken", {
    from: deployer,
    args: [],
  });

  gasLogger.addDeployment(brickToken);
};

module.exports.tags = ["EXPExchangeToken"];
