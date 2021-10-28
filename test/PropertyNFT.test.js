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

const PRESALE_SIGNER_PRIVATE_KEY = process.env.PRESALE_SIGNER_PRIVATE_KEY;
const PUBLIC_SIGNER_PRIVATE_KEY = process.env.PUBLIC_SIGNER_PRIVATE_KEY;
const PRESALE_SIGNER_ADDRESS = process.env.PRESALE_SIGNER_ADDRESS;
const PUBLIC_SIGNER_ADDRESS = process.env.PUBLIC_SIGNER_ADDRESS;
const presaleSigningKey = new ethers.utils.SigningKey(
  PRESALE_SIGNER_PRIVATE_KEY
);
const publicSigningKey = new ethers.utils.SigningKey(PUBLIC_SIGNER_PRIVATE_KEY);

describe("PropertyNFT", function () {
  let owner, treasury, alice, bob;
  let propertyNFT;

  before(async function () {
    // Get Fixture of Questing and Uninterested Unicorns
    await deployments.fixture(["PropertyNFT"]);
  });

  describe("mint()", async function () {});

  it("buyBRIX()", async function () {});

  it("sellBRIX()", async function () {});

  it("pause()", async function () {});

  it("unpause()", async function () {});
});
