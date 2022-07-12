import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import WhitelistMapManager from "../scripts/merkle/whitelist-map-manager";

describe("WhitelistMintNFT", function () {
  function parseETHWithDecimals(amount: string) {
    return ethers.utils.parseEther(amount);
  }

  async function deployWhitelistMintNftFixture() {
    const NFT_NAME = "Onigiri NFT";
    const NFT_SYMBOL = "ONIGIRI";
    const URI_PREFIX = "https://ipfs.io/ipfs/QmWT3G8y72jj3i1GaxAbcMeuPqhLMrQHzJ9DCDRy3N7DsK/";
    const MAX_SUPPLY = 5;

    const ONE_DAY_IN_SECS = 24 * 60 * 60;
    const THREE_DAYS_IN_SECS = 3 * 24 * 60 * 60;
    const MINT_PRICE = parseETHWithDecimals("0.1");

    const mintStartTime = (await time.latest()) + ONE_DAY_IN_SECS;
    const mintEndTime = (await time.latest()) + THREE_DAYS_IN_SECS;

    // Contracts are deployed using the first signer/account by default
    const [owner, alice, bob, eve] = await ethers.getSigners();

    // deploy WhitelistMintNft contract
    const WhitelistMintNFT = await ethers.getContractFactory("WhitelistMintNFT", owner);
    const whitelistMintNft = await WhitelistMintNFT.deploy(NFT_NAME, NFT_SYMBOL, MAX_SUPPLY, URI_PREFIX, MINT_PRICE);
    await whitelistMintNft.deployed();

    // merkle whitelist
    const whitelist = {
      [alice.address]: 1,
      [bob.address]: 2,
      [eve.address]: 2,
    };

    const whitelistManager = new WhitelistMapManager(whitelist);

    return {
      whitelistMintNft: whitelistMintNft,
      name: NFT_NAME,
      symbol: NFT_SYMBOL,
      mintPrice: MINT_PRICE,
      maxSupply: MAX_SUPPLY,
      uriPrefix: URI_PREFIX,
      mintStartTime,
      mintEndTime,
      merkleRoot: whitelistManager.merkleInfo.merkleRoot,
      list: whitelistManager.merkleInfo.list,
      owner,
      alice,
      bob,
      eve,
    };
  }

  describe("Deployment", function () {
    it("Should set the right name and symbol, mint price, uri prefix, max supply", async function () {
      const { whitelistMintNft, name, symbol, mintPrice, maxSupply, uriPrefix } = await loadFixture(
        deployWhitelistMintNftFixture
      );

      expect(await whitelistMintNft.name()).to.equal(name);
      expect(await whitelistMintNft.symbol()).to.equal(symbol);
      expect(await whitelistMintNft.pMintPrice()).to.equal(mintPrice);
      expect(await whitelistMintNft.maxSupply()).to.equal(maxSupply);
      expect(await whitelistMintNft.uriPrefix()).to.equal(uriPrefix);
    });

    it("Should set the right paused flag", async function () {
      const { whitelistMintNft } = await loadFixture(deployWhitelistMintNftFixture);

      expect(await whitelistMintNft.paused()).to.equal(false);
    });

    it("Should set the right owner", async function () {
      const { whitelistMintNft, owner } = await loadFixture(deployWhitelistMintNftFixture);

      expect(await whitelistMintNft.owner()).to.equal(owner.address);
    });
  });

  describe("Set params", function () {
    it("Can change the mint price ", async function () {
      const { whitelistMintNft } = await loadFixture(deployWhitelistMintNftFixture);

      const newMintPrice = parseETHWithDecimals("0.2");
      await expect(whitelistMintNft.setPublicMintPrice(newMintPrice))
        .to.emit(whitelistMintNft, "SetPublicMintPrice")
        .withArgs(newMintPrice);
    });

    it("Can set new merkle whitelist sale", async function () {
      const { whitelistMintNft, merkleRoot, mintStartTime, mintEndTime, mintPrice } = await loadFixture(
        deployWhitelistMintNftFixture
      );

      expect(await whitelistMintNft.wlSaleCounter()).to.equal(0);

      await expect(whitelistMintNft.setWhitelistSale(merkleRoot, mintStartTime, mintEndTime, mintPrice))
        .to.emit(whitelistMintNft, "SetWhitelistSale")
        .withArgs(merkleRoot, mintStartTime, mintEndTime, mintPrice);

      expect(await whitelistMintNft.wlSaleCounter()).to.equal(1);
    });

    it("Can change the token uri prefix", async function () {
      const { whitelistMintNft } = await loadFixture(deployWhitelistMintNftFixture);

      const newUriPrefix = "https://ipfs.io/ipfs/QmUIVD5yr9E7EFp9iFXcMeuPqp9iFXAGSbyKri6CFfL84M/";
      expect(await whitelistMintNft.setUriPrefix(newUriPrefix))
        .to.emit(whitelistMintNft, "SetUriPrefix")
        .withArgs(newUriPrefix);
    });
  });

  describe("Mint by owner", function () {
    describe("Validations", function () {
      it("Should revert with the right error if minted by non-owner", async function () {
        const { whitelistMintNft, alice } = await loadFixture(deployWhitelistMintNftFixture);

        await expect(whitelistMintNft.connect(alice).mintForAddress(alice.address, 1)).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });
    });

    describe("Events", function () {
      it("Should emit an event on mintForAddress", async function () {
        const { whitelistMintNft, owner, alice } = await loadFixture(deployWhitelistMintNftFixture);

        await expect(whitelistMintNft.connect(owner).mintForAddress(alice.address, 1))
          .to.emit(whitelistMintNft, "Transfer")
          .withArgs(ethers.constants.AddressZero, alice.address, 1);

        const tokenIdsOfAlice = await whitelistMintNft.tokenIdsOf(alice.address);
        expect(tokenIdsOfAlice.length).to.equal(1);
        expect(tokenIdsOfAlice[0]).to.equal(1);
      });
    });
  });

  describe("Public Sale", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called with lager amount than max supply", async function () {
        const { whitelistMintNft, alice, maxSupply, mintPrice } = await loadFixture(deployWhitelistMintNftFixture);

        await whitelistMintNft.setEnabledPublicSale(true);

        await expect(
          whitelistMintNft.connect(alice).publicSale(maxSupply + 1, { value: mintPrice.mul(maxSupply + 1) })
        ).to.be.revertedWithCustomError(whitelistMintNft, "MintMaxSupply");
      });

      it("Should revert with the right error if called with insufficient fund", async function () {
        const { whitelistMintNft, alice } = await loadFixture(deployWhitelistMintNftFixture);

        await whitelistMintNft.setEnabledPublicSale(true);

        await expect(whitelistMintNft.connect(alice).publicSale(1, { value: 0 })).to.be.revertedWithCustomError(
          whitelistMintNft,
          "MintInsufficientFund"
        );
      });

      it("Should revert with the right error if called when set disabled the public sale", async function () {
        const { whitelistMintNft, mintPrice, alice } = await loadFixture(deployWhitelistMintNftFixture);

        await expect(whitelistMintNft.connect(alice).publicSale(1, { value: mintPrice })).to.be.revertedWithCustomError(
          whitelistMintNft,
          "PublicSaleNotAvailable"
        );
      });

      it("Should revert with the right error after pausing", async function () {
        const { whitelistMintNft, mintPrice, alice } = await loadFixture(deployWhitelistMintNftFixture);

        await whitelistMintNft.setEnabledPublicSale(true);
        await whitelistMintNft.pause();

        await expect(whitelistMintNft.connect(alice).publicSale(1, { value: mintPrice })).to.be.revertedWith(
          "Pausable: paused"
        );

        await whitelistMintNft.unpause();

        await whitelistMintNft.connect(alice).publicSale(1, { value: mintPrice });
      });
    });

    describe("Events", function () {
      it("Should emit an event on publicSale", async function () {
        const { whitelistMintNft, mintPrice, uriPrefix, alice } = await loadFixture(deployWhitelistMintNftFixture);

        await whitelistMintNft.setEnabledPublicSale(true);

        await expect(whitelistMintNft.connect(alice).publicSale(1, { value: mintPrice.mul(1) }))
          .to.emit(whitelistMintNft, "Transfer")
          .withArgs(ethers.constants.AddressZero, alice.address, 1);

        expect(await whitelistMintNft.tokenURI(1)).to.equal(`${uriPrefix}1`);
        const tokenIdsOfAlice = await whitelistMintNft.tokenIdsOf(alice.address);
        expect(tokenIdsOfAlice.length).to.equal(1);
        expect(tokenIdsOfAlice[0]).to.equal(1);
      });
    });

    describe("Transfer & Withdraw", function () {
      it("Should transfer the funds to the contract", async function () {
        const { whitelistMintNft, mintPrice, alice } = await loadFixture(deployWhitelistMintNftFixture);

        await whitelistMintNft.setEnabledPublicSale(true);

        await expect(whitelistMintNft.connect(alice).publicSale(1, { value: mintPrice.mul(1) })).to.changeEtherBalance(
          alice,
          mintPrice.mul(-1)
        );
      });

      it("Should withdraw the funds from the contract after the public sale", async function () {
        const { whitelistMintNft, mintPrice, owner, alice } = await loadFixture(deployWhitelistMintNftFixture);

        await whitelistMintNft.setEnabledPublicSale(true);

        await whitelistMintNft.connect(alice).publicSale(1, { value: mintPrice.mul(1) });

        expect(await ethers.provider.getBalance(whitelistMintNft.address)).to.equal(mintPrice);

        await expect(whitelistMintNft.connect(owner).withdraw(owner.address)).to.changeEtherBalance(owner, mintPrice);
        expect(await ethers.provider.getBalance(whitelistMintNft.address)).to.equal(0);
      });
    });
  });

  describe("Whitelist Sale", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called when did not set merkle root", async function () {
        const { whitelistMintNft, mintPrice, alice, list } = await loadFixture(deployWhitelistMintNftFixture);

        const userInfo = list[alice.address];
        await expect(
          whitelistMintNft
            .connect(alice)
            .whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 1, { value: mintPrice })
        ).to.be.revertedWithCustomError(whitelistMintNft, "WhitelistNotAvailable");
      });

      it("Should revert with the right error if called when did not set merkle root", async function () {
        const { whitelistMintNft, mintStartTime, mintEndTime, alice, mintPrice, merkleRoot, list } = await loadFixture(
          deployWhitelistMintNftFixture
        );

        await whitelistMintNft.setWhitelistSale(merkleRoot, mintStartTime, mintEndTime, mintPrice);
        await time.increaseTo(mintStartTime);

        const userInfo = list[alice.address];
        await expect(
          whitelistMintNft.connect(alice).whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 2, {
            value: mintPrice.mul(2),
          })
        ).to.be.revertedWithCustomError(whitelistMintNft, "WhitelistMaxSupply");
      });

      it("Should revert with the right error if called with insufficient fund", async function () {
        const { whitelistMintNft, mintStartTime, mintEndTime, mintPrice, alice, merkleRoot, list } = await loadFixture(
          deployWhitelistMintNftFixture
        );

        await whitelistMintNft.setWhitelistSale(merkleRoot, mintStartTime, mintEndTime, mintPrice);
        await time.increaseTo(mintStartTime);

        const userInfo = list[alice.address];
        await expect(
          whitelistMintNft
            .connect(alice)
            .whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 1, { value: 0 })
        ).to.be.revertedWithCustomError(whitelistMintNft, "MintInsufficientFund");
      });

      it("Should revert with the right error if called too soon", async function () {
        const { whitelistMintNft, alice, mintStartTime, mintEndTime, mintPrice, merkleRoot, list } = await loadFixture(
          deployWhitelistMintNftFixture
        );

        await whitelistMintNft.setWhitelistSale(merkleRoot, mintStartTime, mintEndTime, mintPrice);

        const userInfo = list[alice.address];
        await expect(
          whitelistMintNft
            .connect(alice)
            .whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 1, { value: mintPrice })
        ).to.be.revertedWithCustomError(whitelistMintNft, "MintNotAvailable");
      });
    });

    describe("Events", function () {
      it("Should emit an event on whitelist sale", async function () {
        const { whitelistMintNft, mintStartTime, mintEndTime, mintPrice, alice, merkleRoot, list } = await loadFixture(
          deployWhitelistMintNftFixture
        );

        await whitelistMintNft.setWhitelistSale(merkleRoot, mintStartTime, mintEndTime, mintPrice);
        await time.increaseTo(mintStartTime);

        const userInfo = list[alice.address];
        expect(await whitelistMintNft.getWlMintedAmount(1, alice.address)).to.equal(0);
        await expect(
          whitelistMintNft
            .connect(alice)
            .whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 1, { value: mintPrice })
        )
          .to.emit(whitelistMintNft, "Transfer")
          .withArgs(ethers.constants.AddressZero, alice.address, 1);
        expect(await whitelistMintNft.getWlMintedAmount(1, alice.address)).to.equal(1);
      });
    });

    describe("Transfer & Withdraw", function () {
      it("Should transfer the funds to the contract", async function () {
        const { whitelistMintNft, mintStartTime, mintEndTime, mintPrice, alice, merkleRoot, list } = await loadFixture(
          deployWhitelistMintNftFixture
        );

        await whitelistMintNft.setWhitelistSale(merkleRoot, mintStartTime, mintEndTime, mintPrice);
        await time.increaseTo(mintStartTime);

        const userInfo = list[alice.address];
        await expect(
          whitelistMintNft
            .connect(alice)
            .whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 1, { value: mintPrice })
        ).to.changeEtherBalance(alice, mintPrice.mul(-1));
      });

      it("Should withdraw the funds from the contract after the whitelist sale", async function () {
        const { whitelistMintNft, mintStartTime, mintEndTime, mintPrice, owner, alice, merkleRoot, list } =
          await loadFixture(deployWhitelistMintNftFixture);

        await whitelistMintNft.setWhitelistSale(merkleRoot, mintStartTime, mintEndTime, mintPrice);
        await time.increaseTo(mintStartTime);

        const userInfo = list[alice.address];
        await whitelistMintNft
          .connect(alice)
          .whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 1, { value: mintPrice });

        expect(await ethers.provider.getBalance(whitelistMintNft.address)).to.equal(mintPrice);

        await expect(whitelistMintNft.connect(owner).withdraw(owner.address)).to.changeEtherBalance(owner, mintPrice);
        expect(await ethers.provider.getBalance(whitelistMintNft.address)).to.equal(0);
      });
    });
  });
});
