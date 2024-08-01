/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-var-requires */
const { expect } = require("chai");

describe("GiveChainToken", () => {
  let giveChainToken;
  beforeEach(async () => {
    const GiveChainToken = await ethers.getContractFactory("GiveChainToken");
    giveChainToken = await GiveChainToken.deploy();
  });

  describe("Deployment", () => {
    it("token has name and symbol", async () => {
      const name = await giveChainToken.name();
      const symbol = await giveChainToken.symbol();

      expect(name).to.equal("GiveChain");
      expect(symbol).to.equal("GCT");
    });
  });

  describe("Mint", () => {
    it("wallet should get 10,000 tokens after minting", async () => {
      const [_, addr1] = await ethers.getSigners();
      await giveChainToken.connect(addr1).mint();
      const bal = await giveChainToken.connect(addr1).balanceOf(addr1.address);
      expect(parseInt(ethers.utils.formatEther(bal))).to.equal(10000);
    });
  });
});
