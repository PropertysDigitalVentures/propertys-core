const { ethers } = require("hardhat");

const availableProperty = require("../data/postalCodes.json");

async function main() {
  let pp = await ethers.Contract("PropertyNFT");

  console.log(await pp.TREASURY());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
