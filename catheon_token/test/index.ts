import {
  INITIAL_SUPPLY,
  parseWithDecimals,
  TOKEN_NAME,
  TOKEN_SYMBOL,
  ZERO_ADDRESS,
} from "./helper";
import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

describe("Catheon Token Unit Tests", function () {
  let wChicks: Contract;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let eve: SignerWithAddress;

  beforeEach(async () => {
    [owner, alice, bob, eve] = await ethers.getSigners();

    const WChicksFactory = await ethers.getContractFactory(
      "CatheonToken",
      owner
    );
    wChicks = await WChicksFactory.deploy(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      parseWithDecimals(INITIAL_SUPPLY, 9)
    );
    await wChicks.deployed();
  });

  it("1. WChicks can not deploy with zero_initial_supply", async function () {
    const WChicksFactory = await ethers.getContractFactory(
      "CatheonToken",
      owner
    );
    await expect(
      WChicksFactory.deploy(TOKEN_NAME, TOKEN_SYMBOL, 0)
    ).revertedWith("WChicks: Supply cannot be zero");
  });

  it("2. After deploying, token should be have default params", async function () {
    // name
    expect(await wChicks.name()).to.eq(TOKEN_NAME);

    // symbol
    expect(await wChicks.symbol()).to.eq(TOKEN_SYMBOL);

    // decimals
    const decimals = await wChicks.decimals();
    expect(decimals).to.eq(9);

    // initial supply
    expect(await wChicks.totalSupply()).to.eq(
      parseWithDecimals(INITIAL_SUPPLY, decimals)
    );

    // fee percentage 15: 1.5% (1000 unit)
    expect(await wChicks.fee()).to.eq(15);

    // service
    expect(await wChicks.service()).to.eq(ZERO_ADDRESS);

    // presale
    expect(await wChicks.presale()).to.eq(ZERO_ADDRESS);

    // minting_finished flag
    expect(await wChicks.mintingFinished()).to.eq(false);
  });

  describe("3. Fee percentage", async function () {
    it("3.1 The fee percentage can be set by only owner", async function () {
      await expect(wChicks.connect(alice).setFee(20)).revertedWith(
        "Ownable: caller is not the owner"
      );

      await expect(wChicks.connect(owner).setFee(20))
        .to.emit(wChicks, "SetFeePercent")
        .withArgs(15, 20);

      expect(await wChicks.fee()).to.eq(20);
    });

    it("3.2 The fee percentage can not be set as origin value", async function () {
      expect(await wChicks.fee()).to.eq(15);
      await expect(wChicks.connect(owner).setFee(15)).revertedWith(
        "WChicks: new fee percentage unchanged"
      );
    });

    it("3.3 The fee percentage can not be set as 0% or over 90%", async function () {
      await expect(wChicks.connect(owner).setFee(0)).revertedWith(
        "WChicks: Invalid Fee Percentage"
      );

      await expect(wChicks.connect(owner).setFee(901)).revertedWith(
        "WChicks: Invalid Fee Percentage"
      );
    });
  });

  describe("4. Set service address", async function () {
    it("4.1 The service address can be set by only owner", async function () {
      await expect(wChicks.connect(alice).setService(eve.address)).revertedWith(
        "Ownable: caller is not the owner"
      );

      await expect(wChicks.connect(owner).setService(eve.address))
        .to.emit(wChicks, "SetServiceAddress")
        .withArgs(ZERO_ADDRESS, eve.address);

      expect(await wChicks.service()).to.eq(eve.address);
    });

    it("4.2 The service address can not be set as origin value", async function () {
      await wChicks.connect(owner).setService(eve.address);
      await expect(wChicks.connect(owner).setService(eve.address)).revertedWith(
        "WChicks: Invalid Service Address"
      );
    });

    it("4.3 The service address can not be set as zero address", async function () {
      await expect(
        wChicks.connect(owner).setService(ZERO_ADDRESS)
      ).revertedWith("WChicks: Invalid Service Address");
    });
  });

  describe("5. Set presale address", async function () {
    it("5.1 The presale address can be set by only owner", async function () {
      await expect(wChicks.connect(alice).setPresale(eve.address)).revertedWith(
        "Ownable: caller is not the owner"
      );

      await expect(wChicks.connect(owner).setPresale(eve.address))
        .to.emit(wChicks, "SetPresaleAddress")
        .withArgs(ZERO_ADDRESS, eve.address);

      expect(await wChicks.presale()).to.eq(eve.address);
    });

    it("5.2 The presale address can not be set as origin value", async function () {
      await wChicks.connect(owner).setPresale(eve.address);
      await expect(wChicks.connect(owner).setPresale(eve.address)).revertedWith(
        "WChicks: Invalid Presale Address"
      );
    });

    it("5.3 The presale address can not be set as zero address", async function () {
      await expect(
        wChicks.connect(owner).setPresale(ZERO_ADDRESS)
      ).revertedWith("WChicks: Invalid Presale Address");
    });
  });

  describe("6. Minting Token", async function () {
    it("6.1 Only the owner can mint token", async function () {
      await expect(
        wChicks.connect(alice).mint(bob.address, parseWithDecimals(10, 9))
      ).revertedWith("Ownable: caller is not the owner");

      await expect(
        wChicks.connect(owner).mint(bob.address, parseWithDecimals(10, 9))
      )
        .to.emit(wChicks, "Transfer")
        .withArgs(ZERO_ADDRESS, bob.address, parseWithDecimals(10, 9));
    });

    it("6.2 Only the owner can set mintingFinished flag for limiting total_supply", async function () {
      await expect(
        wChicks.connect(alice).setMintingFinished(true)
      ).revertedWith("Ownable: caller is not the owner");

      await expect(wChicks.connect(owner).setMintingFinished(true))
        .to.emit(wChicks, "UpdateMintingFinished")
        .withArgs(false, true);
    });

    it("6.3 The owner can not set mintingFinished flag as origin flag", async function () {
      await expect(
        wChicks.connect(owner).setMintingFinished(false)
      ).to.revertedWith("WChicks: new minting_finished flag unchanged");
    });

    it("6.4 When the mintingFinished flag is set, total supply amount should be limited by 10 billion", async function () {
      await wChicks.connect(owner).setMintingFinished(true);

      // can mint by total_supply = 10 billion
      await expect(
        wChicks
          .connect(owner)
          .mint(alice.address, parseWithDecimals(9_000_000_000, 9))
      )
        .to.emit(wChicks, "Transfer")
        .withArgs(
          ZERO_ADDRESS,
          alice.address,
          parseWithDecimals(9_000_000_000, 9)
        );

      // check total_supply
      expect(await wChicks.totalSupply()).to.lte(
        parseWithDecimals(10_000_000_000, 9)
      );

      // can not mint over 10 billion
      await expect(
        wChicks.connect(owner).mint(alice.address, 1)
      ).to.revertedWith("WChicks: total supply was limited");
    });

    it("6.5 When the mintingFinished flag is not set, total supply amount should be not limited by 10 billion", async function () {
      await wChicks.connect(owner).setMintingFinished(true);

      // can not mint over 10 billion
      await expect(
        wChicks
          .connect(owner)
          .mint(alice.address, parseWithDecimals(9_000_000_001, 9))
      ).to.revertedWith("WChicks: total supply was limited");

      await wChicks.connect(owner).setMintingFinished(false);

      // can not mint over 10 billion
      await expect(
        wChicks
          .connect(owner)
          .mint(alice.address, parseWithDecimals(9_000_000_001, 9))
      )
        .to.emit(wChicks, "Transfer")
        .withArgs(
          ZERO_ADDRESS,
          alice.address,
          parseWithDecimals(9_000_000_001, 9)
        );
    });
  });

  describe("7. Transfer", async function () {
    beforeEach(async function () {
      await wChicks.connect(owner).mint(alice.address, 10000);
    });

    it("7.1 if serviceAddress is not set or recipient, The fee is not be applied", async function () {
      await expect(wChicks.connect(alice).transfer(bob.address, 1000))
        .to.emit(wChicks, "Transfer")
        .withArgs(alice.address, bob.address, 1000);

      await wChicks.connect(owner).setService(bob.address);

      await expect(wChicks.connect(alice).transfer(bob.address, 1000))
        .to.emit(wChicks, "Transfer")
        .withArgs(alice.address, bob.address, 1000);
    });

    it("7.2 if serviceAddress is set and not recipient, The fee should be applied", async function () {
      await wChicks.connect(owner).setService(eve.address);

      // transferred amount excluding fee(1.5%) to recipient
      await expect(wChicks.connect(alice).transfer(bob.address, 1000))
        .to.emit(wChicks, "Transfer")
        .withArgs(alice.address, bob.address, 1000 - 15);

      // transferred fee (1.5%) to service address
      expect(await wChicks.balanceOf(eve.address)).to.eq(15);
    });
  });
});
