// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { campaigns } = require("../src/campaigns.json");

const tokens = (n) => {
  return ethers.utils.parseEther(n.toString());
};

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const GivingChainToken = await hre.ethers.getContractFactory("GiveChainToken");
  const givingChainToken = await GivingChainToken.deploy();

  console.log("Giving chain token contract address", givingChainToken.address);

  const CrowdFund = await hre.ethers.getContractFactory("CrowdFund");
  const crowdFund = await CrowdFund.deploy(givingChainToken.address);


  console.log("crowd fund contract address", crowdFund.address);

  const blockNumber = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNumber);
  const startAt = block.timestamp;

  // create campaigns
  // for (let i = 0; i < campaigns.length; i++) {
  //   const tx =  await crowdFund
  //     .connect(deployer)
  //     .createCampaign(
  //       campaigns[i].category,
  //       campaigns[i].goal,
  //       campaigns[i].description,
  //       campaigns[i].title,
  //       startAt + campaigns[i]._startAt + 86400,
  //       campaigns[i]._loactions,
  //       campaigns[i]._campaignImageUrl
  //     );

  //   await tx.wait();
  // }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
