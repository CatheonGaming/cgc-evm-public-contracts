import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import {
  MAX_SUPPLY,
  NFT_NAME,
  NFT_SYMBOL,
  PUBLIC_MINT_PRICE,
  URI_PREFIX,
} from "./params";

task("deploy:WhitelistMintNFT", "Deploy WhitelistMintNFT Smart Contract").setAction(async function (
  taskArguments: TaskArguments,
  hre
) {
  const WhitelistMintNFT = await hre.ethers.getContractFactory("WhitelistMintNFT");

  // Deploy Contract
  const whitelistNft = await WhitelistMintNFT.deploy(
    NFT_NAME,
    NFT_SYMBOL,
    MAX_SUPPLY,
    URI_PREFIX,
    PUBLIC_MINT_PRICE
  );
  await whitelistNft.deployed();

  console.log("WhitelistMintNFT deployed to:", whitelistNft.address);
});

task("verify:WhitelistMintNFT", "Very WhitelistMintNFT Smart Contract")
  .addParam("address", "The deployed smart contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const params = [
      NFT_NAME,
      NFT_SYMBOL,
      MAX_SUPPLY,
      URI_PREFIX,
      PUBLIC_MINT_PRICE,
    ];

    // Verify Contract
    await hre.run("verify:verify", {
      address: taskArguments.address,
      constructorArguments: params,
    });

    console.log("WhitelistMintNFT verified successfully");
  });
