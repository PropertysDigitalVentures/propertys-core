const { ethers, getNamedAccounts, deployments } = require("hardhat");
const chainlinkTokenABI = require("../abis/ChainlinkTokenABI.json");
async function main() {
  const chainId = await getChainId();
  const [owner] = await ethers.getSigners();
  console.log("🚀 | main | chainId", chainId);
  let propertyNFTContract = await ethers.getContract("PropertyNFT", owner);

  let privateSaleStart, privateSaleWindow, publicSaleStart;
  let linkToken, vrfCoordinator, keyhash, fee;

  if (chainId === "31337") {
    console.log("💻 Localhost Deployment");

    linkToken = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
    vrfCoordinator = "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B";
    keyhash =
      "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311";

    fee = ethers.utils.parseEther("0.1");
  } else if (chainId === "4") {
    console.log("🌐 Rinkeby Deployment");
    linkToken = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
    vrfCoordinator = "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B";
    keyhash =
      "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311";
    fee = ethers.utils.parseEther("0.1");
  } else if (chainId === "1") {
    console.log("🌐 Mainnet Deployment");

    linkToken = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
    vrfCoordinator = "0xf0d54349aDdcf704F77AE15b96510dEA15cb7952";
    keyhash =
      "0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445";
    fee = ethers.utils.parseEther("2");
  }

  // Get Initial Random Seed
  if (chainId === "31337") {
    console.log("💻 Localhost Deployment");
    await (await propertyNFTContract.mockfulfillRandomness(1337)).wait();
  } else if (chainId === "4") {
    console.log("🌐 Rinkeby Deployment");
    // Send Chainlink Tokens to contract
    console.log("🚀 | main | linkToken", linkToken);
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
    tx = await propertyNFTContract.initializeRandomness();
    console.log("🚀 | main | tx", tx);

    await tx.wait();

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
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
