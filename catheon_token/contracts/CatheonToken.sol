// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// Catheon token
/// @dev The ownable, upgradeable ERC20 contract
/// - Will not override Ownable functions to checking ownership (Ownership can not be renounced)
contract CatheonToken is ERC20Upgradeable, OwnableUpgradeable {
    // service addresses
    mapping(address => bool) public services;
    // max total supply limit 10_000_000_000 * DECIMAL
    uint256 public maxSupply;
    // treasury address
    address private _treasury;
    // token-transfer fee percentage
    uint16 private _feePercent;
    // mint flag
    bool private paused;
    // fee percentage division
    uint16 private constant PERCENTAGE_DIVISION = 1000;

    event SetPaused(bool status);
    event SetTreasury(address treasury);
    event SetService(address service, bool enable);
    event SetFeePercent(uint16 percentage);
    event SetMaxSupply(uint256 supply);

    /// @dev constructor
    /// @param name_ Token name
    /// @param symbol_ Token symbol
    /// @param initialBalance_ Initial token balance of deployer
    /// @param treasury_ Treasury address receiving fee
    function initialize(
        string memory name_,
        string memory symbol_,
        uint256 initialBalance_,
        address treasury_
    ) public initializer {
        require(name_.length > 0, "Empty Name");
        require(symbol_.length > 2 && symbol_.length < 12, "Invalid symbol");
        require(initialBalance_ <= 1e19 && initialBalance_ > 0, "Invalid initial balance");
        require(treasury_ != address(0), "Zero Treasury Address");

        _treasury = treasury_;
        services[msg.sender] = true;

        /// default max supply 10_000_000_000 * (10 ** decimals)
        maxSupply = 1e19;
        /// default fee percentage (5%)
        _feePercent = 50;

        _mint(msg.sender, initialBalance_);

        /// initialize ERC20
        __ERC20_init(name_, symbol_);
        /// initialize Ownable
        __Ownable_init();
    }

    /// @dev mint token by owner
    /// @param account Target address
    /// @param amount Mint amount
    function mint(address account, uint256 amount) external onlyOwner {
        require(!paused, "Mint Unavailable");

        _mint(account, amount);
    }

    /// @dev token decimals
    function decimals() public pure override returns (uint8) {
        return 9;
    }

    /// @dev internal transfer token
    /// @param sender From address
    /// @param recipient To address
    /// @param amount Token amount
    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal override {
        uint256 receiveAmount = amount;
        address treasuryAddress = _treasury;

        if (
            services[sender] != true &&
            sender != treasuryAddress &&
            services[recipient] != true &&
            recipient != treasuryAddress
        ) {
            uint256 feeAmount = (amount * _feePercent) / PERCENTAGE_DIVISION;
            receiveAmount = amount - feeAmount;

            // feeAmount can not be zero in here
            ERC20Upgradeable._transfer(sender, treasuryAddress, feeAmount);
        }

        ERC20Upgradeable._transfer(sender, recipient, receiveAmount);
    }

    /// @dev Set new treasury address by owner
    /// @param to Target address
    function setTreasury(address to) external onlyOwner {
        require(
            to != address(0) && to != _treasury,
            "Invalid Treasury Address"
        );

        _treasury = to;

        emit SetTreasury(to);
    }

    /// @dev Set service address by owner
    /// @param service Service address
    /// @param enable Flag (true: set, false: unset)
    function setService(address service, bool enable) external onlyOwner {
        require(services[service] != enable, "Already Set");

        services[service] = enable;

        emit SetService(service, enable);
    }

    /// @dev Set fee percentage by owner
    /// @param percentage Fee percentage
    function setFee(uint16 percentage) external onlyOwner {
        require(percentage != 0 && percentage <= 900, "Invalid Fee Percentage");
        require(_feePercent != percentage, "Same Fee Percentage");

        _feePercent = percentage;

        emit SetFeePercent(percentage);
    }

    /// @dev get current fee percentage
    function fee() external view returns (uint16) {
        return _feePercent;
    }

    /// @dev get current treasury address
    function treasury() external view returns (address) {
        return _treasury;
    }

    /// @dev get the status whether token can be minted or not.
    function isPaused() external view returns (bool) {
        return paused;
    }

    /// @dev Set pause flag of minting by owner
    /// @param to Paused flag (true: pause minting, false: unpause)
    function setPaused(bool to) external onlyOwner {
        require(paused != to, "Same Status");

        paused = to;
        emit SetPaused(to);
    }

    /// @dev override ERC20`s _mint function for adding max_total_supply limit validation
    /// @param account The target address minting tokens
    /// @param amount The minting token amount
    function _mint(address account, uint256 amount) internal override {
        // if s_mintingFinished is set, check total supply limit
        uint256 _totalSupply = totalSupply();
        require(_totalSupply + amount <= maxSupply, "Limited By Max Supply");

        // call ERC20 _mint function
        ERC20Upgradeable._mint(account, amount);
    }

    /// @dev Set new max supply by owner
    /// @param supply The new max supply amount
    function setMaxSupply(uint256 supply) external onlyOwner {
        require(totalSupply() <= supply, "Invalid Max Supply");

        maxSupply = supply;

        emit SetMaxSupply(supply);
    }

    /// @dev Burn token by owner
    /// @param amount Burning token amount
    function burn(uint256 amount) external onlyOwner {
        _burn(_msgSender(), amount);
    }
}
