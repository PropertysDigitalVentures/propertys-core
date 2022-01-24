const { ethers, getNamedAccounts, deployments } = require("hardhat");

async function main() {
  const chainId = await getChainId();
  const [owner] = await ethers.getSigners();
  console.log("ChainId: ", chainId);
  let propertyNFTContract;

  if (chainId === "31337") {
    console.log("💻 Localhost Deployment");
    propertyNFTContract = await ethers.getContract("PropertyNFT", owner);

    privateSaleStart = Math.round(Date.now() / 1000) + 3600;
    publicSaleStart = Math.round(Date.now() / 1000) + 86400 + 3600;
  } else if (chainId === "4") {
    console.log("🌐 Rinkeby Deployment");
    propertyNFTContract = await ethers.getContract("PropertyNFT", owner);

    privateSaleStart = Math.round(Date.now() / 1000) + 30; // 5 Mins Delay
    publicSaleStart = Math.round(Date.now() / 1000) + 30 + 300; // 2 Hours Window

    // privateSaleStart = 1639148400; // 5 Mins Delay
    // publicSaleStart = 1639321200; // 2 Hours Window
  } else if (chainId === "1") {
    console.log("🌐 Mainnet Deployment");
    propertyNFTContract = await ethers.getContract("PropertyNFT", owner);

    privateSaleStart = 1639148400;
    publicSaleStart = 1639321200;
  }

  await (await propertyNFTContract.updatePresaleStart(privateSaleStart)).wait();
  console.log("🟢 Presale Timing Updated!");
  await (
    await propertyNFTContract.updatePublicSaleStart(publicSaleStart)
  ).wait();
  console.log("🟢 Public Sale Timing Updated!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
