// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx smart-contract run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { INITIAL_SUPPLY, TOKEN_NAME, TOKEN_SYMBOL, TREASURY } from "./params";
import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

task("deploy:Catheon", "Deploy Catheon Token").setAction(async function (
  taskArguments: TaskArguments,
  hre
) {
  const CatheonTokenFactory = await hre.ethers.getContractFactory(
    "CatheonToken"
  );

  // Deploy Contract
  const catheonToken = await CatheonTokenFactory.deploy(
    TOKEN_NAME,
    TOKEN_SYMBOL,
    hre.ethers.utils.parseUnits(INITIAL_SUPPLY.toString(), 9),
    TREASURY
  );
  await catheonToken.deployed();

  console.log("Catheon Token deployed to:", catheonToken.address);
});

task("verify:Catheon", "Deploy Catheon Token")
  .addParam("address", "The deployed Catheon token address")
  .setAction(async function (taskArguments: TaskArguments, hre) {

    // Verify Contract
    await hre.run("verify:verify", {
      address: taskArguments.address,
      constructorArguments: [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        hre.ethers.utils.parseUnits(INITIAL_SUPPLY.toString(), 9),
        TREASURY,
      ],
    });

    console.log("Catheon token was verified successfully !!!");
  });
