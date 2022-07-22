import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import {
  END_TIME1,
  END_TIME2,
  MAX_PER_USER,
  MERKLE_ROOT1,
  MERKLE_TOTAL,
  MINT_AMOUNT2,
  MINT_PRICE1,
  MINT_PRICE2,
  START_TIME1,
  START_TIME2,
} from "./params";

task("set:WhitelistSale", "Set whitelist sale to CGCWhitelistERC721A nft contract")
  .addParam("address", "The deployed smart contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const cgcWhitelistERC721A = await hre.ethers.getContractAt("CGCWhitelistERC721A", taskArguments.address);

    // Deploy Contract
    const tx = await cgcWhitelistERC721A.setupWhitelistSale(
      MERKLE_ROOT1,
      START_TIME1,
      END_TIME1,
      MINT_PRICE1,
      MERKLE_TOTAL
    );
    await tx.wait();

    console.log("New whitelist sale was set by transaction:", tx.hash);
  });

task("set:PublicSale", "Set whitelist sale to CGCWhitelistERC721A contract")
  .addParam("address", "The deployed smart contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const cgcWhitelistERC721A = await hre.ethers.getContractAt("CGCWhitelistERC721A", taskArguments.address);

    // Deploy Contract
    const tx = await cgcWhitelistERC721A.setupPublicSale(
      START_TIME2,
      END_TIME2,
      MINT_PRICE2,
      MINT_AMOUNT2,
      MAX_PER_USER
    );
    await tx.wait();

    console.log("Public sale was set by transaction:", tx.hash);
  });
