// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {Events} from "./libraries/Events.sol";
import {DataTypes} from "./libraries/DataTypes.sol";
import {Constants} from "./libraries/Constants.sol";
import {
    ErrGoalZero,
    ErrEndAtBeforeStartAt,
    ErrExceedMaxRaisedDuration,
    ErrCampaignHasEnded,
    ErrAmountZero,
    ErrInsufficientTokenBalance,
    ErrClaimed,
    ErrCallerNotFundRaiser,
    ErrCampaignHasNotEnded,
    ErrCallerNotOwner,
    ErrCallerNotDonor
    } from "./libraries/Error.sol";

contract CrowdFund is Ownable{
    using Counters for Counters.Counter;
    using SafeERC20 for IERC20;
    IERC20 public immutable token;
    Counters.Counter public campaignId;

    uint public totalTip;

    mapping (uint => DataTypes.Campaign) public campaigns;
    mapping (uint => DataTypes.WordsOfSupport[]) public wordsOfSupport;
    mapping (uint => DataTypes.CampaignUpdate[]) public campaignUpdates;
    mapping (uint => mapping (address => uint)) public amountFundedByCampaignId;
    mapping (uint => DataTypes.Donor[]) public donorsByCampaignId;

    constructor(address _address) {
        token = IERC20(_address);
    }

    function createCampaign(string calldata _category, uint _goal,string calldata _description, string memory _title, uint _endAt, string calldata _location,string calldata _campaignImageUrl ) external  {

        // check if goal of campaign is zero
        if (_goal <= 0) revert ErrGoalZero();


        // check if endAt is before createAt
        if(_endAt < block.timestamp) revert ErrEndAtBeforeStartAt();

        // check if endAt exceed max raise duration
        if (_endAt >= block.timestamp + Constants.MAX_RAISE_DURATION) revert ErrExceedMaxRaisedDuration();

        uint newCampaignId = campaignId.current();
        campaigns[newCampaignId] = DataTypes.Campaign({
            campaignId: newCampaignId,
            createdAt: block.timestamp,
            endAt: _endAt,
            category: _category,
            fundraiser: msg.sender,
            goal: _goal, 
            amountRaised: 0,
            claimed: false,
            description: _description,
            location: _location,
            campaignImageUrl: _campaignImageUrl,
            title: _title
        });

        campaignId.increment();
        emit Events.CreateCampaign(newCampaignId,msg.sender, _goal, block.timestamp, _endAt );
    }

    function fundCampaign(uint _campaignId, uint _amount, uint tip)  external {
        DataTypes.Campaign storage campaign = campaigns[_campaignId];

        // check if campaign has ended
        if (campaign.endAt <= block.timestamp) revert ErrCampaignHasEnded();

        // check if fund amount is zero
        if(_amount <= 0) revert ErrAmountZero();

        // check if caller balance is sufficient
        if(token.balanceOf(msg.sender) <= _amount) revert ErrInsufficientTokenBalance();

        campaign.amountRaised += _amount;
        amountFundedByCampaignId[_campaignId][msg.sender] += _amount;
        totalTip += tip;
        donorsByCampaignId[_campaignId].push(DataTypes.Donor({
            amount: _amount,
            timestamp: block.timestamp,
            donorAddress: msg.sender
        }));

        token.safeTransferFrom(msg.sender, address(this), _amount + tip);

        emit Events.FundCampaign(_campaignId,msg.sender,_amount,tip);
    }

    function claim(uint _campaignId)  external {
        DataTypes.Campaign storage campaign = campaigns[_campaignId];

        // check if msg.sender is caller
        if (msg.sender != campaign.fundraiser) revert ErrCallerNotFundRaiser();
        
         // check if campaign has not ended
        if (block.timestamp < campaign.endAt  ) revert ErrCampaignHasNotEnded();
        
        // check if funded amount has been claimed
        if(campaign.claimed) revert ErrClaimed();

        campaign.claimed = true;

        token.safeTransfer(msg.sender,campaign.amountRaised);

        emit Events.Claim(_campaignId);
    }

    function withdrawTips() external onlyOwner {
        if(owner() != msg.sender) revert ErrCallerNotOwner();
        token.safeTransfer(msg.sender,totalTip);

        emit Events.WithdrawTips(totalTip);
    }

    function getCampaigns() external view returns (DataTypes.Campaign[] memory) {
        uint campaignCount = campaignId.current();
        DataTypes.Campaign[] memory  allCampaigns = new DataTypes.Campaign[](campaignCount);
        for (uint i = 0; i < campaignCount; i++) {
            DataTypes.Campaign memory currentCampaign = campaigns[i];
            allCampaigns[i] = currentCampaign;
        }
        return allCampaigns;
    }

    function getDonors(uint _campaignId)  external view returns (DataTypes.Donor[] memory) {
        DataTypes.Donor[] memory donors = donorsByCampaignId[_campaignId];
        return donors;
    }

    function createCampaignUpdate(uint _campaignId, string calldata _description) external {
        DataTypes.Campaign memory campaign = campaigns[_campaignId];


        // check if msg.sender is caller
        if (msg.sender != campaign.fundraiser) revert ErrCallerNotFundRaiser();

        // check if campaign has ended
        if (campaign.endAt <= block.timestamp) revert ErrCampaignHasEnded();


         DataTypes.CampaignUpdate[] storage campaignUpdate = campaignUpdates[_campaignId];

         campaignUpdate.push(DataTypes.CampaignUpdate({
            description: _description,
            timestamp: block.timestamp
        }));

        emit Events.CreateCampaignUpdate(_campaignId);
    }

    function getCampaignUpdate(uint _campaignId) external view  returns (DataTypes.CampaignUpdate[] memory) {
        DataTypes.CampaignUpdate[] memory updates = campaignUpdates[_campaignId];
        return updates;
    }

    function createWordOfSupport(uint _campaignId, string calldata _supportWord) external {
            DataTypes.Campaign memory campaign = campaigns[_campaignId];


        // check if campaign has ended
        if (campaign.endAt <= block.timestamp) revert ErrCampaignHasEnded();

            
        // check if caller has donated to a campaign
        if(!containsDonor(_campaignId, msg.sender)) revert ErrCallerNotDonor();
 
 
        wordsOfSupport[_campaignId].push(DataTypes.WordsOfSupport({
            supportWord: _supportWord,
            timestamp: block.timestamp,
            donor: msg.sender
        }));

        emit Events.CreateWordOfSupport(_campaignId);

    }

    function getWordsOfSupport(uint _campaignId) external view returns (DataTypes.WordsOfSupport[] memory) {
        return wordsOfSupport[_campaignId];
    }

    function containsDonor(uint _campaignId, address _donorAddress) private view returns (bool) {
        DataTypes.Donor[] memory donors = donorsByCampaignId[_campaignId];
        for (uint i = 0; i < donors.length; i++) {
            if (donors[i].donorAddress == _donorAddress ) {
                return true;
            }
        }
        return false;
    }

}
