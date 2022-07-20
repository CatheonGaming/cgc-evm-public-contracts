import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { MAX_SUPPLY, NFT_NAME, NFT_SYMBOL, URI_PREFIX } from "./params";

task("deploy:CGCWhitelistERC721A", "Deploy CGCWhitelistERC721A Smart Contract").setAction(async function (
  taskArguments: TaskArguments,
  hre
) {
  const CGCWhitelistERC721A = await hre.ethers.getContractFactory("CGCWhitelistERC721A");

  // Deploy Contract
  const whitelistNft = await CGCWhitelistERC721A.deploy(NFT_NAME, NFT_SYMBOL, MAX_SUPPLY, URI_PREFIX);
  await whitelistNft.deployed();

  console.log("CGCWhitelistERC721A deployed to:", whitelistNft.address);
});

task("verify:CGCWhitelistERC721A", "Very CGCWhitelistERC721A Smart Contract")
  .addParam("address", "The deployed smart contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const params = [NFT_NAME, NFT_SYMBOL, MAX_SUPPLY, URI_PREFIX];

    // Verify Contract
    await hre.run("verify:verify", {
      address: taskArguments.address,
      constructorArguments: params,
    });

    console.log("CGCWhitelistERC721A verified successfully");
  });
