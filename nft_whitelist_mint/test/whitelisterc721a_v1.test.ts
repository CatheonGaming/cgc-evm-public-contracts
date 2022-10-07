import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import WhitelistMapManager from "../scripts/merkle/whitelist-map-manager";
import { BigNumber } from "ethers";

describe("CGCWhitelistERC721AV1", function () {
  function parseETHWithDecimals(amount: string) {
    return ethers.utils.parseEther(amount);
  }

  async function deployCGCWhitelistERC721AFixture() {
    const NFT_NAME = "Aotuverse Game Beta Pass";
    const NFT_SYMBOL = "AOTUVERSE";
    const URI_PREFIX = "https://ipfs.io/ipfs/QmWT3G8y72jj3i1GaxAbcMeuPqhLMrQHzJ9DCDRy3N7DsK/";
    const MAX_SUPPLY = 100;
    const MAX_PER_USER = 2;
    const ERC20_PRICE = 100;

    const ONE_DAY_IN_SECS = 24 * 60 * 60;
    const THREE_DAYS_IN_SECS = 3 * 24 * 60 * 60;
    const MINT_PRICE = parseETHWithDecimals("0.1");

    const mintStartTime = (await time.latest()) + ONE_DAY_IN_SECS;
    const mintEndTime = (await time.latest()) + THREE_DAYS_IN_SECS;

    // Contracts are deployed using the first signer/account by default
    const [owner, alice, bob, eve] = await ethers.getSigners();

    // deploy CGCWhitelistERC721A contract
    const CGCWhitelistERC721A = await ethers.getContractFactory("CGCWhitelistERC721AV1", owner);
    const cgcWhitelistERC721AV1 = await CGCWhitelistERC721A.deploy(NFT_NAME, NFT_SYMBOL, MAX_SUPPLY, URI_PREFIX);
    await cgcWhitelistERC721AV1.deployed();

    // deploy StableCoin
    const TestERC20Factory = await ethers.getContractFactory("TestERC20", owner);
    const testERC20 = await TestERC20Factory.deploy();
    await testERC20.deployed();

    await testERC20.mint(alice.address, 1000);
    await testERC20.mint(bob.address, 1000);
    await testERC20.mint(eve.address, 1000);

    await testERC20.connect(alice).approve(cgcWhitelistERC721AV1.address, ethers.constants.MaxUint256);
    await testERC20.connect(bob).approve(cgcWhitelistERC721AV1.address, ethers.constants.MaxUint256);
    await testERC20.connect(eve).approve(cgcWhitelistERC721AV1.address, ethers.constants.MaxUint256);

    // merkle whitelist
    const whitelist = {
      [alice.address]: 1,
      [bob.address]: 2,
      [eve.address]: 200,
    };

    const whitelistManager = new WhitelistMapManager(whitelist);

    return {
      cgcWhitelistERC721AV1,
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
      testERC20,
      ERC20_PRICE,
    };
  }

  describe("Deployment", function () {
    it("Should set the right name and symbol, mint price, uri prefix, max supply", async function () {
      const { cgcWhitelistERC721AV1, name, symbol, maxSupply, uriPrefix } = await loadFixture(
        deployCGCWhitelistERC721AFixture
      );

      expect(await cgcWhitelistERC721AV1.name()).to.equal(name);
      expect(await cgcWhitelistERC721AV1.symbol()).to.equal(symbol);
      expect(await cgcWhitelistERC721AV1.maxSupply()).to.equal(maxSupply);
      expect(await cgcWhitelistERC721AV1.uriPrefix()).to.equal(uriPrefix);
    });

    it("Should set the right paused flag", async function () {
      const { cgcWhitelistERC721AV1 } = await loadFixture(deployCGCWhitelistERC721AFixture);

      expect(await cgcWhitelistERC721AV1.paused()).to.equal(false);
    });

    it("Should set the right owner", async function () {
      const { cgcWhitelistERC721AV1, owner } = await loadFixture(deployCGCWhitelistERC721AFixture);

      expect(await cgcWhitelistERC721AV1.owner()).to.equal(owner.address);
    });

    it("Should set the right version", async function () {
      const { cgcWhitelistERC721AV1 } = await loadFixture(deployCGCWhitelistERC721AFixture);

      expect(await cgcWhitelistERC721AV1.getVersionCode()).to.equal(1);
    });
  });

  describe("Set params", function () {
    it("Can set new merkle whitelist sale", async function () {
      const {
        cgcWhitelistERC721AV1,
        merkleRoot,
        mintStartTime,
        mintEndTime,
        mintPrice,
        merkleTotal,
        testERC20,
        ERC20_PRICE,
      } = await loadFixture(deployCGCWhitelistERC721AFixture);

      expect(await cgcWhitelistERC721AV1.saleId()).to.equal(0);

      await expect(
        cgcWhitelistERC721AV1.setupWhitelistSale(
          merkleRoot,
          mintStartTime,
          mintEndTime,
          mintPrice,
          merkleTotal,
          testERC20.address,
          ERC20_PRICE
        )
      )
        .to.emit(cgcWhitelistERC721AV1, "SetupSaleInfo")
        .withArgs(1, [
          mintStartTime,
          mintEndTime,
          merkleRoot,
          mintPrice,
          merkleTotal,
          0,
          testERC20.address,
          ERC20_PRICE,
        ]);

      expect(await cgcWhitelistERC721AV1.saleId()).to.equal(1);
    });

    it("Can set new public sale", async function () {
      const { cgcWhitelistERC721AV1, mintStartTime, mintEndTime, mintPrice, maxPerUser, testERC20, ERC20_PRICE } =
        await loadFixture(deployCGCWhitelistERC721AFixture);

      expect(await cgcWhitelistERC721AV1.saleId()).to.equal(0);

      await expect(
        cgcWhitelistERC721AV1.setupPublicSale(
          mintStartTime,
          mintEndTime,
          mintPrice,
          3,
          maxPerUser,
          testERC20.address,
          ERC20_PRICE
        )
      )
        .to.emit(cgcWhitelistERC721AV1, "SetupSaleInfo")
        .withArgs(1, [
          mintStartTime,
          mintEndTime,
          ethers.constants.HashZero,
          mintPrice,
          3,
          maxPerUser,
          testERC20.address,
          ERC20_PRICE,
        ]);

      expect(await cgcWhitelistERC721AV1.saleId()).to.equal(1);

      let [startTime, endTime, merkleRoot, price, mintAmount, max] = await cgcWhitelistERC721AV1.saleInfo(1);
      expect(startTime).to.equal(BigNumber.from(mintStartTime));
      expect(endTime).to.equal(BigNumber.from(mintEndTime));
      expect(merkleRoot).to.equal(ethers.constants.HashZero);
      expect(price).to.equal(mintPrice);
      expect(mintAmount).to.equal(BigNumber.from(mintAmount));
      expect(max).to.equal(BigNumber.from(maxPerUser));

      [startTime, endTime, merkleRoot, price, mintAmount, max] = await cgcWhitelistERC721AV1.activeSaleInfo();
      expect(startTime).to.equal(BigNumber.from(mintStartTime));
      expect(endTime).to.equal(BigNumber.from(mintEndTime));
      expect(merkleRoot).to.equal(ethers.constants.HashZero);
      expect(price).to.equal(mintPrice);
      expect(mintAmount).to.equal(BigNumber.from(mintAmount));
      expect(max).to.equal(BigNumber.from(maxPerUser));
    });

    it("Can change the token uri prefix", async function () {
      const { cgcWhitelistERC721AV1 } = await loadFixture(deployCGCWhitelistERC721AFixture);

      const newUriPrefix = "https://ipfs.io/ipfs/QmUIVD5yr9E7EFp9iFXcMeuPqp9iFXAGSbyKri6CFfL84M/";
      expect(await cgcWhitelistERC721AV1.setUriPrefix(newUriPrefix))
        .to.emit(cgcWhitelistERC721AV1, "SetUriPrefix")
        .withArgs(newUriPrefix);
    });

    it("Can change the token max supply", async function () {
      const { cgcWhitelistERC721AV1, alice, maxSupply } = await loadFixture(deployCGCWhitelistERC721AFixture);

      await cgcWhitelistERC721AV1.mintForAddress(alice.address, maxSupply);

      let newMaxSupply = maxSupply - 1;
      await expect(cgcWhitelistERC721AV1.setMaxSupply(newMaxSupply)).to.revertedWithCustomError(
        cgcWhitelistERC721AV1,
        "InvalidMaxSupply"
      );

      newMaxSupply = maxSupply + 1;
      expect(await cgcWhitelistERC721AV1.setMaxSupply(newMaxSupply))
        .to.emit(cgcWhitelistERC721AV1, "SetMaxSupply")
        .withArgs(newMaxSupply);
    });
  });

  describe("Mint by owner", function () {
    describe("Validations", function () {
      it("Should revert with the right error if minted by non-owner", async function () {
        const { cgcWhitelistERC721AV1, alice } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await expect(cgcWhitelistERC721AV1.connect(alice).mintForAddress(alice.address, 1)).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });
    });

    describe("Events", function () {
      it("Should emit an event on mintForAddress", async function () {
        const { cgcWhitelistERC721AV1, owner, alice } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await expect(cgcWhitelistERC721AV1.connect(owner).mintForAddress(alice.address, 1))
          .to.emit(cgcWhitelistERC721AV1, "Transfer")
          .withArgs(ethers.constants.AddressZero, alice.address, 1);

        const tokenIdsOfAlice = await cgcWhitelistERC721AV1.tokenIdsOf(alice.address);
        expect(tokenIdsOfAlice.length).to.equal(1);
        expect(tokenIdsOfAlice[0]).to.equal(1);
      });
    });
  });

  describe("Public Sale", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called with lager amount than max supply", async function () {
        const {
          cgcWhitelistERC721AV1,
          alice,
          bob,
          mintStartTime,
          mintEndTime,
          mintPrice,
          maxPerUser,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        const PUBLIC_MINT_AMOUNT = 3;
        await cgcWhitelistERC721AV1.setupPublicSale(
          mintStartTime,
          mintEndTime,
          mintPrice,
          PUBLIC_MINT_AMOUNT,
          maxPerUser,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        await cgcWhitelistERC721AV1.connect(alice).publicSale(2, { value: mintPrice.mul(2) });
        await expect(
          cgcWhitelistERC721AV1.connect(bob).publicSale(2, { value: mintPrice.mul(2) })
        ).to.be.revertedWithCustomError(cgcWhitelistERC721AV1, "PublicSaleMaxSupply");
      });

      it("Should revert with the right error if called with lager amount than max supply", async function () {
        const {
          cgcWhitelistERC721AV1,
          alice,
          mintStartTime,
          mintEndTime,
          mintPrice,
          maxPerUser,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        const PUBLIC_MINT_AMOUNT = 3;
        await cgcWhitelistERC721AV1.setupPublicSale(
          mintStartTime,
          mintEndTime,
          mintPrice,
          PUBLIC_MINT_AMOUNT,
          maxPerUser,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        await expect(
          cgcWhitelistERC721AV1.connect(alice).publicSale(4, { value: mintPrice.mul(4) })
        ).to.be.revertedWithCustomError(cgcWhitelistERC721AV1, "PublicSaleMaxUserSupply");
      });

      it("Should revert with the right error if called with insufficient fund", async function () {
        const {
          cgcWhitelistERC721AV1,
          alice,
          mintStartTime,
          mintEndTime,
          mintPrice,
          maxPerUser,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupPublicSale(
          mintStartTime,
          mintEndTime,
          mintPrice,
          3,
          maxPerUser,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        await expect(cgcWhitelistERC721AV1.connect(alice).publicSale(1, { value: 0 })).to.be.revertedWithCustomError(
          cgcWhitelistERC721AV1,
          "MintInsufficientFund"
        );
      });

      it("Should revert with the right error if called when set disabled the public sale", async function () {
        const { cgcWhitelistERC721AV1, mintPrice, alice } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await expect(
          cgcWhitelistERC721AV1.connect(alice).publicSale(1, { value: mintPrice })
        ).to.be.revertedWithCustomError(cgcWhitelistERC721AV1, "MintNotAvailable");
      });

      it("Should revert with the right error after pausing", async function () {
        const {
          cgcWhitelistERC721AV1,
          alice,
          mintStartTime,
          mintEndTime,
          mintPrice,
          maxPerUser,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupPublicSale(
          mintStartTime,
          mintEndTime,
          mintPrice,
          3,
          maxPerUser,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);
        await cgcWhitelistERC721AV1.pause();

        await expect(cgcWhitelistERC721AV1.connect(alice).publicSale(1, { value: mintPrice })).to.be.revertedWith(
          "Pausable: paused"
        );

        await cgcWhitelistERC721AV1.unpause();

        await cgcWhitelistERC721AV1.connect(alice).publicSale(1, { value: mintPrice });
      });
    });

    describe("Events", function () {
      it("Should emit an event on publicSale", async function () {
        const {
          cgcWhitelistERC721AV1,
          uriPrefix,
          alice,
          mintStartTime,
          mintEndTime,
          mintPrice,
          maxPerUser,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupPublicSale(
          mintStartTime,
          mintEndTime,
          mintPrice,
          3,
          maxPerUser,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        await expect(cgcWhitelistERC721AV1.connect(alice).publicSale(1, { value: mintPrice.mul(1) }))
          .to.emit(cgcWhitelistERC721AV1, "Transfer")
          .withArgs(ethers.constants.AddressZero, alice.address, 1);

        expect(await cgcWhitelistERC721AV1.tokenURI(1)).to.equal(`${uriPrefix}1`);
        const tokenIdsOfAlice = await cgcWhitelistERC721AV1.tokenIdsOf(alice.address);
        expect(tokenIdsOfAlice.length).to.equal(1);
        expect(tokenIdsOfAlice[0]).to.equal(1);
      });
    });

    describe("Transfer & Withdraw", function () {
      it("Should transfer the funds to the contract", async function () {
        const {
          cgcWhitelistERC721AV1,
          alice,
          mintStartTime,
          mintEndTime,
          mintPrice,
          maxPerUser,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupPublicSale(
          mintStartTime,
          mintEndTime,
          mintPrice,
          3,
          maxPerUser,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        await expect(
          cgcWhitelistERC721AV1.connect(alice).publicSale(1, { value: mintPrice.mul(1) })
        ).to.changeEtherBalance(alice, mintPrice.mul(-1));
      });

      it("Should withdraw the funds from the contract after the public sale", async function () {
        const {
          cgcWhitelistERC721AV1,
          owner,
          alice,
          mintStartTime,
          mintEndTime,
          mintPrice,
          maxPerUser,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupPublicSale(
          mintStartTime,
          mintEndTime,
          mintPrice,
          3,
          maxPerUser,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        await cgcWhitelistERC721AV1.connect(alice).publicSale(1, { value: mintPrice.mul(1) });

        expect(await ethers.provider.getBalance(cgcWhitelistERC721AV1.address)).to.equal(mintPrice);

        await expect(cgcWhitelistERC721AV1.connect(owner).withdraw(owner.address)).to.changeEtherBalance(
          owner,
          mintPrice
        );
        expect(await ethers.provider.getBalance(cgcWhitelistERC721AV1.address)).to.equal(0);
      });
    });
  });

  describe("Whitelist Sale", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called when did not set merkle root", async function () {
        const { cgcWhitelistERC721AV1, mintPrice, alice, list } = await loadFixture(deployCGCWhitelistERC721AFixture);

        const userInfo = list[alice.address];
        await expect(
          cgcWhitelistERC721AV1
            .connect(alice)
            .whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 1, { value: mintPrice })
        ).to.be.revertedWithCustomError(cgcWhitelistERC721AV1, "WhitelistNotAvailable");
      });

      it("Should revert with the right error if called when did not set merkle root", async function () {
        const {
          cgcWhitelistERC721AV1,
          mintStartTime,
          mintEndTime,
          alice,
          mintPrice,
          merkleRoot,
          list,
          merkleTotal,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupWhitelistSale(
          merkleRoot,
          mintStartTime,
          mintEndTime,
          mintPrice,
          merkleTotal,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        const userInfo = list[alice.address];
        await expect(
          cgcWhitelistERC721AV1.connect(alice).whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 2, {
            value: mintPrice.mul(2),
          })
        ).to.be.revertedWithCustomError(cgcWhitelistERC721AV1, "WhitelistSaleMaxUserSupply");
      });

      it("Should revert with the right error if called with insufficient fund", async function () {
        const {
          cgcWhitelistERC721AV1,
          mintStartTime,
          mintEndTime,
          mintPrice,
          alice,
          merkleRoot,
          list,
          merkleTotal,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupWhitelistSale(
          merkleRoot,
          mintStartTime,
          mintEndTime,
          mintPrice,
          merkleTotal,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        const userInfo = list[alice.address];
        await expect(
          cgcWhitelistERC721AV1
            .connect(alice)
            .whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 1, { value: 0 })
        ).to.be.revertedWithCustomError(cgcWhitelistERC721AV1, "MintInsufficientFund");
      });

      it("Should revert with the right error if called too soon", async function () {
        const {
          cgcWhitelistERC721AV1,
          alice,
          mintStartTime,
          mintEndTime,
          mintPrice,
          merkleRoot,
          list,
          merkleTotal,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupWhitelistSale(
          merkleRoot,
          mintStartTime,
          mintEndTime,
          mintPrice,
          merkleTotal,
          testERC20.address,
          ERC20_PRICE
        );

        const userInfo = list[alice.address];
        await expect(
          cgcWhitelistERC721AV1
            .connect(alice)
            .whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 1, { value: mintPrice })
        ).to.be.revertedWithCustomError(cgcWhitelistERC721AV1, "MintNotAvailable");
      });
    });

    describe("Events", function () {
      it("Should emit an event on whitelist sale", async function () {
        const {
          cgcWhitelistERC721AV1,
          mintStartTime,
          mintEndTime,
          mintPrice,
          alice,
          merkleRoot,
          list,
          merkleTotal,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupWhitelistSale(
          merkleRoot,
          mintStartTime,
          mintEndTime,
          mintPrice,
          merkleTotal,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        const userInfo = list[alice.address];
        expect(await cgcWhitelistERC721AV1.mintedAmount(1)).to.equal(0);
        expect(await cgcWhitelistERC721AV1.mintedAmountOf(1, alice.address)).to.equal(0);

        await expect(
          cgcWhitelistERC721AV1
            .connect(alice)
            .whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 1, { value: mintPrice })
        )
          .to.emit(cgcWhitelistERC721AV1, "Transfer")
          .withArgs(ethers.constants.AddressZero, alice.address, 1);

        expect(await cgcWhitelistERC721AV1.mintedAmount(1)).to.equal(1);
        expect(await cgcWhitelistERC721AV1.mintedAmountOf(1, alice.address)).to.equal(1);
      });
    });

    describe("Transfer & Withdraw", function () {
      it("Should transfer the funds to the contract", async function () {
        const {
          cgcWhitelistERC721AV1,
          mintStartTime,
          mintEndTime,
          mintPrice,
          alice,
          merkleRoot,
          list,
          merkleTotal,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupWhitelistSale(
          merkleRoot,
          mintStartTime,
          mintEndTime,
          mintPrice,
          merkleTotal,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        const userInfo = list[alice.address];
        await expect(
          cgcWhitelistERC721AV1
            .connect(alice)
            .whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 1, { value: mintPrice })
        ).to.changeEtherBalance(alice, mintPrice.mul(-1));
      });

      it("Should withdraw the funds from the contract after the whitelist sale", async function () {
        const {
          cgcWhitelistERC721AV1,
          mintStartTime,
          mintEndTime,
          mintPrice,
          owner,
          alice,
          merkleRoot,
          list,
          merkleTotal,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupWhitelistSale(
          merkleRoot,
          mintStartTime,
          mintEndTime,
          mintPrice,
          merkleTotal,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        const userInfo = list[alice.address];
        await cgcWhitelistERC721AV1
          .connect(alice)
          .whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 1, { value: mintPrice });

        expect(await ethers.provider.getBalance(cgcWhitelistERC721AV1.address)).to.equal(mintPrice);

        await expect(cgcWhitelistERC721AV1.connect(owner).withdraw(owner.address)).to.changeEtherBalance(
          owner,
          mintPrice
        );
        expect(await ethers.provider.getBalance(cgcWhitelistERC721AV1.address)).to.equal(0);
      });
    });
  });

  describe("Public Sale With ERC20", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called with lager amount than max supply", async function () {
        const {
          cgcWhitelistERC721AV1,
          alice,
          bob,
          mintStartTime,
          mintEndTime,
          mintPrice,
          maxPerUser,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        const PUBLIC_MINT_AMOUNT = 3;
        await cgcWhitelistERC721AV1.setupPublicSale(
          mintStartTime,
          mintEndTime,
          mintPrice,
          PUBLIC_MINT_AMOUNT,
          maxPerUser,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        await cgcWhitelistERC721AV1.connect(alice).publicSaleWithERC20(2);
        await expect(cgcWhitelistERC721AV1.connect(bob).publicSaleWithERC20(2)).to.be.revertedWithCustomError(
          cgcWhitelistERC721AV1,
          "PublicSaleMaxSupply"
        );
      });

      it("Should revert with the right error if called with lager amount than max supply", async function () {
        const {
          cgcWhitelistERC721AV1,
          alice,
          mintStartTime,
          mintEndTime,
          mintPrice,
          maxPerUser,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        const PUBLIC_MINT_AMOUNT = 3;
        await cgcWhitelistERC721AV1.setupPublicSale(
          mintStartTime,
          mintEndTime,
          mintPrice,
          PUBLIC_MINT_AMOUNT,
          maxPerUser,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        await expect(cgcWhitelistERC721AV1.connect(alice).publicSaleWithERC20(3)).to.be.revertedWithCustomError(
          cgcWhitelistERC721AV1,
          "PublicSaleMaxUserSupply"
        );
      });

      it("Should revert with the right error if called with insufficient token balance", async function () {
        const { cgcWhitelistERC721AV1, alice, mintStartTime, mintEndTime, mintPrice, testERC20, ERC20_PRICE } =
          await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupPublicSale(
          mintStartTime,
          mintEndTime,
          mintPrice,
          0,
          0,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        await expect(cgcWhitelistERC721AV1.connect(alice).publicSaleWithERC20(100)).to.be.revertedWith(
          "ERC20: transfer amount exceeds balance"
        );
      });

      it("Should revert with the right error if called when set disabled the public sale", async function () {
        const { cgcWhitelistERC721AV1, alice } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await expect(cgcWhitelistERC721AV1.connect(alice).publicSaleWithERC20(1)).to.be.revertedWithCustomError(
          cgcWhitelistERC721AV1,
          "MintNotAvailable"
        );
      });

      it("Should revert with the right error after pausing", async function () {
        const {
          cgcWhitelistERC721AV1,
          alice,
          mintStartTime,
          mintEndTime,
          mintPrice,
          maxPerUser,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupPublicSale(
          mintStartTime,
          mintEndTime,
          mintPrice,
          3,
          maxPerUser,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);
        await cgcWhitelistERC721AV1.pause();

        await expect(cgcWhitelistERC721AV1.connect(alice).publicSaleWithERC20(1)).to.be.revertedWith(
          "Pausable: paused"
        );

        await cgcWhitelistERC721AV1.unpause();

        await cgcWhitelistERC721AV1.connect(alice).publicSaleWithERC20(1);
      });
    });

    describe("Events", function () {
      it("Should emit an event on publicSale", async function () {
        const {
          cgcWhitelistERC721AV1,
          uriPrefix,
          alice,
          mintStartTime,
          mintEndTime,
          mintPrice,
          maxPerUser,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupPublicSale(
          mintStartTime,
          mintEndTime,
          mintPrice,
          3,
          maxPerUser,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        await expect(cgcWhitelistERC721AV1.connect(alice).publicSaleWithERC20(1))
          .to.emit(cgcWhitelistERC721AV1, "Transfer")
          .withArgs(ethers.constants.AddressZero, alice.address, 1)
          .to.changeTokenBalances(testERC20, [cgcWhitelistERC721AV1, alice], [ERC20_PRICE, ERC20_PRICE * -1]);

        expect(await cgcWhitelistERC721AV1.tokenURI(1)).to.equal(`${uriPrefix}1`);
        const tokenIdsOfAlice = await cgcWhitelistERC721AV1.tokenIdsOf(alice.address);
        expect(tokenIdsOfAlice.length).to.equal(1);
        expect(tokenIdsOfAlice[0]).to.equal(1);
      });
    });

    describe("Transfer & Withdraw", function () {
      it("Should transfer the funds to the contract", async function () {
        const {
          cgcWhitelistERC721AV1,
          alice,
          mintStartTime,
          mintEndTime,
          mintPrice,
          maxPerUser,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupPublicSale(
          mintStartTime,
          mintEndTime,
          mintPrice,
          3,
          maxPerUser,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        await expect(cgcWhitelistERC721AV1.connect(alice).publicSaleWithERC20(1)).to.changeTokenBalance(
          testERC20,
          alice,
          ERC20_PRICE * -1
        );
      });

      it("Should withdraw the funds from the contract after the public sale", async function () {
        const {
          cgcWhitelistERC721AV1,
          owner,
          alice,
          mintStartTime,
          mintEndTime,
          mintPrice,
          maxPerUser,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupPublicSale(
          mintStartTime,
          mintEndTime,
          mintPrice,
          3,
          maxPerUser,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        await cgcWhitelistERC721AV1.connect(alice).publicSaleWithERC20(1);

        expect(await testERC20.balanceOf(cgcWhitelistERC721AV1.address)).to.equal(ERC20_PRICE);

        await expect(
          cgcWhitelistERC721AV1.connect(owner).withdrawERC20(testERC20.address, owner.address)
        ).to.changeTokenBalance(testERC20, owner, ERC20_PRICE);
        expect(await testERC20.balanceOf(cgcWhitelistERC721AV1.address)).to.equal(0);
      });
    });
  });

  describe("Whitelist Sale With ERC20", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called when did not set merkle root", async function () {
        const { cgcWhitelistERC721AV1, mintPrice, alice, list } = await loadFixture(deployCGCWhitelistERC721AFixture);

        const userInfo = list[alice.address];
        await expect(
          cgcWhitelistERC721AV1
            .connect(alice)
            .whitelistSale(userInfo.index, userInfo.proof, userInfo.amount, 1, { value: mintPrice })
        ).to.be.revertedWithCustomError(cgcWhitelistERC721AV1, "WhitelistNotAvailable");
      });

      it("Should revert with the right error if called when did not set merkle root", async function () {
        const {
          cgcWhitelistERC721AV1,
          mintStartTime,
          mintEndTime,
          alice,
          mintPrice,
          merkleRoot,
          list,
          merkleTotal,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupWhitelistSale(
          merkleRoot,
          mintStartTime,
          mintEndTime,
          mintPrice,
          merkleTotal,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        const userInfo = list[alice.address];
        await expect(
          cgcWhitelistERC721AV1
            .connect(alice)
            .whitelistSaleWithERC20(userInfo.index, userInfo.proof, userInfo.amount, 2)
        ).to.be.revertedWithCustomError(cgcWhitelistERC721AV1, "WhitelistSaleMaxUserSupply");
      });

      it("Should revert with the right error if called with insufficient fund", async function () {
        const {
          cgcWhitelistERC721AV1,
          mintStartTime,
          mintEndTime,
          mintPrice,
          eve,
          merkleRoot,
          list,
          merkleTotal,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupWhitelistSale(
          merkleRoot,
          mintStartTime,
          mintEndTime,
          mintPrice,
          merkleTotal,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        const userInfo = list[eve.address];
        await expect(
          cgcWhitelistERC721AV1
            .connect(eve)
            .whitelistSaleWithERC20(userInfo.index, userInfo.proof, userInfo.amount, 100)
        ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      });

      it("Should revert with the right error if called too soon", async function () {
        const {
          cgcWhitelistERC721AV1,
          alice,
          mintStartTime,
          mintEndTime,
          mintPrice,
          merkleRoot,
          list,
          merkleTotal,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupWhitelistSale(
          merkleRoot,
          mintStartTime,
          mintEndTime,
          mintPrice,
          merkleTotal,
          testERC20.address,
          ERC20_PRICE
        );

        const userInfo = list[alice.address];
        await expect(
          cgcWhitelistERC721AV1
            .connect(alice)
            .whitelistSaleWithERC20(userInfo.index, userInfo.proof, userInfo.amount, 1)
        ).to.be.revertedWithCustomError(cgcWhitelistERC721AV1, "MintNotAvailable");
      });
    });

    describe("Events", function () {
      it("Should emit an event on whitelist sale", async function () {
        const {
          cgcWhitelistERC721AV1,
          mintStartTime,
          mintEndTime,
          mintPrice,
          alice,
          merkleRoot,
          list,
          merkleTotal,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupWhitelistSale(
          merkleRoot,
          mintStartTime,
          mintEndTime,
          mintPrice,
          merkleTotal,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        const userInfo = list[alice.address];
        expect(await cgcWhitelistERC721AV1.mintedAmount(1)).to.equal(0);
        expect(await cgcWhitelistERC721AV1.mintedAmountOf(1, alice.address)).to.equal(0);

        await expect(
          cgcWhitelistERC721AV1
            .connect(alice)
            .whitelistSaleWithERC20(userInfo.index, userInfo.proof, userInfo.amount, 1)
        )
          .to.emit(cgcWhitelistERC721AV1, "Transfer")
          .withArgs(ethers.constants.AddressZero, alice.address, 1)
          .to.changeTokenBalances(testERC20, [cgcWhitelistERC721AV1, alice], [ERC20_PRICE, ERC20_PRICE * -1]);

        expect(await cgcWhitelistERC721AV1.mintedAmount(1)).to.equal(1);
        expect(await cgcWhitelistERC721AV1.mintedAmountOf(1, alice.address)).to.equal(1);
      });
    });

    describe("Transfer & Withdraw", function () {
      it("Should transfer the funds to the contract", async function () {
        const {
          cgcWhitelistERC721AV1,
          mintStartTime,
          mintEndTime,
          mintPrice,
          alice,
          merkleRoot,
          list,
          merkleTotal,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupWhitelistSale(
          merkleRoot,
          mintStartTime,
          mintEndTime,
          mintPrice,
          merkleTotal,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        const userInfo = list[alice.address];
        await expect(
          cgcWhitelistERC721AV1
            .connect(alice)
            .whitelistSaleWithERC20(userInfo.index, userInfo.proof, userInfo.amount, 1)
        ).to.changeTokenBalance(testERC20, alice, ERC20_PRICE * -1);
      });

      it("Should withdraw the funds from the contract after the whitelist sale", async function () {
        const {
          cgcWhitelistERC721AV1,
          mintStartTime,
          mintEndTime,
          mintPrice,
          owner,
          alice,
          merkleRoot,
          list,
          merkleTotal,
          testERC20,
          ERC20_PRICE,
        } = await loadFixture(deployCGCWhitelistERC721AFixture);

        await cgcWhitelistERC721AV1.setupWhitelistSale(
          merkleRoot,
          mintStartTime,
          mintEndTime,
          mintPrice,
          merkleTotal,
          testERC20.address,
          ERC20_PRICE
        );
        await time.increaseTo(mintStartTime);

        const userInfo = list[alice.address];
        await cgcWhitelistERC721AV1
          .connect(alice)
          .whitelistSaleWithERC20(userInfo.index, userInfo.proof, userInfo.amount, 1);

        expect(await testERC20.balanceOf(cgcWhitelistERC721AV1.address)).to.equal(ERC20_PRICE);

        await expect(
          cgcWhitelistERC721AV1.connect(owner).withdrawERC20(testERC20.address, owner.address)
        ).to.changeTokenBalance(testERC20, owner, ERC20_PRICE);
        expect(await testERC20.balanceOf(cgcWhitelistERC721AV1.address)).to.equal(0);
      });
    });
  });
});
