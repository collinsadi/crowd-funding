/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-var-requires */
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFund", () => {
	// @ts-ignore
	let crowdFund;
	// @ts-ignore
	let giveChainToken;
	// @ts-ignore
	let owner;
	// @ts-ignore
	let campaignFunder;
	const campaignImageUrl = "https://www.gofundme.com/";

	beforeEach(async () => {
		[owner, campaignFunder] = await ethers.getSigners();
		// deploy token contract first
		const GiveChainToken = await ethers.getContractFactory("GiveChainToken");
		giveChainToken = await GiveChainToken.deploy();

		const CrowdFund = await ethers.getContractFactory("CrowdFund");
		crowdFund = await CrowdFund.deploy(giveChainToken.address);

		// mint 10,000 tokens to campaignFunder
		// @ts-ignore
		await giveChainToken.connect(campaignFunder).mint();
		// approve CrowdFund to spend campaignFunder tokens
		await giveChainToken
			// @ts-ignore
			.connect(campaignFunder)
			.approve(crowdFund.address, ethers.utils.parseEther("5000"));
	});

	describe("Deployment", () => {
		it("token address is same as token smart contract address", async () => {
			// @ts-ignore
			const token = await crowdFund.token();
			// @ts-ignore
			expect(token).to.equal(giveChainToken.address);
		});
	});

	describe("Create campaign", () => {
		let blockNumber;
		// @ts-ignore
		let block;
		beforeEach(async () => {
			blockNumber = await ethers.provider.getBlockNumber();
			block = await ethers.provider.getBlock(blockNumber);
		});
		it("should create a new campaign with correct values", async () => {
			const campaignId = 0;
			const category = "Education";
			const location = "Port Harcourt, Nigeria";
			const goal = 100;
			const description = "We need new computers for our computer lab";
			// @ts-ignore
			const startAt = block.timestamp + 3600; // Start after an hour
			const endAt = startAt + 86400; // End after a day
			const title = "School fees";

			const [_, addr1] = await ethers.getSigners();

			// @ts-ignore
			await crowdFund
				.connect(addr1)
				.createCampaign(
					category,
					goal,
					description,
					title,
					endAt,
					location,
					campaignImageUrl
				);
			// @ts-ignore
			const campaign = await crowdFund.connect(addr1).campaigns(campaignId);

			expect(campaign.category).to.equal(category);
			expect(campaign.title).to.equal(title);
			expect(campaign.location).to.equal(location);
			expect(campaign.goal).to.equal(goal);
			expect(campaign.description).to.equal(description);
			expect(campaign.campaignImageUrl).to.equal(campaignImageUrl);
			expect(campaign.endAt).to.equal(endAt);
			// @ts-ignore
			expect(campaign.fundraiser).to.equal(addr1.address);
			expect(campaign.amountRaised).to.equal(0);
			expect(campaign.claimed).to.equal(false);
			expect(campaign.campaignId).to.equal(0);

			// @ts-ignore
			expect(await crowdFund.campaignId()).to.equal(campaignId + 1);
		});

		it("should revert if goal is zero", async () => {
			const category = "Education";
			const location = "Port Harcourt, Nigeria";
			const goal = 0;
			const description = "We need new computers for our computer lab";
			// @ts-ignore
			const startAt = block.timestamp + 3600; // Start after an hour
			const endAt = startAt + 86400; // End after a day

			// @ts-ignore
			const [_, addr1] = await ethers.getSigners();

			expect(
				// @ts-ignore
				crowdFund.createCampaign(
					category,
					goal,
					description,
					startAt,
					endAt,
					location
				)
			// @ts-ignore
			).to.be.revertedWithCustomError(crowdFund, "ErrGoalZero");
		});

		it("should revert if startAt is greater than end at", () => {
			const category = "Education";
			const location = "Port Harcourt, Nigeria";
			const goal = 0;
			const description = "We need new computers for our computer lab";
			// @ts-ignore
			const startAt = block.timestamp + 3600; // Start after an hour
			const endAt = startAt - 86400; // one day before start

			expect(
				// @ts-ignore
				crowdFund.createCampaign(
					category,
					goal,
					description,
					startAt,
					endAt,
					location
				)
			// @ts-ignore
			).to.be.revertedWithCustomError(crowdFund, "ErrEndAtBeforeStartAt");
		});

		it("should revert if endAt exceeds max raise duration", async () => {
			const category = "Education";
			const location = "Port Harcourt, Nigeria";
			const goal = 0;
			const description = "We need new computers for our computer lab";
			// @ts-ignore
			const startAt = block.timestamp + 3600; // Start after an hour

			const endAt = startAt + 111600; // 31 days after start

			expect(
				// @ts-ignore
				crowdFund.createCampaign(
					category,
					goal,
					description,
					startAt,
					endAt,
					location
				)
			// @ts-ignore
			).to.be.revertedWithCustomError(crowdFund, "ErrExceedMaxRaisedDuration");
		});
	});

	describe("Fund Campaign", () => {
		it("should fund a campaign successfully", async () => {
			const campaignId = 0;
			const category = "Education";
			const location = "Port Harcourt, Nigeria";
			const goal = 100;
			const description = "We need new computers for our computer lab";
			const startAt = Math.floor(Date.now() / 1000) + 3600; // Start after an hour
			const endAt = startAt + 86400; // End after a day

			const amount = 500;
			const tip = 50;

			// @ts-ignore
			await crowdFund.createCampaign(
				category,
				goal,
				description,
				startAt,
				endAt,
				location,
				campaignImageUrl
			);

			await ethers.provider.send("evm_increaseTime", [3600]);
			// @ts-ignore
			await ethers.provider.send("evm_mine");

			// @ts-ignore
			await crowdFund
				// @ts-ignore
				.connect(campaignFunder)
				.fundCampaign(
					campaignId,
					ethers.utils.parseEther(amount.toString()),
					ethers.utils.parseEther(tip.toString())
				);

			// @ts-ignore
			const campaign = await crowdFund.campaigns(campaignId);
			expect(
				parseInt(ethers.utils.formatEther(campaign.amountRaised))
			).to.equal(amount);

			expect(
				// @ts-ignore
				await crowdFund
					// @ts-ignore
					.connect(campaignFunder)
					.fundCampaign(
						campaignId,
						ethers.utils.parseEther(amount.toString()),
						ethers.utils.parseEther("0")
					)
			)
				// @ts-ignore
				.to.emit(crowdFund, "FundCampaign")
				// @ts-ignore
				.withArgs(campaignId, campaignFunder.address, amount, tip);

			// check if total tip is correct
			// @ts-ignore
			const totalTip = await crowdFund.totalTip();
			expect(parseInt(ethers.utils.formatEther(totalTip))).to.equal(tip);

			const totalAmountFundedByAddress =
				// @ts-ignore
				await crowdFund.amountFundedByCampaignId(
					campaignId,
					// @ts-ignore
					campaignFunder.address
				);
			expect(
				parseInt(ethers.utils.formatEther(totalAmountFundedByAddress))
			).to.equal(1000);

			// @ts-ignore
			const donors = await crowdFund.donorsByCampaignId(campaignId, 0);
			assert.equal(
				parseInt(ethers.utils.formatEther(donors[0])),
				amount,
				"incorrect donation"
			);
			assert.equal(
				donors[2],
				// @ts-ignore
				campaignFunder.address,
				"incorrect funder address"
			);
		});

		it("should revert if caller balance is insufficient", async () => {
			const campaignId = 0;
			const category = "Education";
			const location = "Port Harcourt, Nigeria";
			const goal = 100;
			const description = "We need new computers for our computer lab";
			const startAt = Math.floor(Date.now() / 1000) + 7200; // Start after 2 hours
			const endAt = startAt + 86400; // End after a day

			const amount = 50000;
			const tip = 50;

			// @ts-ignore
			await crowdFund.createCampaign(
				category,
				goal,
				description,
				startAt,
				endAt,
				location,
				campaignImageUrl
			);

			await ethers.provider.send("evm_increaseTime", [7200]);
			// @ts-ignore
			await ethers.provider.send("evm_mine");

			expect(
				// @ts-ignore
				crowdFund
					// @ts-ignore
					.connect(campaignFunder)
					.fundCampaign(
						campaignId,
						ethers.utils.parseEther(amount.toString()),
						ethers.utils.parseEther(tip.toString())
					)
			// @ts-ignore
			).to.be.revertedWithCustomError(crowdFund, "ErrInsufficientTokenBalance");
		});

		it("should revert if amount to fund a campaign is zero", async () => {
			const campaignId = 0;
			const category = "Education";
			const location = "Port Harcourt, Nigeria";
			const goal = 100;
			const description = "We need new computers for our computer lab";
			const blockNumber = await ethers.provider.getBlockNumber();
			const block = await ethers.provider.getBlock(blockNumber);
			const startAt = block.timestamp + 10800; // Start after 3 hours
			const endAt = startAt + 86400; // End after a day

			const amount = 0;
			const tip = 50;

			// @ts-ignore
			await crowdFund.createCampaign(
				category,
				goal,
				description,
				startAt,
				endAt,
				location,
				campaignImageUrl
			);

			await ethers.provider.send("evm_increaseTime", [10800]);
			// @ts-ignore
			await ethers.provider.send("evm_mine");

			expect(
				// @ts-ignore
				crowdFund
					// @ts-ignore
					.connect(campaignFunder)
					.fundCampaign(
						campaignId,
						ethers.utils.parseEther(amount.toString()),
						ethers.utils.parseEther(tip.toString())
					)
			// @ts-ignore
			).to.be.revertedWithCustomError(crowdFund, "ErrAmountZero");
		});

		it("should revert if campaign has ended started", async () => {
			const campaignId = 0;
			const category = "Education";
			const title = "School fees";
			const location = "Port Harcourt, Nigeria";
			const goal = 100;
			const description = "We need new computers for our computer lab";
			const blockNumber = await ethers.provider.getBlockNumber();
			const block = await ethers.provider.getBlock(blockNumber);
			const startAt = block.timestamp + 10800; // Start after 3 hours
			const endAt = startAt + 86400; // End after a day

			const amount = 500;
			const tip = 50;

			// @ts-ignore
			await crowdFund.createCampaign(
				category,
				goal,
				description,
				title,
				endAt,
				location,
				campaignImageUrl
			);

			await ethers.provider.send("evm_increaseTime", [172800]);
			// @ts-ignore
			await ethers.provider.send("evm_mine");

			expect(
				// @ts-ignore
				crowdFund
					// @ts-ignore
					.connect(campaignFunder)
					.fundCampaign(
						campaignId,
						ethers.utils.parseEther(amount.toString()),
						ethers.utils.parseEther(tip.toString())
					)
			// @ts-ignore
			).to.be.revertedWithCustomError(crowdFund, "ErrCampaignHasEnded");
		});
	});

	describe("Claim campaign funds", () => {
		// @ts-ignore
		let fundraiser;
		// @ts-ignore
		let anotherUser;
		const campaignId = 0;

		beforeEach(async () => {
			[fundraiser, anotherUser] = await ethers.getSigners();
			const category = "Education";
			const location = "Port Harcourt, Nigeria";
			const title = "school fees";
			const goal = 100;
			const description = "We need new computers for our computer lab";
			const blockNumber = await ethers.provider.getBlockNumber();
			const block = await ethers.provider.getBlock(blockNumber);
			const startAt = block.timestamp + 10800; // Start after 3 hours
			const endAt = startAt + 86400; // End after a day

			// @ts-ignore
			await crowdFund
				.connect(fundraiser)
				.createCampaign(
					category,
					goal,
					description,
					title,
					endAt,
					location,
					campaignImageUrl
				);
		});

		it("should allow fundraiser to claim funds", async () => {
			const campaignId = 0;

			await ethers.provider.send("evm_increaseTime", [172800]);
			// @ts-ignore
			await ethers.provider.send("evm_mine");
			// @ts-ignore
			expect(crowdFund.connect(fundraiser).claim(campaignId))
				// @ts-ignore
				.to.emit(crowdFund, "Claim")
				.withArgs(campaignId);

			// check if claim changes to true
			// @ts-ignore
			const campaign = await crowdFund.campaigns(campaignId);
			assert.equal(campaign.claimed, true, "claimed is false");
		});

		it("should revert if caller is not fundraiser", async () => {
			const campaignId = 0;
			await ethers.provider.send("evm_increaseTime", [172800]);
			// @ts-ignore
			await ethers.provider.send("evm_mine");
			expect(
				// @ts-ignore
				crowdFund.connect(anotherUser).claim(campaignId)
			// @ts-ignore
			).to.be.revertedWithCustomError(crowdFund, "ErrCallerNotFundRaiser");
		});

		it("should revert if campaign has not ended", async () => {
			expect(
				// @ts-ignore
				crowdFund.connect(fundraiser).claim(campaignId)
			// @ts-ignore
			).to.be.revertedWithCustomError(crowdFund, "ErrCallerNotFundRaiser");
		});

		it("should revert if campaign funds has been claimed", async () => {
			await ethers.provider.send("evm_increaseTime", [172800]);
			// @ts-ignore
			await ethers.provider.send("evm_mine");

			// @ts-ignore
			await crowdFund.connect(fundraiser).claim(campaignId);
			expect(
				// @ts-ignore
				crowdFund.connect(fundraiser).claim(campaignId)
			// @ts-ignore
			).to.be.revertedWithCustomError(crowdFund, "ErrClaimed");
		});

		it("should increase token of fundraiser after claim", async () => {
			const amount = 500;
			const tip = 50;

			// @ts-ignore
			const previousBalance = await giveChainToken.balanceOf(
				// @ts-ignore
				fundraiser.address
			);

			await ethers.provider.send("evm_increaseTime", [10800]);
			// await ethers.provider.send("evm_increaseTime", [172800]);
			// @ts-ignore
			await ethers.provider.send("evm_mine");

			// @ts-ignore
			await crowdFund
				// @ts-ignore
				.connect(campaignFunder)
				.fundCampaign(
					campaignId,
					ethers.utils.parseEther(amount.toString()),
					ethers.utils.parseEther(tip.toString())
				);

			await ethers.provider.send("evm_increaseTime", [172800]);
			// @ts-ignore
			await ethers.provider.send("evm_mine");

			// @ts-ignore
			await crowdFund.connect(fundraiser).claim(campaignId);
			// @ts-ignore
			const currentBalance = await giveChainToken.balanceOf(fundraiser.address);
			expect(parseInt(ethers.utils.formatEther(currentBalance))).to.equal(
				parseInt(ethers.utils.formatEther(previousBalance)) +
					parseInt(ethers.utils.formatEther(currentBalance))
			);
		});
	});

	describe("Withdrawal of tips", () => {
		let fundraiser;
		const campaignId = 0;

		beforeEach(async () => {
			[fundraiser] = await ethers.getSigners();
			const category = "Education";
			const title = "school fees";
			const location = "Port Harcourt, Nigeria";
			const goal = 100;
			const description = "We need new computers for our computer lab";
			const blockNumber = await ethers.provider.getBlockNumber();
			const block = await ethers.provider.getBlock(blockNumber);
			const startAt = block.timestamp + 10800; // Start after 3 hours
			const endAt = startAt + 86400; // End after a day

			const amount = 100;
			const tip = 50;

			// @ts-ignore
			await crowdFund
				.connect(fundraiser)
				.createCampaign(
					category,
					goal,
					description,
					title,
					endAt,
					location,
					campaignImageUrl
				);

			await ethers.provider.send("evm_increaseTime", [10800]);
			// @ts-ignore
			await ethers.provider.send("evm_mine");

			// @ts-ignore
			await crowdFund
				// @ts-ignore
				.connect(campaignFunder)
				.fundCampaign(
					campaignId,
					ethers.utils.parseEther(amount.toString()),
					ethers.utils.parseEther(tip.toString())
				);
		});

		it("should allow owner withdraw tips", async () => {
			// @ts-ignore
			const prevBalance = await giveChainToken.balanceOf(crowdFund.address);

			// @ts-ignore
			await crowdFund.connect(owner).withdrawTips();

			// @ts-ignore
			const currentTotalTip = await crowdFund.totalTip();

			// @ts-ignore
			const currentBalance = await giveChainToken.balanceOf(crowdFund.address);
			const calculatedCurrentBalance =
				parseInt(ethers.utils.formatEther(prevBalance)) -
				parseInt(ethers.utils.formatEther(currentTotalTip));

			assert.equal(
				parseInt(ethers.utils.formatEther(currentBalance)),
				calculatedCurrentBalance,
				"incorrect token balance"
			);
		});
	});


	describe("Get Campaigns", async () => {
		const campaign1 = {
			category: "Education",
			location: "Port Harcourt, Nigeria",
			goal: 100,
			description: "We need new computers for our computer lab",
			title: "school fees"
			// startAt: block.timestamp + 10800, // Start after 3 hours
			// endAt: startAt + 86400, // End after a day
		};

		const campaign2 = {
			category: "Natural Distasters",
			location: "Bayelsa, Nigeria",
			goal: 5000,
			description: "Funds have destoryed farm lands",
			title: "scholarship needed"
			// startAt: block.timestamp + 3600, // Start after 1 hour
			// endAt: startAt + 86400, // End after a day
		};

		it("should return an empty array when no campaigns have been added", async () => {
			// @ts-ignore
			const allCampaigns = await crowdFund.getCampaigns();
			assert.deepEqual(allCampaigns, []);
		});

		it("should return the correct number of campaigns", async () => {
			const blockNumber = await ethers.provider.getBlockNumber();
			const block = await ethers.provider.getBlock(blockNumber);

			// @ts-ignore
			await crowdFund.createCampaign(
				campaign1.category,
				campaign1.goal,
				campaign1.description,
				campaign1.title,
				block.timestamp + 3600 + 86400,
				campaign1.location,
				campaignImageUrl
			);
			// @ts-ignore
			await crowdFund.createCampaign(
				campaign2.category,
				campaign2.goal,
				campaign2.description,
				campaign2.title,
				block.timestamp + 10800 + 86400,
				campaign2.location,
				campaignImageUrl
			);

			// @ts-ignore
			const allCampaigns = await crowdFund.getCampaigns();
			assert.equal(allCampaigns.length, 2);
		});

		it("should be callable by anyone", async () => {
			// @ts-ignore
			const allCampaigns = await crowdFund.getCampaigns({
				// @ts-ignore
				from: await (await ethers.getSigner()).address
			});
			assert.deepEqual(allCampaigns, []);
		});
	});

	describe("Get donors of a campaign", () => {
		const campaignId = 0;

		const amount1 = 100;
		const amount2 = 200;
		const amount3 = 300;
		const tip = 50;

		beforeEach(async () => {
			// @ts-ignore
			[fundraiser, donor1, donor2, donor3] = await ethers.getSigners();

			// mint 10,000 tokens to donors
			// @ts-ignore
			await giveChainToken.connect(donor1).mint();
			// @ts-ignore
			await giveChainToken.connect(donor2).mint();
			// @ts-ignore
			await giveChainToken.connect(donor3).mint();

			// approve CrowdFund to spend campaignFunder tokens
			// @ts-ignore
			await giveChainToken
				// @ts-ignore
				.connect(donor1)
				// @ts-ignore
				.approve(crowdFund.address, ethers.utils.parseEther("5000"));

			// @ts-ignore
			await giveChainToken
				// @ts-ignore
				.connect(donor2)
				// @ts-ignore
				.approve(crowdFund.address, ethers.utils.parseEther("5000"));

			// @ts-ignore
			await giveChainToken
				// @ts-ignore
				.connect(donor3)
				// @ts-ignore
				.approve(crowdFund.address, ethers.utils.parseEther("5000"));

			const blockNumber = await ethers.provider.getBlockNumber();
			const block = await ethers.provider.getBlock(blockNumber);
			const _startAt = block.timestamp + 10800;

			const campaign = {
				category: "Education",
				location: "Port Harcourt, Nigeria",
				title: "school fees",
				goal: 100,
				description: "We need new computers for our computer lab",
				startAt: _startAt, // Start after 3 hours
				endAt: _startAt + 86400, // End after a day
				campaignImageUrl
			};

			// @ts-ignore
			await crowdFund.createCampaign(
				campaign.category,
				campaign.goal,
				campaign.description,
				campaign.title,
				campaign.endAt,
				campaign.location,
				campaign.campaignImageUrl
			);

			// @ts-ignore
			await crowdFund.createCampaign(
				campaign.category,
				campaign.goal,
				campaign.description,
				campaign.title,
				campaign.endAt,
				campaign.location,
				campaign.campaignImageUrl
			);

			await ethers.provider.send("evm_increaseTime", [10800]);
			// @ts-ignore
			await ethers.provider.send("evm_mine");

			// @ts-ignore
			await crowdFund
				// @ts-ignore
				.connect(donor1)
				.fundCampaign(
					campaignId,
					ethers.utils.parseEther(amount1.toString()),
					ethers.utils.parseEther(tip.toString())
				);

			// @ts-ignore
			await crowdFund
				// @ts-ignore
				.connect(donor2)
				.fundCampaign(
					campaignId,
					ethers.utils.parseEther(amount2.toString()),
					ethers.utils.parseEther(tip.toString())
				);

			// @ts-ignore
			await crowdFund
				// @ts-ignore
				.connect(donor3)
				.fundCampaign(
					campaignId,
					ethers.utils.parseEther(amount3.toString()),
					ethers.utils.parseEther(tip.toString())
				);
		});

		it("should return an empty array when a campaign has no donors", async () => {
			const campaignId1 = 1;

			// @ts-ignore
			const donors = await crowdFund.getDonors(campaignId1);
			assert.deepEqual(donors, []);
		});

		it("should return the correct values of the donor array", async () => {
			it("should return the correct values of the donor array", async () => {
				// @ts-ignore
				const donors = await crowdFund.getDonors(campaignId);

				// @ts-ignore
				assert.equal(ethers.utils.formatEther(donors[0][0]), amount1);
				// @ts-ignore
				assert.equal(donors[0][2], donor1.address);
			});

			it("should return the correct number of donors for a campaign", async () => {
				// @ts-ignore
				const donors = await crowdFund.getDonors(campaignId);
				assert.equal(donors.length, 3);
			});

			it("should be callable by anyone", async () => {
				// @ts-ignore
				const donors = await crowdFund.getDonors(campaignId, {
					// @ts-ignore
					from: await (await ethers.getSigner()).address
				});
				assert.equal(donors.length, 3);
			});
		});

		describe("Create word of support", () => {
			let blockNumber;
			let block;
			// @ts-ignore
			let fundraiser;
			// @ts-ignore
			let donorX;
			// @ts-ignore
			let donorY;

			const campaignId = 0;

			const amount1 = 100;
			const amount2 = 200;

			const supportWord1 = "Get well soon";
			const supportWord2 = "Keep up the ggod work";

			const tip = 50;

			beforeEach(async () => {
				[fundraiser, donorX, donorY] = await ethers.getSigners();

				blockNumber = await ethers.provider.getBlockNumber();
				block = await ethers.provider.getBlock(blockNumber);
				const _startAt = block.timestamp + 10800; // Start after 3 hours

				const campaign = {
					category: "Education",
					location: "Port Harcourt, Nigeria",
					title: "school fees",
					goal: 100,
					description: "We need new computers for our computer lab",
					startAt: _startAt,
					endAt: _startAt + 86400 // End after a day
				};

				// @ts-ignore
				await crowdFund.createCampaign(
					campaign.category,
					campaign.goal,
					campaign.description,
					campaign.title,
					campaign.endAt,
					campaign.location,
					campaignImageUrl
				);

				await ethers.provider.send("evm_increaseTime", [10800]);
				// @ts-ignore
				await ethers.provider.send("evm_mine");

				// @ts-ignore
				await crowdFund
					.connect(donorX)
					.fundCampaign(
						campaignId,
						ethers.utils.parseEther(amount1.toString()),
						ethers.utils.parseEther(tip.toString())
					);
			});

			it("should revert if campaign has ended", async () => {
				await ethers.provider.send("evm_increaseTime", [10800 + 86400]);
				// @ts-ignore
				await ethers.provider.send("evm_mine");

				expect(
					// @ts-ignore
					crowdFund
						// @ts-ignore
						.connect(donorX)
						.createWordOfSupport(campaignId, supportWord1)
				// @ts-ignore
				).to.be.revertedWithCustomError(crowdFund, "ErrCampaignHasEnded");
			});

			it("should revert if caller has not donated to the campaign", async () => {
				expect(
					// @ts-ignore
					crowdFund
						// @ts-ignore
						.connect(donorY)
						.createWordOfSupport(campaignId, supportWord1)
				// @ts-ignore
				).to.be.revertedWithCustomError(crowdFund, "ErrCallerNotDonor");
			});

			it("should create words of support succesfully", async () => {
				// mint 10,000 tokens to donorY
				// @ts-ignore
				await giveChainToken.connect(donorY).mint();

				// approve CrowdFund to spend campaignFunder tokens
				// @ts-ignore
				await giveChainToken
					// @ts-ignore
					.connect(donorY)
					// @ts-ignore
					.approve(crowdFund.address, ethers.utils.parseEther("5000"));

				// @ts-ignore
				await crowdFund
					// @ts-ignore
					.connect(donorY)
					.fundCampaign(
						campaignId,
						ethers.utils.parseEther(amount2.toString()),
						ethers.utils.parseEther(tip.toString())
					);

				// @ts-ignore
				const tx = await crowdFund
					// @ts-ignore
					.connect(donorY)
					.createWordOfSupport(campaignId, supportWord2);

				// Verify that the event was emitted with the correct arguments
				expect(tx)
					// @ts-ignore
					.to.emit(crowdFund, "CreateWordOfSupport")
					.withArgs(campaignId);

				// @ts-ignore
				const supportWords = await crowdFund.getWordsOfSupport(campaignId);

				assert.deepEqual(supportWords[0][0], supportWord2);
			});
		});
	});
});
