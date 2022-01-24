const { expect } = require("chai");
const { ethers, getNamedAccounts, deployments, network } = require("hardhat");
const fs = require("fs");
const {
  BN, // Big Number support
  constants, // Common constants, like the zero address and largest integers
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time,
  snapshot,
} = require("@openzeppelin/test-helpers");

let abi = require("./PropertyNFTABI.json");

require("dotenv").config();

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

describe("PropertyNFT", function () {
  let owner, treasury, alice, bob, cindy, douglas;
  let propertyNFT;
  let available;

  before(async function () {
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0x4Bd74c39c35bB05Ca51B752EAe073072f0a8a355"],
    });
    owner = await ethers.getSigner(
      "0x4Bd74c39c35bB05Ca51B752EAe073072f0a8a355"
    );
    propertyNFT = new ethers.Contract(
      "0x18Cb9DB75FA62a9717aA98292B939e579b7c7Ccd",
      abi,
      owner
    );
    // console.log("🚀 | propertyNFT", propertyNFT);
  });

  it("Available Mints", async function () {
    available = await propertyNFT.getAvailable();
    console.log("Available Left: ", available.length);
    fs.writeFileSync(`avail.json`, available);
  });

  it("Reserve Remaining", async function () {
    let airdropList = [];
    console.log(available.length);
    for (let i = 0; i < available.length; i++) {
      airdropList.push(owner.address);
    }

    let chunks = chunkArray(airdropList, 100);

    for (chunk of chunks) {
      tx = await (await propertyNFT.airdrop(chunk)).wait();
      console.log("🚀 | tx", tx);
    }
    console.log(await propertyNFT.balanceOf(owner.address));
  });
});
