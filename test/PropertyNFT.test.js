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
    // Get Fixture of Questing and
    await deployments.fixture(["PropertyNFT", "PropertyNFTSettings"]);
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
    it("Reserved", async function () {
      expect(await propertyNFT.RESERVED()).to.equal(200);
    });
    it("Max Public Mint Per Transaction", async function () {
      expect(await propertyNFT.MAX_QUANTITY()).to.equal(8);
    });
    it("Max Public Mint Per Wallet", async function () {
      expect(await propertyNFT.WALLET_LIMIT_PUBLIC()).to.equal(16);
    });
  });

  // describe("Metadata", function () {
  //   it("Base URL", async function () {
  //     expect(await propertyNFT.baseTokenURI()).to.equal("");
  //   });
  //   it("Updated Base URI", async function () {
  //     await (
  //       await propertyNFT.connect(owner).updateBaseURI(process.env.IPFS_GATEWAY)
  //     ).wait();
  //     expect(await propertyNFT.baseTokenURI()).to.equal(
  //       process.env.IPFS_GATEWAY
  //     );
  //   });
  //   it("Postal Codes", async function () {
  //     // Loop through all postal code int
  //     // for (postalCodeInt of postalCodes) {
  //     //   console.log(await propertyNFT.getPostalCode(postalCodeInt));
  //     //   console.log(ethers.utils.hexlify(longToByteArray(postalCodeInt)));
  //     //   expect(await propertyNFT.getPostalCode(postalCodeInt)).to.equal(
  //     //     ethers.utils.hexlify(longToByteArray(postalCodeInt))
  //     //   );
  //     // }

  //     // LITE VERSION
  //     let count = 50;
  //     for (let i = 120; i < count; i++) {
  //       let currentPostalCodeId = await propertyNFT.getPostalCode(
  //         postalCodes[i]
  //       );
  //       // console.log(currentPostalCodeId);
  //       expect(await propertyNFT.getPostalCode(postalCodes[i])).to.equal(
  //         ethers.utils.hexlify(longToByteArray(postalCodes[i]))
  //       );

  //       console.log(
  //         "🟡",
  //         await propertyNFT.parsePostalCode(currentPostalCodeId)
  //       );
  //     }
  //   });
  // });

  // describe("Invalid Minting", function () {
  //   beforeEach(async function () {
  //     // Snapshot Restore
  //     await deployments.fixture(["PropertyNFT"]);
  //     console.log("♻️ Fixture");
  //   });

  //   // PRIVATE MINT
  //   it("Cannot Private Mint before presale start time", async function () {
  //     const { nonce, signature } = signAddress(
  //       owner.address,
  //       SIGNING_KEY,
  //       1,
  //       1
  //     );
  //     await expectRevert(
  //       propertyNFT.presaleMint(1, 1, nonce, signature, {
  //         value: ethers.utils.parseEther("0.080"),
  //       }),
  //       "PropertyNFT: Presale Mint not open!"
  //     );
  //   });
  //   it("Cannot Private Mint if Invalid Signature", async function () {
  //     // Fast Forward 1 Hour
  //     await network.provider.send("evm_increaseTime", [3700]);
  //     console.log("🕑 Increased Time");
  //     const { nonce, signature } = signAddress(
  //       owner.address,
  //       INVALID_SIGNING_KEY,
  //       1,
  //       1
  //     );
  //     await expectRevert(
  //       propertyNFT.presaleMint(1, 1, nonce, signature, {
  //         value: ethers.utils.parseEther("0.080"),
  //       }),
  //       "PropertyNFT: Invalid signature"
  //     );
  //   });

  //   // PRIVATE MINT
  //   it("Cannot Partner Mint before presale start time", async function () {
  //     const { nonce, signature } = signAddress(
  //       owner.address,
  //       SIGNING_KEY,
  //       0,
  //       0
  //     );
  //     await expectRevert(
  //       propertyNFT.partnerMint(nonce, signature, {
  //         value: ethers.utils.parseEther("0.080"),
  //       }),
  //       "PropertyNFT: Presale Mint not open!"
  //     );
  //   });
  //   it("Cannot Private Mint if Invalid Signature", async function () {
  //     // Fast Forward 1 Hour
  //     await network.provider.send("evm_increaseTime", [3700]);
  //     console.log("🕑 Increased Time");
  //     const { nonce, signature } = signAddress(
  //       owner.address,
  //       INVALID_SIGNING_KEY,
  //       0,
  //       0
  //     );
  //     await expectRevert(
  //       propertyNFT.partnerMint(nonce, signature, {
  //         value: ethers.utils.parseEther("0.080"),
  //       }),
  //       "PropertyNFT: Invalid signature"
  //     );
  //   });

  //   // No longer relevant with new whitelisting mechanism
  //   it("Cannot Private Mint if exceeded personal presale limit", async function () {
  //     // Fast Forward 1 Hour
  //     await network.provider.send("evm_increaseTime", [3700]);
  //     // Whitelist Alice with Tier 1
  //     let { nonce, signature } = signAddress(alice.address, SIGNING_KEY, 1, 1);
  //     console.log("🟡 Alice Whitelisted Tier 1");
  //     await (
  //       await propertyNFT.connect(alice).presaleMint(1, 1, nonce, signature, {
  //         value: ethers.utils.parseEther("0.08"),
  //       })
  //     ).wait();
  //     ({ nonce, signature } = signAddress(alice.address, SIGNING_KEY, 1, 1));
  //     await expectRevert(
  //       propertyNFT.connect(alice).presaleMint(1, 1, nonce, signature, {
  //         value: ethers.utils.parseEther("0.08"),
  //       }),
  //       "PropertyNFT: Presale Limit Exceeded!"
  //     );
  //   });

  //   it("Cannot Private Mint if insufficient ETH", async function () {
  //     const { nonce, signature } = signAddress(
  //       alice.address,
  //       SIGNING_KEY,
  //       1,
  //       1
  //     );

  //     // Fast Forward 1 Hour + 30 sec
  //     await network.provider.send("evm_increaseTime", [3630]);
  //     console.log("🕑 Increased Time");

  //     // Alice try to mint with 0.01 ETH
  //     await expectRevert(
  //       propertyNFT.connect(alice).presaleMint(1, 1, nonce, signature, {
  //         value: ethers.utils.parseEther("0.01"),
  //       }),
  //       "PropertyNFT: Insufficient ETH"
  //     );
  //   });

  //   it("Cannot Private Mint if after presale window", async function () {
  //     // Whitelist Alice with Tier 1

  //     // Fast Forward 1 Day + 30 sec
  //     await network.provider.send("evm_increaseTime", [86430 + 86430]);
  //     console.log("🕑 Increased Time");

  //     const { nonce, signature } = signAddress(
  //       alice.address,
  //       SIGNING_KEY,
  //       1,
  //       1
  //     );

  //     await expectRevert(
  //       propertyNFT.connect(alice).presaleMint(1, 1, nonce, signature, {
  //         value: ethers.utils.parseEther("0.080"),
  //       }),
  //       "PropertyNFT: Presale Mint not open!"
  //     );
  //   });

  //   // PUBLIC MINT
  //   it("Cannot Public Mint before public sale time", async function () {
  //     await expectRevert(
  //       propertyNFT
  //         .connect(alice)
  //         .publicMint(1, { value: ethers.utils.parseEther("0.09") }),
  //       "PropertyNFT: Public sale has not started!"
  //     );
  //   });
  //   it("Cannot Public Mint more than public limit", async function () {
  //     // Fast Forward 1 Day + 30 sec
  //     await network.provider.send("evm_increaseTime", [86430]);
  //     console.log("🕑 Increased Time 1 Day");
  //     // Fast Forward 1 day + 30 sec
  //     await network.provider.send("evm_increaseTime", [86430]);
  //     console.log("🕑 Increased Time 1 Day");
  //     await (
  //       await propertyNFT
  //         .connect(alice)
  //         .publicMint(8, { value: ethers.utils.parseEther("0.72") })
  //     ).wait();
  //     await (
  //       await propertyNFT
  //         .connect(alice)
  //         .publicMint(8, { value: ethers.utils.parseEther("0.72") })
  //     ).wait();
  //     await expectRevert(
  //       propertyNFT
  //         .connect(alice)
  //         .publicMint(1, { value: ethers.utils.parseEther("0.09") }),
  //       "PropertyNFT: Maximum amount of mints exceeded!"
  //     );
  //   });
  //   it("Cannot Public Mint more than limit per transaction", async function () {
  //     // Fast Forward 1 Day + 30 sec
  //     await network.provider.send("evm_increaseTime", [86430]);
  //     console.log("🕑 Increased Time 1 Day");
  //     // Fast Forward 1 day + 30 sec
  //     await network.provider.send("evm_increaseTime", [86430]);
  //     console.log("🕑 Increased Time 1 Day");
  //     await expectRevert(
  //       propertyNFT
  //         .connect(bob)
  //         .publicMint(9, { value: ethers.utils.parseEther("0.81") }),
  //       "PropertyNFT: Maximum mint amount per transaction exceeded!"
  //     );
  //   });

  //   it("Cannot Public Mint if insufficient ETH", async function () {
  //     // Fast Forward 1 Day + 30 sec
  //     await network.provider.send("evm_increaseTime", [86430]);
  //     console.log("🕑 Increased Time 1 Day");
  //     // Fast Forward 1 day + 30 sec
  //     await network.provider.send("evm_increaseTime", [86430]);
  //     console.log("🕑 Increased Time 1 Day");
  //     await expectRevert(
  //       propertyNFT
  //         .connect(bob)
  //         .publicMint(1, { value: ethers.utils.parseEther("0.01") }),
  //       "PropertyNFT: Insufficient ETH!"
  //     );
  //   });
  // });

  // describe("Minting", function () {
  //   beforeEach(async function () {
  //     // Snapshot Restore
  //     await deployments.fixture(["PropertyNFT", "PropertyNFTSettings"]);
  //     console.log("♻️ Fixture");

  //     // Make sure the number of propertys start at 6000
  //   });
  //   it("Presale Mint", async function () {
  //     // Fast Forward to Presale Mint
  //     await network.provider.send("evm_increaseTime", [3630]);
  //     console.log("🕑 Increased Time");

  //     // Private Mint for Alice
  //     let { nonce, signature } = signAddress(alice.address, SIGNING_KEY, 1, 1);
  //     await (
  //       await propertyNFT.connect(alice).presaleMint(1, 1, nonce, signature, {
  //         value: ethers.utils.parseEther("0.080"),
  //       })
  //     ).wait();

  //     // Private Mint for Alice
  //     ({ nonce, signature } = signAddress(bob.address, SIGNING_KEY, 2, 2));
  //     await (
  //       await propertyNFT.connect(bob).presaleMint(2, 2, nonce, signature, {
  //         value: ethers.utils.parseEther("0.145"),
  //       })
  //     ).wait();

  //     // Private Mint for Alice
  //     ({ nonce, signature } = signAddress(cindy.address, SIGNING_KEY, 3, 3));
  //     await (
  //       await propertyNFT.connect(cindy).presaleMint(3, 3, nonce, signature, {
  //         value: ethers.utils.parseEther("0.195"),
  //       })
  //     ).wait();

  //     expect(await propertyNFT.balanceOf(alice.address)).to.equal(1);
  //     expect(await propertyNFT.balanceOf(bob.address)).to.equal(2);
  //     expect(await propertyNFT.balanceOf(cindy.address)).to.equal(3);
  //     console.log(
  //       "TOTAL SUPPLY: ",
  //       (await propertyNFT.totalSupply()).toString()
  //     );
  //   });

  //   it("Public Mint", async function () {
  //     // Fast Forward 1 Hour + 30 sec
  //     await network.provider.send("evm_increaseTime", [3630]);
  //     console.log("🕑 Increased Time");
  //     // Fast Forward 1 Day + 30 sec
  //     await network.provider.send("evm_increaseTime", [86430]);
  //     console.log("🕑 Increased Time 1 Day");
  //     // Fast Forward to Public Mint
  //     await (
  //       await propertyNFT.connect(alice).publicMint(1, {
  //         value: ethers.utils.parseEther("0.09"),
  //       })
  //     ).wait();
  //     expect(await propertyNFT.balanceOf(alice.address)).to.equal(1);
  //   });

  //   it("Reserve and test if public cannot mint past 5800", async function () {
  //     // Fast Forward 1 Hour + 30 sec
  //     await network.provider.send("evm_increaseTime", [3630]);
  //     console.log("🕑 Increased Time");
  //     // Fast Forward 1 Day + 30 sec
  //     await network.provider.send("evm_increaseTime", [86430]);
  //     console.log("🕑 Increased Time 1 Day");

  //     let airdropList = [];

  //     for (let j = 0; j < 100; j++) {
  //       airdropList.push(owner.address);
  //     }
  //     console.log("🚀 | airdropList", airdropList.length);

  //     for (let i = 0; i < 58; i++) {
  //       await (await propertyNFT.connect(owner).airdrop(airdropList)).wait();
  //     }
  //     console.log(
  //       "TOTAL SUPPLY: ",
  //       (await propertyNFT.totalSupply()).toString()
  //     );
  //     console.log("Wallet: ", await propertyNFT.walletOfOwner(owner.address));

  //     let { nonce, signature } = signAddress(alice.address, SIGNING_KEY, 1, 1);
  //     await expectRevert(
  //       propertyNFT.connect(alice).publicMint(1, {
  //         value: ethers.utils.parseEther("0.09"),
  //       }),
  //       "PropertyNFT: Maximum Supply Reached!"
  //     );

  //     for (let i = 0; i < 2; i++) {
  //       await (await propertyNFT.connect(owner).airdrop(airdropList)).wait();
  //     }
  //     console.log("🟢 Minted 6000 NFTS");

  //     expect(await propertyNFT.balanceOf(owner.address)).to.equal(6000);

  //     // Expect Revert after minting all 6000

  //     await expectRevert(
  //       propertyNFT.connect(owner).airdrop(airdropList),
  //       "PropertyNFT: No more available Propertys"
  //     );

  //     await expectRevert(
  //       propertyNFT
  //         .connect(owner)
  //         .publicMint(1, { value: ethers.utils.parseEther("0.09") }),
  //       "PropertyNFT: Maximum Supply Reached!"
  //     );

  //     expect((await propertyNFT.getAvailable()).length).to.equal(0);
  //   });
  // });

  describe("Upgrading to V2", function () {
    let pcp, ppv2;
    before(async function () {
      await deployments.fixture([
        "PropertyNFT",
        "PropertyNFTSettings",
        "PostalCodeProvider",
        "PostalCodeProviderSettings",
        "PropertyNFTv2",
      ]);

      pp = await ethers.getContract("PropertyNFT", owner);
      pcp = await ethers.getContract("PostalCodeProvider", owner);
      ppv2 = await ethers.getContract("PropertyNFTv2");
      ppv2ABI = (await deployments.getArtifact("PropertyNFTv2")).abi;
      proxyAdmin = await ethers.getContract("DefaultProxyAdmin");
    });
    it("Reserve and test if public cannot mint past 5800", async function () {
      console.log("Available Mints: ", (await pp.getAvailable()).length);

      /// Sell out V1
      let airdropList = [];

      for (let j = 0; j < 100; j++) {
        airdropList.push(owner.address);
      }

      for (let i = 0; i < 59; i++) {
        await (await pp.airdrop(airdropList)).wait();
      }

      airdropList = [];

      for (let j = 0; j < 100; j++) {
        airdropList.push(alice.address);
      }

      for (let i = 0; i < 1; i++) {
        await (await pp.airdrop(airdropList)).wait();
      }

      console.log("TOTAL SUPPLY: ", (await pp.totalSupply()).toString());
      console.log("🟢 Minted 6000 NFTS");

      // Upgrade Contract
      await (await proxyAdmin.upgrade(pp.address, ppv2.address)).wait();
      console.log("Contract Upgraded");

      pp = new ethers.Contract(pp.address, ppv2ABI, owner);
      await (await pp.setPostalCodeProvider(pcp.address)).wait();

      console.log("Postal Code Provider Set");

      // Get wallet of alice (Shuffled)
      console.log(
        "Alice Wallet PRE-Shuffled: ",
        await pp.walletOfOwnerShuffled(alice.address)
      );

      // Shuffle
      await (await pcp.shuffle(12345)).wait();

      // Get wallet of alice (Shuffled)
      console.log(
        "Alice Wallet Shuffled: ",
        await pp.walletOfOwnerShuffled(alice.address)
      );

      // Reveal
      await (await pp.updateBaseURI(process.env.IPFS_GATEWAY)).wait();

      // Get Token URL
      console.log(
        await pp.tokenURI((await pp.walletOfOwner(alice.address))[0])
      );
    });
  });
});
