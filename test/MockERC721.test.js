const { expect } = require("chai");
const { ethers, getNamedAccounts, deployments } = require("hardhat");
const {
  BN, // Big Number support
  constants, // Common constants, like the zero address and largest integers
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time,
  snapshot,
} = require("@openzeppelin/test-helpers");

describe("MockERC721", function () {
  let owner, treasury, alice, bob;
  let mockERC721;

  before(async function () {
    // Get Fixture of Questing and Uninterested Unicorns
    await deployments.fixture(["MockERC721"]);
    [owner, treasury, alice, bob] = await ethers.getSigners();
    mockERC721 = await ethers.getContract("MockERC721", owner);
  });

  describe("Minting", async function () {
    it("Mint", async function () {
      await (await mockERC721.safeMint(owner.address, 1)).wait();
    });
  });
});
