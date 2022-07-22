import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import WhitelistMapManager from "../scripts/merkle/whitelist-map-manager";
import { BigNumber } from "ethers";

describe("CGCWhitelistERC721A", function () {
  function parseETHWithDecimals(amount: string) {
    return ethers.utils.parseEther(amount);
  }

  async function deployCGCWhitelistERC721AFixture() {
    const NFT_NAME = "Onigiri NFT";
    const NFT_SYMBOL = "ONIGIRI";
    const URI_PREFIX = "https://ipfs.io/ipfs/QmWT3G8y72jj3i1GaxAbcMeuPqhLMrQHzJ9DCDRy3N7DsK/";
    const MAX_SUPPLY = 5;
    const MAX_PER_USER = 2;

    const ONE_DAY_IN_SECS = 24 * 60 * 60;
    const THREE_DAYS_IN_SECS = 3 * 24 * 60 * 60;
    const MINT_PRICE = parseETHWithDecimals("0.1");

    const mintStartTime = (await time.latest()) + ONE_DAY_IN_SECS;
    const mintEndTime = (await time.latest()) + THREE_DAYS_IN_SECS;

    // Contracts are deployed using the first signer/account by default
    const [owner, alice, bob, eve] = await ethers.getSigners();

    // deploy CGCWhitelistERC721A contract
    const CGCWhitelistERC721A = await ethers.getContractFactory("CGCWhitelistERC721A", owner);
    const cgcWhitelistERC721A = await CGCWhitelistERC721A.deploy(NFT_NAME, NFT_SYMBOL, MAX_SUPPLY, URI_PREFIX);
    await cgcWhitelistERC721A.deployed();

    // merkle whitelist
    const whitelist = {
      [alice.address]: 1,
      [bob.address]: 2,
      [eve.address]: 2,
    };

    const whitelistManager = new WhitelistMapManager(whitelist);

    return {
      cgcWhitelistERC721A,
      name: NFT_NAME,
      symbol: NFT_SYMBOL,
      mintPrice: MINT_PRICE,
      maxSupply: MAX_SUPPLY,
      uriPrefix: URI_PREFIX,
      maxPerUser: MAX_PER_USER,
      mintStartTime,
      mintEndTime,
      merkleRoot: whitelistManager.merkleInfo.merkleRoot,
      list: whitelistManager.merkleInfo.list,
      merkleTotal: Number(whitelistManager.merkleInfo.tokenTotal),
      owner,
      alice,
      bob,
      eve,
    };
  }

  describe("Deployment", function () {
    it("Should set the right name and symbol, mint price, uri prefix, max supply", async function () {
      const { cgcWhitelistERC721A, name, symbol, maxSupply, uriPrefix } = await loadFixture(
        deployCGCWhitelistERC721AFixture
      );

      expect(await cgcWhitelistERC721A.name()).to.equal(name);
      expect(await cgcWhitelistERC721A.symbol()).to.equal(symbol);
      expect(await cgcWhitelistERC721A.maxSupply()).to.equal(maxSupply);
      expect(await cgcWhitelistERC721A.uriPrefix()).to.equal(uriPrefix);
    });

    it("Should set the right paused flag", async function () {
      const { cgcWhitelistERC721A } = await loadFixture(deployCGCWhitelistERC721AFixture);

      expect(await cgcWhitelistERC721A.paused()).to.equal(false);
    });

    it("Should set the right owner", async function () {
      const { cgcWhitelistERC721A, owner } = await loadFixture(deployCGCWhitelistERC721AFixture);

      expect(await cgcWhitelistERC721A.owner()).to.equal(owner.address);
    });

    it("Should set the right version", async function () {
      const { cgcWhitelistERC721A } = await loadFixture(deployCGCWhitelistERC721AFixture);

      expect(await cgcWhitelistERC721A.getVersionCode()).to.equal(0);
    });
  });

  describe("Set params", function () {
    it("Can set new merkle whitelist sale", async function () {
      const { cgcWhitelistERC721A, merkleRoot, mintStartTime, mintEndTime, mintPrice, merkleTotal } = await loadFixture(
        deployCGCWhitelistERC721AFixture
      );

      expect(await cgcWhitelistERC721A.saleId()).to.equal(0);

      await expect(
        cgcWhitelistERC721A.setupWhitelistSale(merkleRoot, mintStartTime, mintEndTime, mintPrice, merkleTotal)
      )
        .to.emit(cgcWhitelistERC721A, "SetupSaleInfo")
        .withArgs(1, [mintStartTime, mintEndTime, merkleRoot, mintPrice, merkleTotal, 0]);

      expect(await cgcWhitelistERC721A.saleId()).to.equal(1);
    });

    it("Can set new public sale", async function () {
      const { cgcWhitelistERC721A, mintStartTime, mintEndTime, mintPrice, maxPerUser } = await loadFixture(
        deployCGCWhitelistERC721AFixture
      );

      expect(await cgcWhitelistERC721A.saleId()).to.equal(0);

      await expect(cgcWhitelistERC721A.setupPublicSale(mintStartTime, mintEndTime, mintPrice, 3, maxPerUser))
        .to.emit(cgcWhitelistERC721A, "SetupSaleInfo")
        .withArgs(1, [mintStartTime, mintEndTime, ethers.constants.HashZero, mintPrice, 3, maxPerUser]);

      expect(await cgcWhitelistERC721A.saleId()).to.equal(1);

      let [startTime, endTime, merkleRoot, price, mintAmount, max] = await cgcWhitelistERC721A.saleInfo(1);
      expect(startTime).to.equal(BigNumber.from(mintStartTime));
      expect(endTime).to.equal(BigNumber.from(mintEndTime));
      expect(merkleRoot).to.equal(ethers.constants.HashZero);
      expect(price).to.equal(mintPrice);
      expect(mintAmount).to.equal(BigNumber.from(mintAmount));
      expect(max).to.equal(BigNumber.from(maxPerUser));

      [startTime, endTime, merkleRoot, price, mintAmount, max] = await cgcWhitelistERC721A.activeSaleInfo();
      expect(startTime).to.equal(BigNumber.from(mintStartTime));
      expect(endTime).to.equal(BigNumber.from(mintEndTime));
      expect(merkleRoot).to.equal(ethers.constants.HashZero);
      expect(price).to.equal(mintPrice);
      expect(mintAmount).to.equal(BigNumber.from(mintAmount));
      expect(max).to.equal(BigNumber.from(maxPerUser));
    });

    it("Can change the token uri prefix", async function () {
      const { cgcWhitelistERC721A } = await loadFixture(deployCGCWhitelistERC721AFixture);

      const newUriPrefix = "https://ipfs.io/ipfs/QmUIVD5yr9E7EFp9iFXcMeuPqp9iFXAGSbyKri6CFfL84M/";
      expect(await cgcWhitelistERC721A.setUriPrefix(newUriPrefix))
        .to.emit(cgcWhitelistERC721A, "SetUriPrefix")
        .withArgs(newUriPrefix);
    });

    it("Can change the token max supply", async function () {
      const { cgcWhitelistERC721A, alice, maxSupply } = await loadFixture(deployCGCWhitelistERC721AFixture);

      await cgcWhitelistERC721A.mintForAddress(alice.address, maxSupply);

      let newMaxSupply = maxSupply - 1;
      await expect(cgcWhitelistERC721A.setMaxSupply(newMaxSupply)).to.revertedWithCustomError(
        cgcWhitelistERC721A,
        "InvalidMaxSupply"
      );

      newMaxSupply = maxSupply + 1;
      expect(await cgcWhitelistERC721A.setMaxSupply(newMaxSupply))
        .to.emit(cgcWhitelistERC721A, "SetMaxSupply")
        .withArgs(newMaxSupply);
    });
  });

  describe("Mint by owner", function () {
    describe("Validations", function () {
      it("Should revert with the right error if minted by non-owner", async function () {
        const { cgcWhitelistERC721A, alice } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await expect(cgcWhitelistERC721A.connect(alice).mintForAddress(alice.address, 1)).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });
    });

    describe("Events", function () {
      it("Should emit an event on mintForAddress", async function () {
        const { cgcWhitelistERC721A, owner, alice } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await expect(cgcWhitelistERC721A.connect(owner).mintForAddress(alice.address, 1))
          .to.emit(cgcWhitelistERC721A, "Transfer")
          .withArgs(ethers.constants.AddressZero, alice.address, 1);

        const tokenIdsOfAlice = await cgcWhitelistERC721A.tokenIdsOf(alice.address);
        expect(tokenIdsOfAlice.length).to.equal(1);
        expect(tokenIdsOfAlice[0]).to.equal(1);
      });
    });
  });

  describe("Public Sale", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called with lager amount than max supply", async function () {
        const { cgcWhitelistERC721A, alice, bob, mintStartTime, mintEndTime, mintPrice, maxPerUser } =
          await loadFixture(deployCGCWhitelistERC721AFixture);

        const PUBLIC_MINT_AMOUNT = 3;
        await cgcWhitelistERC721A.setupPublicSale(
          mintStartTime,
          mintEndTime,
          mintPrice,
          PUBLIC_MINT_AMOUNT,
          maxPerUser
        );
        await time.increaseTo(mintStartTime);

        await cgcWhitelistERC721A.connect(alice).publicSale(2, { value: mintPrice.mul(2) });
        await expect(
          cgcWhitelistERC721A.connect(bob).publicSale(2, { value: mintPrice.mul(2) })
        ).to.be.revertedWithCustomError(cgcWhitelistERC721A, "PublicSaleMaxSupply");
      });

      it("Should revert with the right error if called with lager amount than max supply", async function () {
        const { cgcWhitelistERC721A, alice, mintStartTime, mintEndTime, mintPrice, maxPerUser } = await loadFixture(
          deployCGCWhitelistERC721AFixture
        );

        const PUBLIC_MINT_AMOUNT = 3;
        await cgcWhitelistERC721A.setupPublicSale(
          mintStartTime,
          mintEndTime,
          mintPrice,
          PUBLIC_MINT_AMOUNT,
          maxPerUser
        );
        await time.increaseTo(mintStartTime);

        await expect(
          cgcWhitelistERC721A.connect(alice).publicSale(3, { value: mintPrice.mul(3) })
        ).to.be.revertedWithCustomError(cgcWhitelistERC721A, "PublicSaleMaxUserSupply");
      });

      it("Should revert with the right error if called with insufficient fund", async function () {
        const { cgcWhitelistERC721A, alice, mintStartTime, mintEndTime, mintPrice, maxPerUser } = await loadFixture(
          deployCGCWhitelistERC721AFixture
        );

        await cgcWhitelistERC721A.setupPublicSale(mintStartTime, mintEndTime, mintPrice, 3, maxPerUser);
        await time.increaseTo(mintStartTime);

        await expect(cgcWhitelistERC721A.connect(alice).publicSale(1, { value: 0 })).to.be.revertedWithCustomError(
          cgcWhitelistERC721A,
          "MintInsufficientFund"
        );
      });

      it("Should revert with the right error if called when set disabled the public sale", async function () {
        const { cgcWhitelistERC721A, mintPrice, alice } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await expect(
          cgcWhitelistERC721A.connect(alice).publicSale(1, { value: mintPrice })
        ).to.be.revertedWithCustomError(cgcWhitelistERC721A, "MintNotAvailable");
      });

      it("Should revert with the right error after pausing", async function () {
        const { cgcWhitelistERC721A, alice, mintStartTime, mintEndTime, mintPrice, maxPerUser } = await loadFixture(
          deployCGCWhitelistERC721AFixture
        );

        await cgcWhitelistERC721A.setupPublicSale(mintStartTime, mintEndTime, mintPrice, 3, maxPerUser);
        await time.increaseTo(mintStartTime);
        await cgcWhitelistERC721A.pause();

        await expect(cgcWhitelistERC721A.connect(alice).publicSale(1, { value: mintPrice })).to.be.revertedWith(
          "Pausable: paused"
        );

        await cgcWhitelistERC721A.unpause();

        await cgcWhitelistERC721A.connect(alice).publicSale(1, { value: mintPrice });
      });
    });

    describe("Events", function () {
      it("Should emit an event on publicSale", async function () {
        const { cgcWhitelistERC721A, uriPrefix, alice, mintStartTime, mintEndTime, mintPrice, maxPerUser } =
          await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721A.setupPublicSale(mintStartTime, mintEndTime, mintPrice, 3, maxPerUser);
        await time.increaseTo(mintStartTime);

        await expect(cgcWhitelistERC721A.connect(alice).publicSale(1, { value: mintPrice.mul(1) }))
          .to.emit(cgcWhitelistERC721A, "Transfer")
          .withArgs(ethers.constants.AddressZero, alice.address, 1);

        expect(await cgcWhitelistERC721A.tokenURI(1)).to.equal(`${uriPrefix}1`);
        const tokenIdsOfAlice = await cgcWhitelistERC721A.tokenIdsOf(alice.address);
        expect(tokenIdsOfAlice.length).to.equal(1);
        expect(tokenIdsOfAlice[0]).to.equal(1);
      });
    });

    describe("Transfer & Withdraw", function () {
      it("Should transfer the funds to the contract", async function () {
        const { cgcWhitelistERC721A, alice, mintStartTime, mintEndTime, mintPrice, maxPerUser } = await loadFixture(
          deployCGCWhitelistERC721AFixture
        );

        await cgcWhitelistERC721A.setupPublicSale(mintStartTime, mintEndTime, mintPrice, 3, maxPerUser);
        await time.increaseTo(mintStartTime);

        await expect(
          cgcWhitelistERC721A.connect(alice).publicSale(1, { value: mintPrice.mul(1) })
        ).to.changeEtherBalance(alice, mintPrice.mul(-1));
      });

      it("Should withdraw the funds from the contract after the public sale", async function () {
        const { cgcWhitelistERC721A, owner, alice, mintStartTime, mintEndTime, mintPrice, maxPerUser } =
          await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721A.setupPublicSale(mintStartTime, mintEndTime, mintPrice, 3, maxPerUser);
        await time.increaseTo(mintStartTime);

        await cgcWhitelistERC721A.connect(alice).publicSale(1, { value: mintPrice.mul(1) });

        expect(await ethers.provider.getBalance(cgcWhitelistERC721A.address)).to.equal(mintPrice);

        await expect(cgcWhitelistERC721A.connect(owner).withdraw(owner.address)).to.changeEtherBalance(
          owner,
          mintPrice
        );
        expect(await ethers.provider.getBalance(cgcWhitelistERC721A.address)).to.equal(0);
      });
    });
  });

  describe("Whitelist Sale", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called when did not set merkle root", async function () {
        const { cgcWhitelistERC721A, mintPrice, alice, list } = await loadFixture(deployCGCWhitelistERC721AFixture);

        const userInfo = list[alice.address];
        await expect(
          cgcWhitelistERC721A
            .connect(alice)
            .whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 1, { value: mintPrice })
        ).to.be.revertedWithCustomError(cgcWhitelistERC721A, "WhitelistNotAvailable");
      });

      it("Should revert with the right error if called when did not set merkle root", async function () {
        const { cgcWhitelistERC721A, mintStartTime, mintEndTime, alice, mintPrice, merkleRoot, list, merkleTotal } =
          await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721A.setupWhitelistSale(merkleRoot, mintStartTime, mintEndTime, mintPrice, merkleTotal);
        await time.increaseTo(mintStartTime);

        const userInfo = list[alice.address];
        await expect(
          cgcWhitelistERC721A.connect(alice).whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 2, {
            value: mintPrice.mul(2),
          })
        ).to.be.revertedWithCustomError(cgcWhitelistERC721A, "WhitelistSaleMaxSupply");
      });

      it("Should revert with the right error if called with insufficient fund", async function () {
        const { cgcWhitelistERC721A, mintStartTime, mintEndTime, mintPrice, alice, merkleRoot, list, merkleTotal } =
          await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721A.setupWhitelistSale(merkleRoot, mintStartTime, mintEndTime, mintPrice, merkleTotal);
        await time.increaseTo(mintStartTime);

        const userInfo = list[alice.address];
        await expect(
          cgcWhitelistERC721A
            .connect(alice)
            .whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 1, { value: 0 })
        ).to.be.revertedWithCustomError(cgcWhitelistERC721A, "MintInsufficientFund");
      });

      it("Should revert with the right error if called too soon", async function () {
        const { cgcWhitelistERC721A, alice, mintStartTime, mintEndTime, mintPrice, merkleRoot, list, merkleTotal } =
          await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721A.setupWhitelistSale(merkleRoot, mintStartTime, mintEndTime, mintPrice, merkleTotal);

        const userInfo = list[alice.address];
        await expect(
          cgcWhitelistERC721A
            .connect(alice)
            .whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 1, { value: mintPrice })
        ).to.be.revertedWithCustomError(cgcWhitelistERC721A, "MintNotAvailable");
      });
    });

    describe("Events", function () {
      it("Should emit an event on whitelist sale", async function () {
        const { cgcWhitelistERC721A, mintStartTime, mintEndTime, mintPrice, alice, merkleRoot, list, merkleTotal } =
          await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721A.setupWhitelistSale(merkleRoot, mintStartTime, mintEndTime, mintPrice, merkleTotal);
        await time.increaseTo(mintStartTime);

        const userInfo = list[alice.address];
        expect(await cgcWhitelistERC721A.mintedAmount(1)).to.equal(0);
        expect(await cgcWhitelistERC721A.mintedAmountOf(1, alice.address)).to.equal(0);

        await expect(
          cgcWhitelistERC721A
            .connect(alice)
            .whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 1, { value: mintPrice })
        )
          .to.emit(cgcWhitelistERC721A, "Transfer")
          .withArgs(ethers.constants.AddressZero, alice.address, 1);

        expect(await cgcWhitelistERC721A.mintedAmount(1)).to.equal(1);
        expect(await cgcWhitelistERC721A.mintedAmountOf(1, alice.address)).to.equal(1);
      });
    });

    describe("Transfer & Withdraw", function () {
      it("Should transfer the funds to the contract", async function () {
        const { cgcWhitelistERC721A, mintStartTime, mintEndTime, mintPrice, alice, merkleRoot, list, merkleTotal } =
          await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721A.setupWhitelistSale(merkleRoot, mintStartTime, mintEndTime, mintPrice, merkleTotal);
        await time.increaseTo(mintStartTime);

        const userInfo = list[alice.address];
        await expect(
          cgcWhitelistERC721A
            .connect(alice)
            .whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 1, { value: mintPrice })
        ).to.changeEtherBalance(alice, mintPrice.mul(-1));
      });

      it("Should withdraw the funds from the contract after the whitelist sale", async function () {
        const {
          cgcWhitelistERC721A,
          mintStartTime,
          mintEndTime,
          mintPrice,
          owner,
          alice,
          merkleRoot,
          list,
          merkleTotal,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721A.setupWhitelistSale(merkleRoot, mintStartTime, mintEndTime, mintPrice, merkleTotal);
        await time.increaseTo(mintStartTime);

        const userInfo = list[alice.address];
        await cgcWhitelistERC721A
          .connect(alice)
          .whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 1, { value: mintPrice });

        expect(await ethers.provider.getBalance(cgcWhitelistERC721A.address)).to.equal(mintPrice);

        await expect(cgcWhitelistERC721A.connect(owner).withdraw(owner.address)).to.changeEtherBalance(
          owner,
          mintPrice
        );
        expect(await ethers.provider.getBalance(cgcWhitelistERC721A.address)).to.equal(0);
      });
    });
  });
});
