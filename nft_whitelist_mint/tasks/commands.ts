import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { END_TIME1, MERKLE_ROOT1, MINT_PRICE1, START_TIME1 } from "./params";

task("set:WhitelistSale", "Set whitelist sale to WhitelistMintNFT nft contract")
  .addParam("address", "The deployed smart contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const whitelistMintNft = await hre.ethers.getContractAt("WhitelistMintNFT", taskArguments.address);

    // Deploy Contract
    const tx = await whitelistMintNft.setWhitelistSale(
      MERKLE_ROOT1,
      START_TIME1,
      END_TIME1,
      MINT_PRICE1
    );
    await tx.wait();

    console.log("New whitelist sale was set by transaction:", tx.hash);
  });

task("set:EnablePublicSale", "Set whitelist sale to WhitelistMintNFT contract")
  .addParam("address", "The deployed smart contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const whitelistMintNft = await hre.ethers.getContractAt("WhitelistMintNFT", taskArguments.address);

    // Deploy Contract
    const tx = await whitelistMintNft.setEnabledPublicSale(true);
    await tx.wait();

    console.log("Public sale was enabled by transaction:", tx.hash);
  });

task("set:DisablePublicSale", "Set whitelist sale to WhitelistMintNFT contract")
  .addParam("address", "The deployed smart contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const whitelistMintNft = await hre.ethers.getContractAt("WhitelistMintNFT", taskArguments.address);

    // Deploy Contract
    const tx = await whitelistMintNft.setEnabledPublicSale(false);
    await tx.wait();

    console.log("Public sale was disabled by transaction:", tx.hash);
  });
