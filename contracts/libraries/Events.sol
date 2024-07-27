// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

library Events {
        event CreateCampaign(
        uint indexed _id,
        address indexed fundraiser,
        uint goal,
        uint createdAt,
        uint endAt
        );

        event FundCampaign(
        uint indexed _id,
        address indexed donor,
        uint amount,
        uint tip
        );

        event Claim(
        uint indexed _id
        );

        event WithdrawTips(
                uint value
        );

        event CancelCampaign(
                uint indexed _id
        );
        event CreateWordOfSupport(
                uint indexed _id
        );

        event CreateCampaignUpdate(uint indexed CreateCampaignUpdate);

}