// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

/// @dev goal of campaign is zero
error ErrGoalZero();

/// @dev end time of a campaign is before start time
error ErrEndAtBeforeStartAt();

/// @dev end time of a campaign is before start time
error ErrExceedMaxRaisedDuration();


/// @dev endAt is before current block stamp
error ErrCampaignHasEnded();

/// @dev amount to fund a campaign is zero
error ErrAmountZero();

/// @dev insufficient token balance
error ErrInsufficientTokenBalance();

/// @dev funds has been claimed
error ErrClaimed();

/// @dev caller is not fundraiser
error ErrCallerNotFundRaiser();

/// @dev caller is not fundraiser
error ErrCampaignHasNotEnded();

/// @dev caller is not owner
error ErrCallerNotOwner();

/// @dev caller is not owner
error ErrCallerNotDonor();