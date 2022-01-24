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

  console.log("Chain ID: ", chainId);
  let linkToken, fee;
  if (chainId === "1") {
    console.log("🌐 Mainnet Deployment");

    linkToken = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
    vrfCoordinator = "0xf0d54349aDdcf704F77AE15b96510dEA15cb7952";
    keyhash =
      "0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445";
    fee = ethers.utils.parseEther("2");
  } else if (chainId === "4") {
    console.log("🌐 Rinkeby Deployment");

    linkToken = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
    vrfCoordinator = "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B";
    keyhash =
      "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311";
    fee = ethers.utils.parseEther("0.1");
  }

  console.log("Setting PropertyNFT...");

  let propertyNFTContract = await ethers.getContract("BobbyFischer", owner);

  if ((await propertyNFTContract.getAvailable()).length === 0) {
    // Set Available Mints
    const availableProperty = require("../data/postalCodes.json");
    chunks = chunkArray(availableProperty, 2000);

    for (chunk of chunks) {
      tx = await (await propertyNFTContract.pushAvailable(chunk)).wait();
      gasLogger.addTransaction(tx);
    }
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
    await (await chainlink.transfer(propertyNFTContract.address, fee)).wait();
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
    // Send Chainlink Tokens to contract
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

module.exports.dependencies = ["PropertyNFTStealth"];
module.exports.tags = ["PropertyNFTStealthSettings"];
