const { ethers, getNamedAccounts, deployments } = require("hardhat");

async function main() {
  const chainId = await getChainId();
  const [owner] = await ethers.getSigners();
  let propertyNFTContract;
  console.log("Chain ID: ", chainId);

  if (chainId === "1") {
    propertyNFTContract = await ethers.getContract("PropertyNFT", owner);
  } else if (chainId === "4") {
    propertyNFTContract = await ethers.getContract("BobbyFischer", owner);
  } else {
    return;
  }

  // Update Base URI
  console.log(`🟡 Updating Base URI...`);
  tx = await (
    await propertyNFTContract.updateBaseURI(process.env.IPFS_GATEWAY)
  ).wait();

  console.log(`🟢 Base URI Updated to ${process.env.IPFS_GATEWAY}!`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
