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

const PRESALE_SIGNER_PRIVATE_KEY = process.env.PRESALE_SIGNER_PRIVATE_KEY;
const PUBLIC_SIGNER_PRIVATE_KEY = process.env.PUBLIC_SIGNER_PRIVATE_KEY;
const PRESALE_SIGNER_ADDRESS = process.env.PRESALE_SIGNER_ADDRESS;
const PUBLIC_SIGNER_ADDRESS = process.env.PUBLIC_SIGNER_ADDRESS;
const presaleSigningKey = new ethers.utils.SigningKey(
  PRESALE_SIGNER_PRIVATE_KEY
);
const publicSigningKey = new ethers.utils.SigningKey(PUBLIC_SIGNER_PRIVATE_KEY);

longToByteArray = function (x) {
  return [x, x << 8, x << 16, x << 24].map((z) => z >>> 24);
};

describe("PropertyNFT", function () {
  let owner, treasury, alice, bob, cindy, douglas;
  let propertyNFT;

  before(async function () {
    // Get Fixture of Questing and Uninterested Unicorns
    await deployments.fixture(["PropertyNFT"]);
    [owner, treasury, alice, bob, cindy, douglas] = await ethers.getSigners();
    propertyNFT = await ethers.getContract("PropertyNFT", owner);
  });

  describe("Contract Details", function () {
    it("Contract Name", async function () {
      expect(await propertyNFT.name()).to.equal("PropertyNFT");
    });
    it("Contract Symbol", async function () {
      expect(await propertyNFT.symbol()).to.equal("PP");
    });
    it("Max Supply", async function () {
      expect(await propertyNFT.MAX_SUPPLY()).to.equal(6000);
    });
    it("Max Public Mint Per Transaction", async function () {
      expect(await propertyNFT.MAX_QUANTITY()).to.equal(8);
    });
    it("Max Public Mint Per Wallet", async function () {
      expect(await propertyNFT.WALLET_LIMIT_PUBLIC()).to.equal(16);
    });
  });

  describe("Metadata", function () {
    it("Base URL", async function () {
      expect(await propertyNFT.baseTokenURI()).to.equal("");
    });
    it("Updated Base URI", async function () {
      await (await propertyNFT.connect(owner).updateBaseURI("ipfs://")).wait();
      expect(await propertyNFT.baseTokenURI()).to.equal("ipfs://");
    });
    it("Postal Codes", async function () {
      // Loop through all postal code int
      // for (postalCodeInt of postalCodes) {
      //   console.log(await propertyNFT.getPostalCode(postalCodeInt));
      //   console.log(ethers.utils.hexlify(longToByteArray(postalCodeInt)));
      //   expect(await propertyNFT.getPostalCode(postalCodeInt)).to.equal(
      //     ethers.utils.hexlify(longToByteArray(postalCodeInt))
      //   );
      // }

      // LITE VERSION
      let count = 10;
      for (let i = 0; i < count; i++) {
        let currentPostalCodeId = await propertyNFT.getPostalCode(
          postalCodes[i]
        );
        // console.log(currentPostalCodeId);
        expect(await propertyNFT.getPostalCode(postalCodes[i])).to.equal(
          ethers.utils.hexlify(longToByteArray(postalCodes[i]))
        );
        // console.log("🟡", await propertyNFT.parsePostalCode(currentPostalCodeId));
      }
    });
  });

  describe("Invalid Minting", function () {
    before(async function () {
      // Snapshot Restore
      await deployments.fixture(["PropertyNFT"]);
    });

    // PRIVATE MINT
    it("Cannot Private Mint before presale start time", async function () {
      await expectRevert(
        propertyNFT.presaleMint(1, { value: ethers.utils.parseEther("0.080") }),
        "PropertyNFT: Presale Mint not open!"
      );
    });
    it("Cannot Private Mint if not on whitelist", async function () {
      // Fast Forward 1 Hour
      await network.provider.send("evm_increaseTime", [3700]);
      console.log("🕑 Increased Time");
      await expectRevert(
        propertyNFT.presaleMint(1, { value: ethers.utils.parseEther("0.080") }),
        "PropertyNFT: Presale limit exceeded!"
      );
    });

    it("Cannot Private Mint if exceeded presale limit", async function () {
      // Whitelist Alice with Tier 1
      await (
        await propertyNFT.connect(owner).whitelistUsers([alice.address], [1])
      ).wait();
      console.log("🟡 Alice Whitelisted Tier 1");

      await expectRevert(
        propertyNFT
          .connect(alice)
          .presaleMint(2, { value: ethers.utils.parseEther("0.160") }),
        "PropertyNFT: Presale limit exceeded!"
      );
    });

    it("Cannot Private Mint if exceeded presale limit 2", async function () {
      // Whitelist Alice with Tier 1
      await (
        await propertyNFT.connect(owner).whitelistUsers([bob.address], [2])
      ).wait();
      console.log("🟡 Bob Whitelisted Tier 2");

      await (
        await propertyNFT
          .connect(bob)
          .presaleMint(1, { value: ethers.utils.parseEther("0.0725") })
      ).wait();
      console.log("🟡 Bob Minted 1");

      await (
        await propertyNFT
          .connect(bob)
          .presaleMint(1, { value: ethers.utils.parseEther("0.0725") })
      ).wait();
      console.log("🟡 Bob Minted 1");

      await expectRevert(
        propertyNFT
          .connect(bob)
          .presaleMint(1, { value: ethers.utils.parseEther("0.0725") }),
        "PropertyNFT: Presale limit exceeded!"
      );
    });

    it("Cannot Private Mint if insufficient ETH", async function () {
      await deployments.fixture(["PropertyNFT"]);
      console.log("♻️ Fixture");

      // Whitelist Alice with Tier 1
      await (
        await propertyNFT.connect(owner).whitelistUsers([alice.address], [1])
      ).wait();
      console.log("🟡 Alice Whitelisted Tier 1");

      // Fast Forward 1 Hour + 30 sec
      await network.provider.send("evm_increaseTime", [3630]);
      console.log("🕑 Increased Time");

      // Alice try to mint with 0.01 ETH
      await expectRevert(
        propertyNFT
          .connect(alice)
          .presaleMint(1, { value: ethers.utils.parseEther("0.01") }),
        "PropertyNFT: Insufficient ETH"
      );
    });

    it("Cannot Private Mint if after presale window", async function () {
      await deployments.fixture(["PropertyNFT"]);
      console.log("♻️ Fixture");

      // Whitelist Alice with Tier 1
      await (
        await propertyNFT.connect(owner).whitelistUsers([alice.address], [1])
      ).wait();
      console.log("🟡 Alice Whitelisted Tier 1");

      // Fast Forward 1 Hour + 30 sec
      await network.provider.send("evm_increaseTime", [3630]);
      console.log("🕑 Increased Time");
      // Fast Forward 1 Hour + 30 sec
      await network.provider.send("evm_increaseTime", [3630]);
      console.log("🕑 Increased Time");

      await expectRevert(
        propertyNFT
          .connect(alice)
          .presaleMint(1, { value: ethers.utils.parseEther("0.080") }),
        "PropertyNFT: Presale Mint not open!"
      );
    });

    // PUBLIC MINT
    it("Cannot Public Mint before public sale time", async function () {
      await deployments.fixture(["PropertyNFT"]);
      console.log("♻️ Fixture");
      await expectRevert(
        propertyNFT
          .connect(alice)
          .publicMint(1, { value: ethers.utils.parseEther("0.09") }),
        "PropertyNFT: Public sale has not started!"
      );
    });
    it("Cannot Public Mint more than public limit", async function () {
      await deployments.fixture(["PropertyNFT"]);
      console.log("♻️ Fixture");
      // Fast Forward 1 Hour + 30 sec
      await network.provider.send("evm_increaseTime", [3630]);
      console.log("🕑 Increased Time");
      // Fast Forward 1 Day + 30 sec
      await network.provider.send("evm_increaseTime", [86430]);
      console.log("🕑 Increased Time 1 Day");
      await (
        await propertyNFT
          .connect(alice)
          .publicMint(8, { value: ethers.utils.parseEther("0.72") })
      ).wait();
      await (
        await propertyNFT
          .connect(alice)
          .publicMint(8, { value: ethers.utils.parseEther("0.72") })
      ).wait();
      await expectRevert(
        propertyNFT
          .connect(alice)
          .publicMint(1, { value: ethers.utils.parseEther("0.09") }),
        "PropertyNFT: Maximum amount of mints exceeded!"
      );
    });
    it("Cannot Public Mint more than limit per transaction", async function () {
      await expectRevert(
        propertyNFT
          .connect(bob)
          .publicMint(9, { value: ethers.utils.parseEther("0.81") }),
        "PropertyNFT: Maximum mint amount per transaction exceeded!"
      );
    });

    it("Cannot Public Mint if insufficient ETH", async function () {
      await expectRevert(
        propertyNFT
          .connect(bob)
          .publicMint(1, { value: ethers.utils.parseEther("0.01") }),
        "PropertyNFT: Insufficient ETH!"
      );
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {
      // Snapshot Restore
      await deployments.fixture(["PropertyNFT"]);
      console.log("♻️ Fixture");

      // Make sure the number of propertys start at 6000
      expect(postalCodes.length).to.equal(6000);
      // expect((await propertyNFT.getAvailable()).length).to.equal(6000);
    });
    it("Presale Mint", async function () {
      // Fast Forward to Presale Mint
      await network.provider.send("evm_increaseTime", [3630]);

      // Whitelist Alice
      await (await propertyNFT.whitelistUsers([alice.address], [1])).wait();

      // Whitelist Bob
      await (await propertyNFT.whitelistUsers([bob.address], [2])).wait();

      // Whitelist Cindy
      await (await propertyNFT.whitelistUsers([cindy.address], [3])).wait();

      // Private Mint for Alice
      await (
        await propertyNFT
          .connect(alice)
          .presaleMint(1, { value: ethers.utils.parseEther("0.080") })
      ).wait();

      // Private Mint for Alice
      await (
        await propertyNFT
          .connect(bob)
          .presaleMint(2, { value: ethers.utils.parseEther("0.145") })
      ).wait();

      // Private Mint for Alice
      await (
        await propertyNFT
          .connect(cindy)
          .presaleMint(3, { value: ethers.utils.parseEther("0.195") })
      ).wait();

      expect(await propertyNFT.balanceOf(alice.address)).to.equal(1);
      expect(await propertyNFT.balanceOf(bob.address)).to.equal(2);
      expect(await propertyNFT.balanceOf(cindy.address)).to.equal(3);
    });

    it("Public Mint", async function () {
      // Fast Forward 1 Hour + 30 sec
      await network.provider.send("evm_increaseTime", [3630]);
      console.log("🕑 Increased Time");
      // Fast Forward 1 Day + 30 sec
      await network.provider.send("evm_increaseTime", [86430]);
      console.log("🕑 Increased Time 1 Day");
      // Fast Forward to Public Mint
      await (
        await propertyNFT.connect(alice).publicMint(1, {
          value: ethers.utils.parseEther("0.09"),
        })
      ).wait();
      expect(await propertyNFT.balanceOf(alice.address)).to.equal(1);
    });

    it("Reserve", async function () {
      // Fast Forward 1 Hour + 30 sec
      await network.provider.send("evm_increaseTime", [3630]);
      console.log("🕑 Increased Time");
      // Fast Forward 1 Day + 30 sec
      await network.provider.send("evm_increaseTime", [86430]);
      console.log("🕑 Increased Time 1 Day");

      for (let i = 0; i < 60; i++) {
        await (await propertyNFT.connect(owner).reserve(100)).wait();
        // console.log(
        //   "🟡",
        //   (await propertyNFT.balanceOf(owner.address)).toString()
        // );
        // expect(await propertyNFT.getAvailiable()).to.equal(6000);
      }
      console.log("🟢 Minted 6000 NFTS");
      expect(await propertyNFT.balanceOf(owner.address)).to.equal(6000);

      // Expect Revert after minting all 6000
      await expectRevert(
        propertyNFT.connect(owner).reserve(1),
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
