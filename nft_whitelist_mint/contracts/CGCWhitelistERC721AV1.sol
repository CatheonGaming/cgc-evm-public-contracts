// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IPhaseSalableV1.sol";

/// @title Whitelist Mint ERC721A NFT Contract
/// @dev Several phases of public/whitelist mint, minting with ERC20 token
/// @author Seiji Ito
contract CGCWhitelistERC721AV1 is ERC721A, Ownable, Pausable, ReentrancyGuard, IPhaseSalableV1 {
    // Token URI Prefix
    string public uriPrefix = "";
    // Token Max Supply
    uint256 public maxSupply;
    // sale id
    uint256 public saleId;
    // Mapping of sale id to sale Info
    mapping(uint256 => SaleInfo) private _saleInfos;
    // Mapping of sale Id to minted amount on whitelist
    mapping(uint256 => uint256) private _mintedAmounts;
    // Mapping of sale id to mapping of customer address to minted amount on whitelist
    mapping(uint256 => mapping(address => uint256)) private _accountMintedAmounts;

    // ******************  Errors  *****************************

    error MaxSupplyZero();
    error URIPrefixEmpty();
    error PublicSaleNotAvailable();
    error MintNotAvailable();
    error WhitelistNotAvailable();
    error MintMaxSupply();
    error MintInsufficientFund();
    error WhitelistSaleMaxUserSupply();
    error WhitelistSaleMaxSupply();
    error PublicSaleMaxSupply();
    error PublicSaleMaxUserSupply();
    error ScheduleOngoing();
    error NoDepositedETH();
    error NoDepositedERC20();
    error InvalidSale();
    error InvalidMerkleRoot();
    error InvalidMintTime();
    error InvalidMaxSupply();
    error WithERC20NotAvailable();

    // ******************  Events  *****************************

    event SetUriPrefix(string prifix);
    event SetMaxSupply(uint256 maxSupply);

    // ******************  Modifiers  **************************

    modifier mintCompliance(uint256 _mintAmount) {
        if (totalSupply() + _mintAmount > maxSupply) revert MintMaxSupply();
        _;
    }

    // ******************  Constructor  ************************
    /// @dev construct nft collection
    /// @param _tokenName The token name
    /// @param _tokenSymbol The token symbol
    /// @param _maxSupply The nft max supply
    /// @param _uriPrefix The prefix of nft uri
    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _maxSupply,
        string memory _uriPrefix
    ) ERC721A(_tokenName, _tokenSymbol) {
        if (_maxSupply == 0) revert MaxSupplyZero();
        if (bytes(_uriPrefix).length == 0) revert URIPrefixEmpty();

        maxSupply = _maxSupply;
        uriPrefix = _uriPrefix;
    }

    /// @dev Get CGC Mint Contract Version
    function getVersionCode() external override pure returns (uint8) {
        return 1;
    }

    /// @dev Get the next token Id of minting
    function nextTokenId() external override view returns (uint256) {
        return _nextTokenId();
    }

    /// @dev public mint
    /// @param _amount The number of minting NFTs
    function publicSale(uint256 _amount) external payable override whenNotPaused nonReentrant mintCompliance(_amount) {
        _publicMint(_msgSender(), _amount);
    }

    /// @dev public mint to
    /// @param to The target address
    /// @param _amount The number of minting NFTs
    function publicSaleTo(address to, uint256 _amount) external override payable whenNotPaused nonReentrant mintCompliance(_amount) {
        _publicMint(to, _amount);
    }

    /// @dev public mint
    /// @param _amount The number of minting NFTs
    function _publicMint(address to, uint256 _amount) private {
        SaleInfo memory si = _saleInfos[saleId];
        if (si.merkleRoot != 0) revert PublicSaleNotAvailable();
        if (msg.value < si.mintPrice * _amount) revert MintInsufficientFund();
        if (block.timestamp < si.mintStartTime || block.timestamp > si.mintEndTime) revert MintNotAvailable();

        uint256 accountMintedAmount = _accountMintedAmounts[saleId][to];
        if (si.maxPerUser > 0 && _amount + accountMintedAmount > si.maxPerUser) revert PublicSaleMaxUserSupply();

        uint256 saleMintedAmount = _mintedAmounts[saleId];
        if (si.mintAmount > 0 && _amount + saleMintedAmount > si.mintAmount) revert PublicSaleMaxSupply();

        unchecked {
            _accountMintedAmounts[saleId][to] = accountMintedAmount + _amount;
            _mintedAmounts[saleId] = saleMintedAmount + _amount;
        }

        _safeMint(to, _amount);
    }

    /// @dev whitelist mint
    /// @param _index The index of account`s leaf on merkle whitelist
    /// @param _proof The proofs of account`s leaf on merkle whitelist
    /// @param _maxAmount The mint max amount of account on merkle whitelist
    /// @param _amount The number of minting NFTs
    function whitelistSale(
        uint256 _index,
        bytes32[] calldata _proof,
        uint256 _maxAmount,
        uint256 _amount
    ) external payable override whenNotPaused nonReentrant mintCompliance(_amount) {
        SaleInfo memory si = _saleInfos[saleId];

        if (si.merkleRoot == 0) revert WhitelistNotAvailable();
        if (msg.value < si.mintPrice * _amount) revert MintInsufficientFund();
        if (block.timestamp < si.mintStartTime || block.timestamp > si.mintEndTime) revert MintNotAvailable();

        bytes32 leaf = keccak256(abi.encodePacked(_index, _msgSender(), _maxAmount));
        if (!MerkleProof.verify(_proof, si.merkleRoot, leaf)) revert InvalidSale();

        uint256 accountMintedAmount = _accountMintedAmounts[saleId][_msgSender()];
        if (_maxAmount > 0 && _amount + accountMintedAmount > _maxAmount) revert WhitelistSaleMaxUserSupply();

        uint256 saleMintedAmount = _mintedAmounts[saleId];
        if (si.mintAmount > 0 && _amount + saleMintedAmount > si.mintAmount) revert WhitelistSaleMaxSupply();

        unchecked {
            _accountMintedAmounts[saleId][_msgSender()] = accountMintedAmount + _amount;
            _mintedAmounts[saleId] = saleMintedAmount + _amount;
        }

        _safeMint(_msgSender(), _amount);
    }

    /// @dev public mint
    /// @param _amount The number of minting NFTs
    function publicSaleWithERC20(uint256 _amount) external override whenNotPaused nonReentrant mintCompliance(_amount) {
        SaleInfo memory si = _saleInfos[saleId];
        address to = _msgSender();

        if (si.merkleRoot != 0) revert PublicSaleNotAvailable();
        if (si.erc20Token == address(0)) revert WithERC20NotAvailable();
        if (block.timestamp < si.mintStartTime || block.timestamp > si.mintEndTime) revert MintNotAvailable();

        uint256 accountMintedAmount = _accountMintedAmounts[saleId][to];
        if (si.maxPerUser > 0 && _amount + accountMintedAmount > si.maxPerUser) revert PublicSaleMaxUserSupply();

        uint256 saleMintedAmount = _mintedAmounts[saleId];
        if (si.mintAmount > 0 && _amount + saleMintedAmount > si.mintAmount) revert PublicSaleMaxSupply();

        unchecked {
            _accountMintedAmounts[saleId][to] = accountMintedAmount + _amount;
            _mintedAmounts[saleId] = saleMintedAmount + _amount;
        }

        if(si.tokenAmount > 0) {
            IERC20(si.erc20Token).transferFrom(to, address(this), si.tokenAmount * _amount);
        }

        _safeMint(to, _amount);
    }

    /// @dev whitelist mint
    /// @param _index The index of account`s leaf on merkle whitelist
    /// @param _proof The proofs of account`s leaf on merkle whitelist
    /// @param _maxAmount The mint max amount of account on merkle whitelist
    /// @param _amount The number of minting NFTs
    function whitelistSaleWithERC20(
        uint256 _index,
        bytes32[] calldata _proof,
        uint256 _maxAmount,
        uint256 _amount
    ) external override whenNotPaused nonReentrant mintCompliance(_amount) {
        SaleInfo memory si = _saleInfos[saleId];
        address to = _msgSender();

        if (si.merkleRoot == 0) revert WhitelistNotAvailable();
        if (si.erc20Token == address(0)) revert WithERC20NotAvailable();
        if (block.timestamp < si.mintStartTime || block.timestamp > si.mintEndTime) revert MintNotAvailable();

        bytes32 leaf = keccak256(abi.encodePacked(_index, to, _maxAmount));
        if (!MerkleProof.verify(_proof, si.merkleRoot, leaf)) revert InvalidSale();

        uint256 accountMintedAmount = _accountMintedAmounts[saleId][to];
        if (_maxAmount > 0 && _amount + accountMintedAmount > _maxAmount) revert WhitelistSaleMaxUserSupply();

        uint256 saleMintedAmount = _mintedAmounts[saleId];
        if (si.mintAmount > 0 && _amount + saleMintedAmount > si.mintAmount) revert WhitelistSaleMaxSupply();

        unchecked {
            _accountMintedAmounts[saleId][to] = accountMintedAmount + _amount;
            _mintedAmounts[saleId] = saleMintedAmount + _amount;
        }

        if(si.tokenAmount > 0) {
            IERC20(si.erc20Token).transferFrom(to, address(this), si.tokenAmount * _amount);
        }
        _safeMint(to, _amount);
    }

    /// @dev Mint function for owner that allows for free minting for a specified address
    /// @param _to The address of receiver
    /// @param _amount The amount of minting
    function mintForAddress(address _to, uint256 _amount) external override mintCompliance(_amount) onlyOwner {
        _safeMint(_to, _amount);
    }

    /// @dev set NFT URI Prefix by only collection owner
    /// @param _uriPrefix The prefix string
    function setUriPrefix(string memory _uriPrefix) external onlyOwner {
        if (bytes(_uriPrefix).length == 0) revert URIPrefixEmpty();

        uriPrefix = _uriPrefix;
        emit SetUriPrefix(_uriPrefix);
    }

    /// @dev set NFT Max Supply by only collection owner
    /// @param _maxSupply The max NFT supply
    function setMaxSupply(uint256 _maxSupply) external onlyOwner {
        if (_nextTokenId() > _maxSupply) revert InvalidMaxSupply();

        maxSupply = _maxSupply;
        emit SetMaxSupply(_maxSupply);
    }

    /// @dev Collection owner should set merkle root and start/end timestamp in order to start new whitelist mint schedule.
    /// @param _merkleRoot new merkle root hash
    /// @param _mintStartTime The start time of minting
    /// @param _mintEndTime The end time of minting
    /// @param _mintPrice The mint price (ETH)
    /// @param _mintAmount The mint amount
    /// @param _mintERC20Token The token address for minting
    /// @param _mintTokenAmount The token amount for minting
    function setupWhitelistSale(
        bytes32 _merkleRoot,
        uint256 _mintStartTime,
        uint256 _mintEndTime,
        uint256 _mintPrice,
        uint256 _mintAmount,
        address _mintERC20Token,
        uint256 _mintTokenAmount
    ) external override onlyOwner {
        if (_merkleRoot == 0) revert InvalidMerkleRoot();
        if (_mintStartTime < block.timestamp || _mintEndTime <= _mintStartTime) revert InvalidMintTime();

        ++saleId;
        SaleInfo storage si = _saleInfos[saleId];
        si.merkleRoot = _merkleRoot;
        si.mintStartTime = _mintStartTime;
        si.mintEndTime = _mintEndTime;
        si.mintPrice = _mintPrice;
        si.mintAmount = _mintAmount;
        si.erc20Token = _mintERC20Token;
        si.tokenAmount = _mintTokenAmount;

        emit SetupSaleInfo(saleId, si);
    }

    /// @dev Collection owner should set start/end timestamp in order to start new public mint schedule.
    /// @param _mintStartTime The start time of minting
    /// @param _mintEndTime The end time of minting
    /// @param _mintPrice The mint price (ETH)
    /// @param _mintAmount The mint amount
    /// @param _maxPerUser The maximum amount of minting per user
    /// @param _mintERC20Token The token address for minting
    /// @param _mintTokenAmount The token amount for minting
    function setupPublicSale(
        uint256 _mintStartTime,
        uint256 _mintEndTime,
        uint256 _mintPrice,
        uint256 _mintAmount,
        uint256 _maxPerUser,
        address _mintERC20Token,
        uint256 _mintTokenAmount
    ) external override onlyOwner {
        if (_mintStartTime < block.timestamp || _mintEndTime <= _mintStartTime) revert InvalidMintTime();

        ++saleId;
        SaleInfo storage si = _saleInfos[saleId];
        si.mintStartTime = _mintStartTime;
        si.mintEndTime = _mintEndTime;
        si.mintPrice = _mintPrice;
        si.mintAmount = _mintAmount;
        si.maxPerUser = _maxPerUser;
        si.erc20Token = _mintERC20Token;
        si.tokenAmount = _mintTokenAmount;

        emit SetupSaleInfo(saleId, si);
    }

    /// @dev withdraw ETH by owner
    /// @param _to target address
    function withdraw(address _to) external override nonReentrant onlyOwner {
        uint256 _depositedEth = address(this).balance;
        if (_depositedEth == 0) revert NoDepositedETH();

        payable(_to).transfer(_depositedEth);

        emit Withdrew(_to, _depositedEth);
    }


    /// @dev withdraw ETH by owner
    /// @param _to target address
    function withdrawERC20(address _token, address _to) external override nonReentrant onlyOwner {
        uint256 _depositedToken = IERC20(_token).balanceOf(address(this));
        if (_depositedToken == 0) revert NoDepositedERC20();

        IERC20(_token).transfer(_to, _depositedToken);

        emit WithdrewERC20(_to, _depositedToken);
    }

    // the starting tokenId
    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }

    /// @dev get the tokenIds of NFTs owned by _owner
    /// @param _owner NFT owner address
    function tokenIdsOf(address _owner) external view returns (uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory ownedTokenIds = new uint256[](ownerTokenCount);
        uint256 currentTokenId = _startTokenId();
        uint256 ownedTokenIndex = 0;

        while (ownedTokenIndex < ownerTokenCount && currentTokenId < _nextTokenId()) {
            TokenOwnership memory ownership = _ownershipAt(currentTokenId);

            if (!ownership.burned) {
                if (ownership.addr == _owner) {
                    ownedTokenIds[ownedTokenIndex] = currentTokenId;
                    ownedTokenIndex++;
                }
            }

            currentTokenId++;
        }

        return ownedTokenIds;
    }

    /// @dev get the NFT base URI (overrided)
    function _baseURI() internal view virtual override returns (string memory) {
        return uriPrefix;
    }

    /// @dev get the Sale Info with sale id
    function saleInfo(uint256 _saleId) external view returns (SaleInfo memory) {
        return _saleInfos[_saleId];
    }

    function activeSaleInfo() external view returns (SaleInfo memory) {
        return _saleInfos[saleId];
    }

    /// @dev get the minted amount on sale
    function mintedAmount(uint256 _saleId) external view returns (uint256) {
        return _mintedAmounts[_saleId];
    }

    /// @dev get the minted amount of account on sale
    function mintedAmountOf(uint256 _saleId, address _account) external view returns (uint256) {
        return _accountMintedAmounts[_saleId][_account];
    }

    // ******************  Pausable  *************************
    /// @dev Pause
    function pause() public onlyOwner whenNotPaused {
        _pause();
    }

    /// @dev Unpause
    function unpause() public onlyOwner whenPaused {
        _unpause();
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
}
