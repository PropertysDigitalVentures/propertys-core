const { ethers, getNamedAccounts, deployments } = require("hardhat");

async function main() {
  const chainId = await getChainId();
  const [owner] = await ethers.getSigners();
  const availableProperty = require("../data/postalCodes.json");
  console.log("🚀 | main | chainId", chainId);
  let propertyNFTContract = await ethers.getContract("BobbyFischer", owner);

  console.log(await propertyNFTContract.tokenURI(33620250));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
