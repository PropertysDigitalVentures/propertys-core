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
  console.log(`Deploying ERC1155SnapshotUpgradeable... from ${deployer}`);

  let erc1155 = await deploy("ERC1155SnapshotUpgradeable", {
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: "OptimizedTransparentProxy",
      execute: {
        init: {
          methodName: "__ERC1155Snapshot_init",
          args: [],
        },
        // onUpgrade: {
        //   methodName: "__UniQuest_upgrade",
        //   args: [2],
        // },
      },
    },
  });
};

module.exports.tags = ["ERC1155"];
