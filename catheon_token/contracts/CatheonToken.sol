// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// Catheon token
/// @dev The ownable ERC20 token contract
contract CatheonToken is ERC20, Ownable {
    address private serviceAddress;

    address private presaleAddress;

    uint16 private feePercent = 15; //1.5%

    bool private canMint = false;

    // apply max total supply limit
    bool private mintingFinished = false;

    // max total supply limit 10,000,000,000 * DECIMAL
    uint256 private constant MAX_TOTAL_SUPPLY_LIMIT = 1e19;

    event UpdateMintStatus(bool oldStatus, bool newStatus);
    event SetServiceAddress(address oldAddress, address newAddress);
    event SetPresaleAddress(address oldAddress, address newAddress);
    event SetFeePercent(uint16 oldFee, uint16 newSNewFee);
    event UpdateMintingFinished(
        bool oldMintingFinished,
        bool newMintingFinished
    );

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialBalance
    ) ERC20(name, symbol) {
        require(initialBalance > 0, "Initial Supply Zero");

        _mint(msg.sender, initialBalance);
    }

    function mint(address account, uint256 amount) external onlyOwner {
        require(!canMint, "Minting Unavailable");

        _mint(account, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 9;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal override {
        uint256 receiveAmount = amount;
        uint256 feePercent = feePercent;
        address serviceAddress = serviceAddress;
        address presaleAddress = presaleAddress;

        // feePercent can not be zero (initial: 1.5% and can not set as zero in "setFee" function)
        if (
            sender != presaleAddress &&
            sender != serviceAddress &&
            serviceAddress != recipient &&
            serviceAddress != address(0)
        ) {
            uint256 feeAmount = (amount * feePercent) / 1000;
            receiveAmount = amount - feeAmount;

            // feeAmount can not be zero in here
            super._transfer(sender, serviceAddress, feeAmount);
        }

        super._transfer(sender, recipient, receiveAmount);
    }

    // @notice public -> external (for saving gas)
    function setService(address value) external onlyOwner {
        address oldServiceAddress = serviceAddress;

        require(
            value != address(0) && value != oldServiceAddress,
            "Invalid Service Address"
        );

        serviceAddress = value;

        emit SetServiceAddress(oldServiceAddress, value);
    }

    // @notice public -> external (for saving gas)
    function setPresale(address value) external onlyOwner {
        address oldPresaleAddress = presaleAddress;

        require(
            value != address(0) && value != oldPresaleAddress,
            "Invalid Presale Address"
        );

        presaleAddress = value;

        emit SetPresaleAddress(oldPresaleAddress, value);
    }

    // @notice public -> external (for saving gas), add "feePercent" parameter validation (9000 >= feePercent > 0)
    function setFee(uint16 feePercent) external onlyOwner {
        require(feePercent != 0 && feePercent <= 900, "Invalid Fee Percentage");

        uint16 oldFeePercent = feePercent;
        require(oldFeePercent != feePercent, "Same Fee Percentage");

        feePercent = feePercent;

        emit SetFeePercent(oldFeePercent, feePercent);
    }

    // @notice public -> external (for saving gas)
    function fee() external view returns (uint16) {
        return feePercent;
    }

    // public -> external (for saving gas)
    function service() external view returns (address) {
        return serviceAddress;
    }

    // public -> external (for saving gas)
    function presale() external view returns (address) {
        return presaleAddress;
    }

    function setMint(bool _canMint) external onlyOwner {
        bool oldStatus = canMint;
        bool newStatus = _canMint;

        require(oldStatus != newStatus, "Same Mint Status");

        canMint = _canMint;
        emit UpdateMintStatus(oldStatus, newStatus);
    }

    /// @notice override ERC20`s _mint function for adding max_total_supply limit validation
    /// @param account The target address minting tokens
    /// @param amount The minting token amount
    function _mint(address account, uint256 amount) internal override {
        // if s_mintingFinished is set, check total supply limit
        if (mintingFinished) {
            uint256 afterTotalSupply = totalSupply() + amount;
            require(
                afterTotalSupply <= MAX_TOTAL_SUPPLY_LIMIT,
                "Limited By Total Supply"
            );
        }

        // call ERC20 _mint function
        super._mint(account, amount);
    }

    // read the minting_finished flag
    function mintingFinished() external view returns (bool) {
        return mintingFinished;
    }

    // set the minting_finished flag
    /// @param _mintingFinished The new minting_finished flag
    function setMintingFinished(bool _mintingFinished) external onlyOwner {
        bool oldMintingFinished = mintingFinished;
        require(
            oldMintingFinished != _mintingFinished,
            "Same Minting Finished"
        );

        mintingFinished = _mintingFinished;

        emit UpdateMintingFinished(oldMintingFinished, _mintingFinished);
    }
}
