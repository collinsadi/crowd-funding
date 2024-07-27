// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

library DataTypes {
    struct CampaignUpdate {
        string description;
        uint timestamp;
    }

    struct Campaign {
        string title;
        uint campaignId;
        uint createdAt;
        uint endAt;
        string category;
        address fundraiser;
        uint goal;
        uint amountRaised;
        bool claimed;
        string description;
        string location;
        string campaignImageUrl;
    }

    struct WordsOfSupport {
        string supportWord;
        uint timestamp;
        address donor;
    }

    struct Donor{
        uint amount;
        uint timestamp;
        address donorAddress;
    }
}