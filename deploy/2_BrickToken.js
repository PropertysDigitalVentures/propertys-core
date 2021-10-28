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
  console.log(`Deploying Brick Token... from ${deployer}`);

  let brickToken = await deploy("BrickToken", {
    from: deployer,
    args: [],
  });
};

module.exports.tags = ["BrickToken"];
