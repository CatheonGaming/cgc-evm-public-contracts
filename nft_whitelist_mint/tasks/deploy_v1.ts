import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { MAX_SUPPLY, NFT_NAME, NFT_SYMBOL, URI_PREFIX } from "./params_v1";

// Version 1
task("deploy:CGCWhitelistERC721AV1", "Deploy CGCWhitelistERC721AV1 Smart Contract").setAction(async function (
  taskArguments: TaskArguments,
  hre
) {
  const CGCWhitelistERC721AV1 = await hre.ethers.getContractFactory("CGCWhitelistERC721AV1");

  // Deploy Contract
  const whitelistNft = await CGCWhitelistERC721AV1.deploy(NFT_NAME, NFT_SYMBOL, MAX_SUPPLY, URI_PREFIX);
  await whitelistNft.deployed();

  console.log("CGCWhitelistERC721AV1 deployed to:", whitelistNft.address);
});

task("verify:CGCWhitelistERC721AV1", "Very CGCWhitelistERC721AV1 Smart Contract")
  .addParam("address", "The deployed smart contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const params = [NFT_NAME, NFT_SYMBOL, MAX_SUPPLY, URI_PREFIX];

    // Verify Contract
    await hre.run("verify:verify", {
      address: taskArguments.address,
      constructorArguments: params,
    });

    console.log("CGCWhitelistERC721AV1 verified successfully");
  });
