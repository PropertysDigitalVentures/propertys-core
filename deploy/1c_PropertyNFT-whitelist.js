const { ethers } = require("hardhat");
const { GasLogger } = require("../utils/helper.js");

require("dotenv").config();

const chainlinkTokenABI = require("../abis/ChainlinkTokenABI.json");

const PRESALE_SIGNER_ADDRESS = process.env.PRESALE_SIGNER_ADDRESS;
const PUBLIC_SIGNER_ADDRESS = process.env.PUBLIC_SIGNER_ADDRESS;

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
  console.log("Chain ID: ", chainId);

  if (chainId === "1") {
    console.log("🌐 Mainnet Deployment");

    privateSaleStart = 1637334000; // Friday, November 19, 2021 11:00 PM GMT + 8
    privateSaleWindow = 3600; // 1 Hour
    publicSaleStart = 1637506800; // Sunday, 21 November 2021 23:00:00 GMT+08:00
    linkToken = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
    vrfCoordinator = "0xf0d54349aDdcf704F77AE15b96510dEA15cb7952";
    keyhash =
      "0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445";
    fee = ethers.utils.parseEther("2");
  } else if (chainId === "4") {
    console.log("🌐 Rinkeby Deployment");

    privateSaleStart = Math.round(Date.now() / 1000) + 3600;
    privateSaleWindow = 3600; // 1 Hour
    publicSaleStart = Math.round(Date.now() / 1000) + 86400 + 3600;
    linkToken = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
    vrfCoordinator = "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B";
    keyhash =
      "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311";
    fee = ethers.utils.parseEther("0.1");
  }

  console.log("Setting PropertyNFT...");

  const availableProperty = require("../data/postalCodes.json");
  let linkToken, fee;

  let propertyNFTContract = await ethers.getContract("PropertyNFT", owner);

  // Set Available Mints
  chunks = chunkArray(availableProperty, 2000);

  for (chunk of chunks) {
    tx = await (await propertyNFTContract.pushAvailable(chunk)).wait();
    gasLogger.addTransaction(tx);
  }

  // Get Initial Random Seed
  if (chainId === "31337") {
    console.log("💻 Localhost Deployment");
    await (await propertyNFTContract.mockfulfillRandomness(1337)).wait();
  } else if (chainId === "4") {
    console.log("🌐 Rinkeby Deployment");

    // Send Chainlink Tokens to contract
    let chainlink = new ethers.Contract(linkToken, chainlinkTokenABI, owner);
    console.log(
      `🟡 Transferring ${ethers.utils.formatEther(fee)} LINK to ${
        propertyNFTContract.address
      }...`
    );
    await (
      await chainlink.transfer(
        propertyNFTContract.address,
        ethers.utils.parseEther("1")
      )
    ).wait();
    console.log(
      `🟢 Transferred ${ethers.utils.formatEther(fee)} LINK to ${
        propertyNFTContract.address
      }`
    );

    // Request Randomness
    await (await propertyNFTContract.initializeRandomness()).wait();

    console.log(`🟢 Randomness Initialized!`);
  } else if (chainId === "1") {
    console.log("🌐 Mainnet Deployment");
    let chainlink = new ethers.Contract(linkToken, chainlinkTokenABI, owner);
    console.log(
      `🟡 Transferring ${ethers.utils.formatEther(fee)} LINK to ${
        propertyNFTContract.address
      }...`
    );
    await (await chainlink.transfer(propertyNFTContract.address, fee)).wait();
    console.log(
      `🟢 Transferred ${ethers.utils.formatEther(fee)} LINK to ${
        propertyNFTContract.address
      }`
    );

    // Request Randomness
    await (await propertyNFTContract.initializeRandomness()).wait();
    console.log(`🟢 Randomness Initialized!`);
  }
};

module.exports.dependencies = ["PropertyNFT"];
module.exports.tags = ["PropertyNFTWhitelist"];
