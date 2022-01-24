const { ethers, getNamedAccounts, deployments } = require("hardhat");
const fs = require("fs");
const Hash = require("ipfs-only-hash");

const { chunkArray } = require("../utils/helper");

async function main() {
  const assetsFolder = "./assets/";
  // Get list of images in assets directory
  let out = {};
  let files = fs.readdirSync(assetsFolder);

  for (file of files) {
    // Read Image Data
    let readableStreamForFile = fs.createReadStream(`${assetsFolder}/${file}`);
    let imageHash = await Hash.of(readableStreamForFile);
    console.log(`📄 ${file} | ${imageHash}`);
    // Map File Name to Hash
    out[file] = imageHash;
  }

  // Output Mapping to (imageHashes.json)
  fs.writeFileSync("./data/imageHashes.json", JSON.stringify(out, null, 2), {
    flag: "w+",
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
