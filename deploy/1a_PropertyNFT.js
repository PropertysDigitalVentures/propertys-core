const { ethers } = require("hardhat");
const { GasLogger } = require("../utils/helper.js");

require("dotenv").config();

const chainlinkTokenABI = require("../abis/ChainlinkTokenABI.json");
const gasLogger = new GasLogger();

function chunkArray(myArray, chunk_size) {
  var index = 0;
  var arrayLength = myArray.length;
  var tempArray = [];

  for (index = 0; index < arrayLength; index += chunk_size) {
    myChunk = myArray.slice(index, index + chunk_size);
    // Do something if you want with the group
    tempArray.push(myChunk);
  }

  return tempArray;
}

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
  console.log("🚀 | chainId", chainId);

  // Config
  console.log(`Deploying PropertyNFT... from ${deployer}`);

  let privateSaleStart, privateSaleWindow, publicSaleStart;
  let linkToken, vrfCoordinator, keyhash, fee;

  if (chainId === "31337") {
    console.log("💻 Localhost Deployment");

    privateSaleStart = Math.round(Date.now() / 1000) + 3600;
    publicSaleStart = Math.round(Date.now() / 1000) + 86400 + 3600;
    linkToken = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
    vrfCoordinator = "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B";
    keyhash =
      "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311";

    fee = ethers.utils.parseEther("0.1");
  } else if (chainId === "4") {
    console.log("🌐 Rinkeby Deployment");

    privateSaleStart = Math.round(Date.now() / 1000) + 3600;
    publicSaleStart = Math.round(Date.now() / 1000) + 86400 + 3600;
    linkToken = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
    vrfCoordinator = "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B";
    keyhash =
      "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311";
    fee = ethers.utils.parseEther("0.1");
  } else if (chainId === "1") {
    console.log("🌐 Mainnet Deployment");
    privateSaleStart = process.env.PRE_SALE_START; // Friday, 10 December 2021 00:00:00
    publicSaleStart = process.env.PUBLIC_SALE_START; // Sunday, 12 December 2021 00:00:00
    linkToken = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
    vrfCoordinator = "0xf0d54349aDdcf704F77AE15b96510dEA15cb7952";
    keyhash =
      "0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445";
    fee = ethers.utils.parseEther("2");
  }

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
            process.env.IPFS_PREREVEAL,
            collectionOwner,
            treasuryAddress,
            privateSaleStart,
            publicSaleStart,
            vrfCoordinator,
            linkToken,
            keyhash,
            fee,
            process.env.SIGNER_TEST_ADDRESS,
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
