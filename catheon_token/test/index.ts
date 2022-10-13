import {
  INITIAL_SUPPLY,
  parseWithDecimals,
  TOKEN_NAME,
  TOKEN_SYMBOL,
  ZERO_ADDRESS,
} from "./helper";
import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

describe("Catheon Token Unit Tests", function () {
  let catheonToken: Contract;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let eve: SignerWithAddress;
  let treasury: SignerWithAddress;

  beforeEach(async () => {
    [owner, alice, bob, eve, treasury] = await ethers.getSigners();

    const CatheonTokenFactory = await ethers.getContractFactory(
      "CatheonToken",
      owner
    );
    catheonToken = await upgrades.deployProxy(CatheonTokenFactory, [
      TOKEN_NAME,
      TOKEN_SYMBOL,
      parseWithDecimals(INITIAL_SUPPLY, 9),
      treasury.address,
    ]);
    await catheonToken.deployed();
  });

  it("1. Token can not deploy with invalid params", async function () {
    const CatheonTokenFactory = await ethers.getContractFactory(
      "CatheonToken",
      owner
    );
    await expect(
      upgrades.deployProxy(CatheonTokenFactory, [
        "",
        TOKEN_SYMBOL,
        parseWithDecimals(INITIAL_SUPPLY, 9),
        treasury.address,
      ])
    ).revertedWith("Empty Name");
    await expect(
      upgrades.deployProxy(CatheonTokenFactory, [
        TOKEN_NAME,
        "",
        parseWithDecimals(INITIAL_SUPPLY, 9),
        treasury.address,
      ])
    ).revertedWith("Invalid symbol: min 3 letters");
    await expect(
      upgrades.deployProxy(CatheonTokenFactory, [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        0,
        treasury.address,
      ])
    ).revertedWith("Invalid initial balance");
    await expect(
      upgrades.deployProxy(CatheonTokenFactory, [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        parseWithDecimals(INITIAL_SUPPLY, 9),
        ethers.constants.AddressZero,
      ])
    ).revertedWith("Zero Treasury Address");
  });

  it("2. After deploying, token should be have correct states", async function () {
    // name
    expect(await catheonToken.name()).to.eq(TOKEN_NAME);

    // symbol
    expect(await catheonToken.symbol()).to.eq(TOKEN_SYMBOL);

    // decimals
    const decimals = await catheonToken.decimals();
    expect(decimals).to.eq(9);

    // initial supply
    expect(await catheonToken.totalSupply()).to.eq(
      parseWithDecimals(INITIAL_SUPPLY, 9)
    );

    // fee percentage 15: 1.5% (1000 unit)
    expect(await catheonToken.fee()).to.eq(50);

    // service
    expect(await catheonToken.treasury()).to.eq(treasury.address);
  });

  describe("3. Fee percentage", async function () {
    it("3.1 The fee percentage can be set by only owner", async function () {
      await expect(catheonToken.connect(alice).setFee(20)).revertedWith(
        "Ownable: caller is not the owner"
      );

      await expect(catheonToken.connect(owner).setFee(20))
        .to.emit(catheonToken, "SetFeePercent")
        .withArgs(20);

      expect(await catheonToken.fee()).to.eq(20);
    });

    it("3.2 The fee percentage can not be set as origin value", async function () {
      expect(await catheonToken.fee()).to.eq(50);
      await expect(catheonToken.connect(owner).setFee(50)).revertedWith(
        "Same Fee Percentage"
      );
    });

    it("3.3 The fee percentage can not be set as 0% or over 90%", async function () {
      await expect(catheonToken.connect(owner).setFee(0)).revertedWith(
        "Invalid Fee Percentage"
      );

      await expect(catheonToken.connect(owner).setFee(901)).revertedWith(
        "Invalid Fee Percentage"
      );
    });
  });

  describe("4. Set the address as fee-applying-address", async function () {
    it("4.1 The special address can be set as fee-applying-address by only owner", async function () {
      await expect(
        catheonToken.connect(alice).setFeeApplyingAddr(eve.address, true)
      ).revertedWith("Ownable: caller is not the owner");

      await expect(
        catheonToken.connect(owner).setFeeApplyingAddr(eve.address, true)
      )
        .to.emit(catheonToken, "SetFeeApplyingAddress")
        .withArgs(eve.address, true);

      expect(await catheonToken.feeApplies(eve.address)).to.eq(true);
    });

    it("4.2 The service address can not be set as origin value", async function () {
      await catheonToken.connect(owner).setFeeApplyingAddr(eve.address, true);
      await expect(
        catheonToken.connect(owner).setFeeApplyingAddr(eve.address, true)
      ).revertedWith("Already Set");
    });
  });

  describe("5. Set treasury", async function () {
    it("5.1 The treasury can be set by only owner", async function () {
      await expect(
        catheonToken.connect(alice).setTreasury(eve.address)
      ).revertedWith("Ownable: caller is not the owner");

      await expect(catheonToken.connect(owner).setTreasury(eve.address))
        .to.emit(catheonToken, "SetTreasury")
        .withArgs(eve.address);

      expect(await catheonToken.treasury()).to.eq(eve.address);
    });

    it("5.2 The service address can not be set as origin value or zero address", async function () {
      await expect(
        catheonToken.connect(owner).setTreasury(treasury.address)
      ).revertedWith("Invalid Treasury Address");
      await expect(
        catheonToken.connect(owner).setTreasury(ethers.constants.AddressZero)
      ).revertedWith("Invalid Treasury Address");
    });
  });

  describe("6. Minting Token", async function () {
    it("6.1 Only the owner can mint token", async function () {
      await expect(
        catheonToken.connect(alice).mint(bob.address, parseWithDecimals(10, 9))
      ).revertedWith("Ownable: caller is not the owner");

      await expect(
        catheonToken.connect(owner).mint(bob.address, parseWithDecimals(10, 9))
      )
        .to.emit(catheonToken, "Transfer")
        .withArgs(ZERO_ADDRESS, bob.address, parseWithDecimals(10, 9));
    });

    it("6.2 Only the owner can set max supply", async function () {
      const newMaxSupply = parseWithDecimals(20_000_000_000, 9);

      await expect(
        catheonToken.connect(alice).setMaxSupply(newMaxSupply)
      ).revertedWith("Ownable: caller is not the owner");

      await expect(catheonToken.connect(owner).setMaxSupply(newMaxSupply))
        .to.emit(catheonToken, "SetMaxSupply")
        .withArgs(newMaxSupply);
    });

    it("6.3 The owner can not set max_supply with the smaller value than current total_supply ", async function () {
      await expect(
        catheonToken
          .connect(owner)
          .setMaxSupply(parseWithDecimals(INITIAL_SUPPLY, 9).sub(1))
      ).to.revertedWith("Invalid Max Supply");
    });

    it("6.4 The owner can not mint token over max supply", async function () {
      // can not mint over 10 billion
      await expect(
        catheonToken
          .connect(owner)
          .mint(alice.address, parseWithDecimals(10_000_000_000, 9).add(1))
      ).to.revertedWith("Limited By Max Supply");
    });
  });

  describe("7. Transfer", async function () {
    beforeEach(async function () {
      await catheonToken.connect(owner).mint(alice.address, 10000);
      await catheonToken.connect(owner).mint(bob.address, 10000);
    });

    it("7.1 if token is transferring from/to fee-applying-address, The fee will be applied", async function () {
      await catheonToken.connect(owner).setFeeApplyingAddr(bob.address, true);

      await expect(catheonToken.connect(alice).transfer(bob.address, 1000))
        .to.emit(catheonToken, "Transfer")
        .withArgs(alice.address, bob.address, 1000 - 50);

      // transferred fee (default: 5%) to service address
      expect(await catheonToken.balanceOf(treasury.address)).to.eq(50);

      await expect(catheonToken.connect(bob).transfer(alice.address, 1000))
        .to.emit(catheonToken, "Transfer")
        .withArgs(bob.address, alice.address, 1000 - 50);

      // transferred fee (default: 5%) to service address
      expect(await catheonToken.balanceOf(treasury.address)).to.eq(100);
    });

    it("7.2 if token-transfer is not related with fee-applying-address, The fee will not be applied", async function () {
      await expect(catheonToken.connect(alice).transfer(bob.address, 1000))
        .to.emit(catheonToken, "Transfer")
        .withArgs(alice.address, bob.address, 1000);
    });

    it("7.2 Can not transfer too small amount less then 1000 (fee avoidance) by fee-applying address", async function () {
      await catheonToken.connect(owner).setFeeApplyingAddr(bob.address, true);

      await expect(
        catheonToken.connect(alice).transfer(bob.address, 999)
      ).to.revertedWith("Too small transfer");
    });
  });

  describe("8. Burn Token", async function () {
    it("8.1 Only the owner can burn token", async function () {
      const burnAmount = parseWithDecimals(1000, 9);
      await expect(catheonToken.connect(alice).burn(burnAmount)).revertedWith(
        "Ownable: caller is not the owner"
      );

      const originBalance = await catheonToken.balanceOf(owner.address);
      const totalSupply = await catheonToken.totalSupply();

      await expect(catheonToken.connect(owner).burn(burnAmount))
        .to.emit(catheonToken, "Transfer")
        .withArgs(owner.address, ethers.constants.AddressZero, burnAmount);

      expect(await catheonToken.balanceOf(owner.address)).to.eq(
        originBalance.sub(burnAmount)
      );
      expect(await catheonToken.totalSupply()).to.eq(
        totalSupply.sub(burnAmount)
      );
    });
  });

  describe("9. Upgradeable Implement", async function () {
    it("9.1 After deploying proxy contract, can not initialize directly", async function () {
      await expect(
        catheonToken.initialize(
          TOKEN_NAME,
          TOKEN_SYMBOL,
          parseWithDecimals(INITIAL_SUPPLY, 9),
          treasury.address
        )
      ).to.revertedWith("Initializable: contract is already initialized");
    });

    it("9.2 After deploying as implement,nobody can initialize directly", async function () {
      const CatheonTokenFactory = await ethers.getContractFactory(
        "CatheonToken",
        owner
      );
      const newCatheonToken = await CatheonTokenFactory.deploy();
      await newCatheonToken.deployed();
      await expect(
        newCatheonToken
          .connect(alice)
          .initialize(
            TOKEN_NAME,
            TOKEN_SYMBOL,
            parseWithDecimals(INITIAL_SUPPLY, 9),
            treasury.address
          )
      ).to.revertedWith("Initializable: contract is already initialized");
    });
  });
});
