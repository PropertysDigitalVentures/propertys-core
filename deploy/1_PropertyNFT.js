const { ethers } = require("hardhat");
const { GasLogger } = require("../utils/helper.js");

require("dotenv").config();

const PRESALE_SIGNER_ADDRESS = process.env.PRESALE_SIGNER_ADDRESS;
const PUBLIC_SIGNER_ADDRESS = process.env.PUBLIC_SIGNER_ADDRESS;

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

  // Config

  // DEPLOY Random
  console.log(`Deploying PropertyNFT... from ${deployer}`);

  // string memory _name,
  // string memory _symbol,
  // string memory _notRevealedUri,
  // address _owner,
  // address _treasury

  let propertyNFT = await deploy("PropertyNFT", {
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: "OptimizedTransparentProxy",
      execute: {
        init: {
          methodName: "__PropertyNFT_init",
          args: [
            "Property",
            "PP",
            "",
            PRESALE_SIGNER_ADDRESS,
            PUBLIC_SIGNER_ADDRESS,
            collectionOwner,
            treasuryAddress,
          ],
        },
        // onUpgrade: {
        //   methodName: "__UniQuest_upgrade",
        //   args: [2],
        // },
      },
    },
  });

  gasLogger.addProxyDeployment(propertyNFT);
};

module.exports.tags = ["PropertyNFT"];
