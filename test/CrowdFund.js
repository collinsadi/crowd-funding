const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFund", () => {
	let crowdFund;
	let giveChainToken;
	let owner;
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
		await giveChainToken.connect(campaignFunder).mint();
		// approve CrowdFund to spend campaignFunder tokens
		await giveChainToken
			.connect(campaignFunder)
			.approve(crowdFund.address, ethers.utils.parseEther("5000"));
	});

	describe("Deployment", () => {
		it("token address is same as token smart contract address", async () => {
			const token = await crowdFund.token();
			expect(token).to.equal(giveChainToken.address);
		});
	});

	describe("Create campaign", () => {
		let blockNumber;
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
			const startAt = block.timestamp + 3600; // Start after an hour
			const endAt = startAt + 86400; // End after a day
			const title = "School fees";

			const [_, addr1] = await ethers.getSigners();

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
			const campaign = await crowdFund.connect(addr1).campaigns(campaignId);

			expect(campaign.category).to.equal(category);
			expect(campaign.title).to.equal(title);
			expect(campaign.location).to.equal(location);
			expect(campaign.goal).to.equal(goal);
			expect(campaign.description).to.equal(description);
			expect(campaign.campaignImageUrl).to.equal(campaignImageUrl);
			expect(campaign.endAt).to.equal(endAt);
			expect(campaign.fundraiser).to.equal(addr1.address);
			expect(campaign.amountRaised).to.equal(0);
			expect(campaign.claimed).to.equal(false);
			expect(campaign.campaignId).to.equal(0);

			expect(await crowdFund.campaignId()).to.equal(campaignId + 1);
		});

		it("should revert if goal is zero", async () => {
			const category = "Education";
			const location = "Port Harcourt, Nigeria";
			const goal = 0;
			const description = "We need new computers for our computer lab";
			const startAt = block.timestamp + 3600; // Start after an hour
			const endAt = startAt + 86400; // End after a day

			const [_, addr1] = await ethers.getSigners();

			expect(
				crowdFund.createCampaign(
					category,
					goal,
					description,
					startAt,
					endAt,
					location
				)
			).to.be.revertedWithCustomError(crowdFund, "ErrGoalZero");
		});

		it("should revert if startAt is greater than end at", () => {
			const category = "Education";
			const location = "Port Harcourt, Nigeria";
			const goal = 0;
			const description = "We need new computers for our computer lab";
			const startAt = block.timestamp + 3600; // Start after an hour
			const endAt = startAt - 86400; // one day before start

			expect(
				crowdFund.createCampaign(
					category,
					goal,
					description,
					startAt,
					endAt,
					location
				)
			).to.be.revertedWithCustomError(crowdFund, "ErrEndAtBeforeStartAt");
		});

		it("should revert if endAt exceeds max raise duration", async () => {
			const category = "Education";
			const location = "Port Harcourt, Nigeria";
			const goal = 0;
			const description = "We need new computers for our computer lab";
			const startAt = block.timestamp + 3600; // Start after an hour

			const endAt = startAt + 111600; // 31 days after start

			expect(
				crowdFund.createCampaign(
					category,
					goal,
					description,
					startAt,
					endAt,
					location
				)
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
			await ethers.provider.send("evm_mine");

			await crowdFund
				.connect(campaignFunder)
				.fundCampaign(
					campaignId,
					ethers.utils.parseEther(amount.toString()),
					ethers.utils.parseEther(tip.toString())
				);

			const campaign = await crowdFund.campaigns(campaignId);
			expect(
				parseInt(ethers.utils.formatEther(campaign.amountRaised))
			).to.equal(amount);

			expect(
				await crowdFund
					.connect(campaignFunder)
					.fundCampaign(
						campaignId,
						ethers.utils.parseEther(amount.toString()),
						ethers.utils.parseEther("0")
					)
			)
				.to.emit(crowdFund, "FundCampaign")
				.withArgs(campaignId, campaignFunder.address, amount, tip);

			// check if total tip is correct
			const totalTip = await crowdFund.totalTip();
			expect(parseInt(ethers.utils.formatEther(totalTip))).to.equal(tip);

			const totalAmountFundedByAddress =
				await crowdFund.amountFundedByCampaignId(
					campaignId,
					campaignFunder.address
				);
			expect(
				parseInt(ethers.utils.formatEther(totalAmountFundedByAddress))
			).to.equal(1000);

			const donors = await crowdFund.donorsByCampaignId(campaignId, 0);
			assert.equal(
				parseInt(ethers.utils.formatEther(donors[0])),
				amount,
				"incorrect donation"
			);
			assert.equal(
				donors[2],
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
			await ethers.provider.send("evm_mine");

			expect(
				crowdFund
					.connect(campaignFunder)
					.fundCampaign(
						campaignId,
						ethers.utils.parseEther(amount.toString()),
						ethers.utils.parseEther(tip.toString())
					)
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
			await ethers.provider.send("evm_mine");

			expect(
				crowdFund
					.connect(campaignFunder)
					.fundCampaign(
						campaignId,
						ethers.utils.parseEther(amount.toString()),
						ethers.utils.parseEther(tip.toString())
					)
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
			await ethers.provider.send("evm_mine");

			expect(
				crowdFund
					.connect(campaignFunder)
					.fundCampaign(
						campaignId,
						ethers.utils.parseEther(amount.toString()),
						ethers.utils.parseEther(tip.toString())
					)
			).to.be.revertedWithCustomError(crowdFund, "ErrCampaignHasEnded");
		});
	});

	describe("Claim campaign funds", () => {
		let fundraiser;
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
			await ethers.provider.send("evm_mine");
			expect(crowdFund.connect(fundraiser).claim(campaignId))
				.to.emit(crowdFund, "Claim")
				.withArgs(campaignId);

			// check if claim changes to true
			const campaign = await crowdFund.campaigns(campaignId);
			assert.equal(campaign.claimed, true, "claimed is false");
		});

		it("should revert if caller is not fundraiser", async () => {
			const campaignId = 0;
			await ethers.provider.send("evm_increaseTime", [172800]);
			await ethers.provider.send("evm_mine");
			expect(
				crowdFund.connect(anotherUser).claim(campaignId)
			).to.be.revertedWithCustomError(crowdFund, "ErrCallerNotFundRaiser");
		});

		it("should revert if campaign has not ended", async () => {
			expect(
				crowdFund.connect(fundraiser).claim(campaignId)
			).to.be.revertedWithCustomError(crowdFund, "ErrCallerNotFundRaiser");
		});

		it("should revert if campaign funds has been claimed", async () => {
			await ethers.provider.send("evm_increaseTime", [172800]);
			await ethers.provider.send("evm_mine");

			await crowdFund.connect(fundraiser).claim(campaignId);
			expect(
				crowdFund.connect(fundraiser).claim(campaignId)
			).to.be.revertedWithCustomError(crowdFund, "ErrClaimed");
		});

		it("should increase token of fundraiser after claim", async () => {
			const amount = 500;
			const tip = 50;

			const previousBalance = await giveChainToken.balanceOf(
				fundraiser.address
			);

			await ethers.provider.send("evm_increaseTime", [10800]);
			// await ethers.provider.send("evm_increaseTime", [172800]);
			await ethers.provider.send("evm_mine");

			await crowdFund
				.connect(campaignFunder)
				.fundCampaign(
					campaignId,
					ethers.utils.parseEther(amount.toString()),
					ethers.utils.parseEther(tip.toString())
				);

			await ethers.provider.send("evm_increaseTime", [172800]);
			await ethers.provider.send("evm_mine");

			await crowdFund.connect(fundraiser).claim(campaignId);
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
			await ethers.provider.send("evm_mine");

			await crowdFund
				.connect(campaignFunder)
				.fundCampaign(
					campaignId,
					ethers.utils.parseEther(amount.toString()),
					ethers.utils.parseEther(tip.toString())
				);
		});

		it("should allow owner withdraw tips", async () => {
			const prevBalance = await giveChainToken.balanceOf(crowdFund.address);

			await crowdFund.connect(owner).withdrawTips();

			const currentTotalTip = await crowdFund.totalTip();

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
			const allCampaigns = await crowdFund.getCampaigns();
			assert.deepEqual(allCampaigns, []);
		});

		it("should return the correct number of campaigns", async () => {
			const blockNumber = await ethers.provider.getBlockNumber();
			const block = await ethers.provider.getBlock(blockNumber);

			await crowdFund.createCampaign(
				campaign1.category,
				campaign1.goal,
				campaign1.description,
				campaign1.title,
				block.timestamp + 3600 + 86400,
				campaign1.location,
				campaignImageUrl
			);
			await crowdFund.createCampaign(
				campaign2.category,
				campaign2.goal,
				campaign2.description,
				campaign2.title,
				block.timestamp + 10800 + 86400,
				campaign2.location,
				campaignImageUrl
			);

			const allCampaigns = await crowdFund.getCampaigns();
			assert.equal(allCampaigns.length, 2);
		});

		it("should be callable by anyone", async () => {
			const allCampaigns = await crowdFund.getCampaigns({
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
			[fundraiser, donor1, donor2, donor3] = await ethers.getSigners();

			// mint 10,000 tokens to donors
			await giveChainToken.connect(donor1).mint();
			await giveChainToken.connect(donor2).mint();
			await giveChainToken.connect(donor3).mint();

			// approve CrowdFund to spend campaignFunder tokens
			await giveChainToken
				.connect(donor1)
				.approve(crowdFund.address, ethers.utils.parseEther("5000"));

			await giveChainToken
				.connect(donor2)
				.approve(crowdFund.address, ethers.utils.parseEther("5000"));

			await giveChainToken
				.connect(donor3)
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

			await crowdFund.createCampaign(
				campaign.category,
				campaign.goal,
				campaign.description,
				campaign.title,
				campaign.endAt,
				campaign.location,
				campaign.campaignImageUrl
			);

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
			await ethers.provider.send("evm_mine");

			await crowdFund
				.connect(donor1)
				.fundCampaign(
					campaignId,
					ethers.utils.parseEther(amount1.toString()),
					ethers.utils.parseEther(tip.toString())
				);

			await crowdFund
				.connect(donor2)
				.fundCampaign(
					campaignId,
					ethers.utils.parseEther(amount2.toString()),
					ethers.utils.parseEther(tip.toString())
				);

			await crowdFund
				.connect(donor3)
				.fundCampaign(
					campaignId,
					ethers.utils.parseEther(amount3.toString()),
					ethers.utils.parseEther(tip.toString())
				);
		});

		it("should return an empty array when a campaign has no donors", async () => {
			const campaignId1 = 1;

			const donors = await crowdFund.getDonors(campaignId1);
			assert.deepEqual(donors, []);
		});

		it("should return the correct values of the donor array", async () => {
			it("should return the correct values of the donor array", async () => {
				const donors = await crowdFund.getDonors(campaignId);

				assert.equal(ethers.utils.formatEther(donors[0][0]), amount1);
				assert.equal(donors[0][2], donor1.address);
			});

			it("should return the correct number of donors for a campaign", async () => {
				const donors = await crowdFund.getDonors(campaignId);
				assert.equal(donors.length, 3);
			});

			it("should be callable by anyone", async () => {
				const donors = await crowdFund.getDonors(campaignId, {
					from: await (await ethers.getSigner()).address
				});
				assert.equal(donors.length, 3);
			});
		});

		describe("Create word of support", () => {
			let blockNumber;
			let block;
			let fundraiser;
			let donorX;
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
				await ethers.provider.send("evm_mine");

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
				await ethers.provider.send("evm_mine");

				expect(
					crowdFund
						.connect(donorX)
						.createWordOfSupport(campaignId, supportWord1)
				).to.be.revertedWithCustomError(crowdFund, "ErrCampaignHasEnded");
			});

			it("should revert if caller has not donated to the campaign", async () => {
				expect(
					crowdFund
						.connect(donorY)
						.createWordOfSupport(campaignId, supportWord1)
				).to.be.revertedWithCustomError(crowdFund, "ErrCallerNotDonor");
			});

			it("should create words of support succesfully", async () => {
				// mint 10,000 tokens to donorY
				await giveChainToken.connect(donorY).mint();

				// approve CrowdFund to spend campaignFunder tokens
				await giveChainToken
					.connect(donorY)
					.approve(crowdFund.address, ethers.utils.parseEther("5000"));

				await crowdFund
					.connect(donorY)
					.fundCampaign(
						campaignId,
						ethers.utils.parseEther(amount2.toString()),
						ethers.utils.parseEther(tip.toString())
					);

				const tx = await crowdFund
					.connect(donorY)
					.createWordOfSupport(campaignId, supportWord2);

				// Verify that the event was emitted with the correct arguments
				expect(tx)
					.to.emit(crowdFund, "CreateWordOfSupport")
					.withArgs(campaignId);

				const supportWords = await crowdFund.getWordsOfSupport(campaignId);

				assert.deepEqual(supportWords[0][0], supportWord2);
			});
		});
	});
});
