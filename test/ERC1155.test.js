const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");

const { ethers, getNamedAccounts, deployments } = require("hardhat");
const { ZERO_ADDRESS } = constants;

const { expect } = require("chai");

describe("ERC1155", function () {
  let operator, tokenHolder, tokenBatchHolder;
  let propertyNFT;
  const initialURI = "https://token-cdn-domain/{id}.json";

  before(async function () {
    // Get Fixture of Questing and
    await deployments.fixture(["PropertyNFT"]);
  });

  beforeEach(async function () {
    propertyNFT = await ethers.getContract("PropertyNFT", operator);
    [operator, tokenHolder, tokenBatchHolder, ...otherAccounts] =
      await ethers.getSigners();
  });

  describe("internal functions", function () {
    const tokenId = new BN(1990);
    const mintAmount = new BN(9001);
    const burnAmount = new BN(3000);

    const tokenBatchIds = [new BN(2000), new BN(2010), new BN(2020)];
    const mintAmounts = [new BN(5000), new BN(10000), new BN(42195)];
    const burnAmounts = [new BN(5000), new BN(9001), new BN(195)];

    const data = "0x12345678";

    describe("_mint", function () {
      it("reverts with a zero destination address", async function () {
        await expectRevert(
          propertyNFT.mint(ZERO_ADDRESS, tokenId, mintAmount, data),
          "ERC1155: mint to the zero address"
        );
      });

      context("with minted tokens", function () {
        beforeEach(async function () {
          ({ logs: this.logs } = await propertyNFT.mint(
            tokenHolder,
            tokenId,
            mintAmount,
            data,
            { from: operator }
          ));
        });

        it("emits a TransferSingle event", function () {
          expectEvent.inLogs(this.logs, "TransferSingle", {
            operator,
            from: ZERO_ADDRESS,
            to: tokenHolder,
            id: tokenId,
            value: mintAmount,
          });
        });

        it("credits the minted amount of tokens", async function () {
          expect(
            await propertyNFT.balanceOf(tokenHolder, tokenId)
          ).to.be.bignumber.equal(mintAmount);
        });
      });
    });

    describe("_mintBatch", function () {
      it("reverts with a zero destination address", async function () {
        await expectRevert(
          propertyNFT.mintBatch(ZERO_ADDRESS, tokenBatchIds, mintAmounts, data),
          "ERC1155: mint to the zero address"
        );
      });

      it("reverts if length of inputs do not match", async function () {
        await expectRevert(
          propertyNFT.mintBatch(
            tokenBatchHolder,
            tokenBatchIds,
            mintAmounts.slice(1),
            data
          ),
          "ERC1155: ids and amounts length mismatch"
        );

        await expectRevert(
          propertyNFT.mintBatch(
            tokenBatchHolder,
            tokenBatchIds.slice(1),
            mintAmounts,
            data
          ),
          "ERC1155: ids and amounts length mismatch"
        );
      });

      context("with minted batch of tokens", function () {
        beforeEach(async function () {
          ({ logs: this.logs } = await propertyNFT.mintBatch(
            tokenBatchHolder,
            tokenBatchIds,
            mintAmounts,
            data,
            { from: operator }
          ));
        });

        it("emits a TransferBatch event", function () {
          expectEvent.inLogs(this.logs, "TransferBatch", {
            operator,
            from: ZERO_ADDRESS,
            to: tokenBatchHolder,
          });
        });

        it("credits the minted batch of tokens", async function () {
          const holderBatchBalances = await propertyNFT.balanceOfBatch(
            new Array(tokenBatchIds.length).fill(tokenBatchHolder),
            tokenBatchIds
          );

          for (let i = 0; i < holderBatchBalances.length; i++) {
            expect(holderBatchBalances[i]).to.be.bignumber.equal(
              mintAmounts[i]
            );
          }
        });
      });
    });

    describe("_burn", function () {
      it("reverts when burning the zero account's tokens", async function () {
        await expectRevert(
          propertyNFT.burn(ZERO_ADDRESS, tokenId, mintAmount),
          "ERC1155: burn from the zero address"
        );
      });

      it("reverts when burning a non-existent token id", async function () {
        await expectRevert(
          propertyNFT.burn(tokenHolder, tokenId, mintAmount),
          "ERC1155: burn amount exceeds balance"
        );
      });

      it("reverts when burning more than available tokens", async function () {
        await propertyNFT.mint(tokenHolder, tokenId, mintAmount, data, {
          from: operator,
        });

        await expectRevert(
          propertyNFT.burn(tokenHolder, tokenId, mintAmount.addn(1)),
          "ERC1155: burn amount exceeds balance"
        );
      });

      context("with minted-then-burnt tokens", function () {
        beforeEach(async function () {
          await propertyNFT.mint(tokenHolder, tokenId, mintAmount, data);
          ({ logs: this.logs } = await propertyNFT.burn(
            tokenHolder,
            tokenId,
            burnAmount,
            { from: operator }
          ));
        });

        it("emits a TransferSingle event", function () {
          expectEvent.inLogs(this.logs, "TransferSingle", {
            operator,
            from: tokenHolder,
            to: ZERO_ADDRESS,
            id: tokenId,
            value: burnAmount,
          });
        });

        it("accounts for both minting and burning", async function () {
          expect(
            await propertyNFT.balanceOf(tokenHolder, tokenId)
          ).to.be.bignumber.equal(mintAmount.sub(burnAmount));
        });
      });
    });

    describe("_burnBatch", function () {
      it("reverts when burning the zero account's tokens", async function () {
        await expectRevert(
          propertyNFT.burnBatch(ZERO_ADDRESS, tokenBatchIds, burnAmounts),
          "ERC1155: burn from the zero address"
        );
      });

      it("reverts if length of inputs do not match", async function () {
        await expectRevert(
          propertyNFT.burnBatch(
            tokenBatchHolder,
            tokenBatchIds,
            burnAmounts.slice(1)
          ),
          "ERC1155: ids and amounts length mismatch"
        );

        await expectRevert(
          propertyNFT.burnBatch(
            tokenBatchHolder,
            tokenBatchIds.slice(1),
            burnAmounts
          ),
          "ERC1155: ids and amounts length mismatch"
        );
      });

      it("reverts when burning a non-existent token id", async function () {
        await expectRevert(
          propertyNFT.burnBatch(tokenBatchHolder, tokenBatchIds, burnAmounts),
          "ERC1155: burn amount exceeds balance"
        );
      });

      context("with minted-then-burnt tokens", function () {
        beforeEach(async function () {
          await propertyNFT.mintBatch(
            tokenBatchHolder,
            tokenBatchIds,
            mintAmounts,
            data
          );
          ({ logs: this.logs } = await propertyNFT.burnBatch(
            tokenBatchHolder,
            tokenBatchIds,
            burnAmounts,
            { from: operator }
          ));
        });

        it("emits a TransferBatch event", function () {
          expectEvent.inLogs(this.logs, "TransferBatch", {
            operator,
            from: tokenBatchHolder,
            to: ZERO_ADDRESS,
            // ids: tokenBatchIds,
            // values: burnAmounts,
          });
        });

        it("accounts for both minting and burning", async function () {
          const holderBatchBalances = await propertyNFT.balanceOfBatch(
            new Array(tokenBatchIds.length).fill(tokenBatchHolder),
            tokenBatchIds
          );

          for (let i = 0; i < holderBatchBalances.length; i++) {
            expect(holderBatchBalances[i]).to.be.bignumber.equal(
              mintAmounts[i].sub(burnAmounts[i])
            );
          }
        });
      });
    });
  });

  describe("ERC1155MetadataURI", function () {
    const firstTokenID = new BN("42");
    const secondTokenID = new BN("1337");

    it("emits no URI event in constructor", async function () {
      await expectEvent.notEmitted.inConstruction(propertyNFT, "URI");
    });

    it("sets the initial URI for all token types", async function () {
      expect(await propertyNFT.uri(firstTokenID)).to.be.equal(initialURI);
      expect(await propertyNFT.uri(secondTokenID)).to.be.equal(initialURI);
    });

    describe("_setURI", function () {
      const newURI = "https://token-cdn-domain/{locale}/{id}.json";

      it("emits no URI event", async function () {
        const receipt = await propertyNFT.setURI(newURI);

        expectEvent.notEmitted(receipt, "URI");
      });

      it("sets the new URI for all token types", async function () {
        await propertyNFT.setURI(newURI);

        expect(await propertyNFT.uri(firstTokenID)).to.be.equal(newURI);
        expect(await propertyNFT.uri(secondTokenID)).to.be.equal(newURI);
      });
    });
  });
});
