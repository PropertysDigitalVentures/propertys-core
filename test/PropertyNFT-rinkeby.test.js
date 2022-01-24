const { expect } = require("chai");
const { ethers, getNamedAccounts, deployments, network } = require("hardhat");
const {
  BN, // Big Number support
  constants, // Common constants, like the zero address and largest integers
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time,
  snapshot,
} = require("@openzeppelin/test-helpers");

const postalCodes = require("../data/postalCodes.json");
const ether = require("@openzeppelin/test-helpers/src/ether");

require("dotenv").config();

const SIGNER_ADDRESS = process.env.SIGNER_TEST_ADDRESS;
const SIGNER_PRIVATE_KEY = process.env.SIGNER_TEST;

const SIGNING_KEY = new ethers.utils.SigningKey(SIGNER_PRIVATE_KEY);

const INVALID_ADDRESS = "0x37111d8e7fa134a27594E6389f4Dc54A81bc9070";
const INVALID_SIGNER_PRIVATE_KEY =
  "0xfb0f0909babb460a7efcb7b9040ec4e6fec8676f6b776d6e9f7f78b95130a58b";
const INVALID_SIGNING_KEY = new ethers.utils.SigningKey(
  INVALID_SIGNER_PRIVATE_KEY
);

longToByteArray = function (x) {
  return [x, x << 8, x << 16, x << 24].map((z) => z >>> 24);
};

const signAddress = (address, signingKey, amount, tier) => {
  const nonce = ethers.utils.randomBytes(32);
  const msgHash = ethers.utils.solidityKeccak256(
    ["address", "bytes", "uint256", "uint256"],
    [address, nonce, amount, tier]
    // ethers.utils.hexConcat([address, nonce, amount, tier])
  );
  console.log("🚀 | signAddress | msgHash", msgHash);
  const signature = ethers.utils.joinSignature(signingKey.signDigest(msgHash));
  return { signature, nonce: ethers.utils.hexlify(nonce) };
};

describe("PropertyNFT", function () {
  let owner, treasury, alice, bob, cindy, douglas;
  let propertyNFT;

  before(async function () {
    [owner, treasury, alice, bob, cindy, douglas] = await ethers.getSigners();
    propertyNFT = await ethers.getContract("PropertyNFT", owner);
  });

  describe("Minting", function () {
    it("Reserve and test if public cannot mint past 5800", async function () {
      expect((await propertyNFT.getAvailable()).length).to.equal(6000);

      let airdropList = [];

      for (let j = 0; j < 100; j++) {
        airdropList.push(owner.address);
      }
      console.log("🚀 | airdropList", airdropList.length);

      for (let i = 0; i < 1; i++) {
        await (await propertyNFT.connect(owner).airdrop(airdropList)).wait();
      }
      console.log(
        "TOTAL SUPPLY: ",
        (await propertyNFT.totalSupply()).toString()
      );
      console.log("Wallet: ", await propertyNFT.walletOfOwner(owner.address));

      await expectRevert(
        propertyNFT.connect(owner).publicMint(1, {
          value: ethers.utils.parseEther("0.09"),
        }),
        "PropertyNFT: Maximum Supply Reached!"
      );

      for (let i = 0; i < 2; i++) {
        await (await propertyNFT.connect(owner).airdrop(airdropList)).wait();
      }
      console.log("🟢 Minted 6000 NFTS");

      expect(await propertyNFT.balanceOf(owner.address)).to.equal(6000);

      // Expect Revert after minting all 6000

      await expectRevert(
        propertyNFT.connect(owner).airdrop(airdropList),
        "PropertyNFT: No more available Propertys"
      );

      await expectRevert(
        propertyNFT
          .connect(owner)
          .publicMint(1, { value: ethers.utils.parseEther("0.09") }),
        "PropertyNFT: Maximum Supply Reached!"
      );

      expect((await propertyNFT.getAvailable()).length).to.equal(0);
    });
  });
});
