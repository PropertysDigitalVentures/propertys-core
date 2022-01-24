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

describe("Brick Token", function () {
  let owner, treasury, alice, bob;
  let provider;
  let propertyNFT;
  let brickToken;
  let clans;

  before(async function () {
    // Get Fixture of Questing and
    await deployments.fixture(["BrickToken"]);

    [owner, treasury, alice, bob] = await ethers.getSigners();
    provider = ethers.provider;

    brickToken = await ethers.getContract("BrickToken");
    // Add 100 ETH to the contract to simulate ETH from OS Royalties
    await (
      await owner.sendTransaction({
        to: brickToken.address,
        value: ethers.utils.parseEther("100.0"),
      })
    ).wait();

    let contractBalance = await provider.getBalance(brickToken.address);
    console.log(
      "🚀 | contractBalance",
      ethers.utils.formatEther(contractBalance)
    );

    // expect(contractBalance.equals(ethers.utils.parseEther("100")));
  });

  describe("mint()", async function () {
    it("Only MINTER_ROLE", async function () {
      // Expect revert when minting with signer without minter role
      await expectRevert(
        brickToken
          .connect(alice)
          .mint(alice.address, ethers.utils.parseEther("1")),
        "AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6"
      );

      // Try mint with signer with minter role
      await (
        await brickToken
          .connect(owner)
          .mint(owner.address, ethers.utils.parseEther("1"))
      ).wait();

      expect(await brickToken.balanceOf(owner.address)).to.equal(
        ethers.utils.parseEther("1")
      );
    });
  });

  it("buyBRIX()", async function () {
    let brixPrice = await brickToken.calculatePrice();
    console.log("🚀 | brixPrice", brixPrice);
    // Should not be able to buy if insufficient brix in pool
    await expectRevert(brickToken.connect(alice).buyBRIX(1));

    // ETH price input should be correct

    // BRIX amount should be correct
  });

  it("sellBRIX()", async function () {});

  it("pause()", async function () {});

  it("unpause()", async function () {});
});
