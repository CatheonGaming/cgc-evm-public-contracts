import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { END_TIME, MINT_AMOUNT, MINT_PRICE, START_TIME, MAX_PER_USER, ERC20_TOKEN, ERC20_AMOUNT } from "./params_v1";

task("set:V1PublicSale", "Set whitelist sale to CGCWhitelistERC721A contract")
  .addParam("address", "The deployed smart contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const cgcWhitelistERC721A = await hre.ethers.getContractAt("CGCWhitelistERC721AV1", taskArguments.address);

    // Deploy Contract
    const tx = await cgcWhitelistERC721A.setupPublicSale(
      START_TIME,
      END_TIME,
      MINT_PRICE,
      MINT_AMOUNT,
      MAX_PER_USER,
      ERC20_TOKEN,
      ERC20_AMOUNT
    );
    await tx.wait();

    console.log("Public sale was set by transaction:", tx.hash);
  });

task("get:V1SaleId", "Set whitelist sale to CGCWhitelistERC721A contract")
  .addParam("address", "The deployed smart contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const cgcWhitelistERC721A = await hre.ethers.getContractAt("CGCWhitelistERC721AV1", taskArguments.address);

    // Deploy Contract
    const saleId = await cgcWhitelistERC721A.saleId();

    console.log("SaleId:", saleId);
  });

task("get:V1SaleInfo", "Set whitelist sale to CGCWhitelistERC721A contract")
  .addParam("address", "The deployed smart contract address")
  .addParam("saleid", "The sale index")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const cgcWhitelistERC721A = await hre.ethers.getContractAt("CGCWhitelistERC721AV1", taskArguments.address);

    // Deploy Contract
    const saleInfo = await cgcWhitelistERC721A.saleInfo(taskArguments.saleid);

    console.log("saleInfo:", saleInfo);
  });
