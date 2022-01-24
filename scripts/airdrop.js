const { ethers, getNamedAccounts, deployments } = require("hardhat");
const { GasLogger } = require("../utils/helper.js");
const gasLogger = new GasLogger();
let airdropList = require("../data/airdrop.json");

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

async function main() {
  const chainId = await getChainId();
  const [owner] = await ethers.getSigners();
  let propertyNFTContract;
  console.log("Chain ID: ", chainId);

  if (chainId === "1") {
    propertyNFTContract = await ethers.getContract("PropertyNFT", owner);
  } else if (chainId === "4") {
    propertyNFTContract = await ethers.getContract("PropertyNFT", owner);
  } else {
    return;
  }

  console.log("Airdrop Count: ", airdropList.length);

  let chunks = chunkArray(airdropList, 100);

  for (chunk of chunks) {
    tx = await (await propertyNFTContract.airdrop(chunk)).wait();
    gasLogger.addTransaction(tx);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
