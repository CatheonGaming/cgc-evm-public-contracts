import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import {
  collections,
  END_TIME,
  ERC20_AMOUNT,
  ERC20_TOKEN,
  getTimestampFromDate,
  MAX_PER_USER,
  MAX_SUPPLY,
  NFT_NAME,
  NFT_SYMBOL,
  URI_PREFIX,
} from "./params_v1";

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

// Deploy and set Schedule for all collections
task("deploy:ALLCGCWhitelistERC721AV1", "Deploy CGCWhitelistERC721AV1 Smart Contract")
  .addParam("idx", "The index of collection", -1, types.int, true)
  .setAction(async function (taskArguments: TaskArguments, hre) {
    for (let i = 0; i < collections.length; i++) {
      console.log("i", i, taskArguments.idx);
      if (taskArguments.idx > -1 && i !== taskArguments.idx) {
        continue;
      }

      const collection = collections[i];
      const CGCWhitelistERC721AV1 = await hre.ethers.getContractFactory("CGCWhitelistERC721AV1");

      // Deploy Contract
      const whitelistNft = await CGCWhitelistERC721AV1.deploy(
        collection.name,
        collection.symbol,
        collection.supply,
        collection.uri_prefix
      );
      await whitelistNft.deployed();

      const startTime = getTimestampFromDate(new Date(Date.now() + 1000 * 120));
      // Deploy Contract
      const tx = await whitelistNft.setupPublicSale(
        startTime,
        END_TIME,
        hre.ethers.utils.parseEther(collection.price.toString()),
        collection.supply,
        MAX_PER_USER,
        ERC20_TOKEN,
        ERC20_AMOUNT
      );
      await tx.wait();

      console.log(`${collection.name} NFT collection was deployed to:`, whitelistNft.address);
    }
  });
