// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title GiveChain Token 
/// @author Rapture Chijioke Godson
/// @notice This contract is used for as a token for the GiveChain DApp.
/// @dev the mint function mints 10,000 tokens to msg.sender

contract GiveChainToken is ERC20, Ownable {
    constructor () ERC20("GiveChain", "GCT"){

    }
    function mint()  external {
        _mint(msg.sender, 10000 * 10 ** uint(decimals()));
    }
}