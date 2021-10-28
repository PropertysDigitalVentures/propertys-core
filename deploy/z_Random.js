const { ethers } = require("hardhat");

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
  console.log(`Deploying Random... from ${deployer}`);

  let uniQuest = await deploy("Random", {
    from: deployer,
    args: [],
  });
};

module.exports.tags = ["Random"];
