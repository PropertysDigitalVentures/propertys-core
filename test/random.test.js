const { expect } = require("chai");
const { ethers, getNamedAccounts, deployments } = require("hardhat");
const {
  BN, // Big Number support
  constants, // Common constants, like the zero address and largest integers
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time,
} = require("@openzeppelin/test-helpers");

require("dotenv").config();

describe("Random", function () {
  let owner, treasury, alice, bob;
  let uninterestedUnicorns;
  let random;
  let clans;

  before(async function () {
    // Get Fixture of Questing and Uninterested Unicorns
    await deployments.fixture(["Random"]);

    random = await ethers.getContract("Random");
  });

  // it("getPRNG()", async function () {
  //   let results;
  //   results = await random.getPRNG(1);
  //   console.log("🚀 | results", results.toString());
  // });

  // it("getMultiPRNG()", async function () {
  //   let results;
  //   results = await random.getMultiPRNG();
  //   console.log("🚀 | results", results.toString());
  // });

  it("test push and pop", async function () {
    let testArray = await random.getTestArray();
    console.log("🚀 | testArray", testArray);

    await (await random.popTestArray(2)).wait();
    testArray = await random.getTestArray();
    console.log("🚀 | testArray", testArray);

    // await (await random.pushTestArray(3)).wait();
    // testArray = await random.getTestArray();
    // console.log("🚀 | testArray", testArray);

    // await (await random.pushMultipleTestArray([3])).wait();
    // testArray = await random.getTestArray();
    // console.log("🚀 | testArray", testArray);

    // await (await random.pushMultipleTestArray([3, 3, 3, 3, 3, 3, 3])).wait();
    // testArray = await random.getTestArray();
    // console.log("🚀 | testArray", testArray);

    // await (
    //   await random.pushMultipleTestArray([
    //     5, 5, 5, 5, 5, 5, 5, 1, 2, 3, 3, 12, 2, 1, 1, 1,
    //   ])
    // ).wait();
    // testArray = await random.getTestArray();
    // console.log("🚀 | testArray", testArray);
  });
});
