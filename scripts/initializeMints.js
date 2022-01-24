const { ethers, getNamedAccounts, deployments } = require("hardhat");

async function main() {
  const chainId = await getChainId();
  const [owner] = await ethers.getSigners();
  const availableProperty = require("../data/postalCodes.json");
  console.log("🚀 | main | chainId", chainId);
  let propertyNFTContract = await ethers.getContract("PropertyNFT", owner);

  // Set Available Mints
  chunks = chunkArray(availableProperty, 2000);

  for (chunk of chunks) {
    tx = await (await propertyNFTContract.pushAvailable(chunk)).wait();
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
