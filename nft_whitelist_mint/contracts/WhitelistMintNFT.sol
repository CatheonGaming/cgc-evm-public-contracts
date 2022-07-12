// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/// @title Whitelist Mint ERC721A NFT Contract
/// @dev public/whitelist mint
/// @author Seiji
contract WhitelistMintNFT is ERC721A, Ownable, Pausable, ReentrancyGuard {
    struct WhitelistSaleInfo {
        uint256 mintStartTime; // Start timestamp of minting
        uint256 mintEndTime; // End timestamp of minting
        bytes32 merkleRoot; // Merkle Tree Root Hash
        uint256 mintPrice; // Token Mint Price
    }

    // Token URI Prefix
    string public uriPrefix = "";
    // Token Max Supply
    uint256 public maxSupply;
    // Public sale flag
    bool public isEnabledPublicSale;
    // Public sale mint price
    uint256 public pMintPrice;
    // Whitelist Sale schedule counter
    uint256 public wlSaleCounter;
    // Mapping of whitelist sale counter to whitelist Info
    mapping(uint256 => WhitelistSaleInfo) public wlSaleInfos;
    // Mapping of whitelist sale counter to mapping of customer address to minted amount on whitelist
    mapping(uint256 => mapping(address => uint256)) private wlMintedAmt;

    // ******************  Errors  *****************************

    error MaxSupplyZero();
    error URIPrefixEmpty();
    error PublicSaleNotAvailable();
    error MintNotAvailable();
    error WhitelistNotAvailable();
    error MintMaxSupply();
    error MintInsufficientFund();
    error WhitelistMaxSupply();
    error NoDepositedETH();
    error InvalidSale();
    error InvalidMerkleRoot();
    error InvalidMintTime();

    // ******************  Events  *****************************

    event SetPublicMintPrice(uint256 price);
    event SetUriPrefix(string prifix);
    event SetWhitelistSale(bytes32 merkleRoot, uint256 startTime, uint256 endTime, uint256 mintPrice);
    event SetEnabledPublicSale(bool isEnabledPublicSale);
    event Withdrew(uint256 amount);

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
    /// @param _pMintPrice The ETH price of public mint
    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _maxSupply,
        string memory _uriPrefix,
        uint256 _pMintPrice
    ) ERC721A(_tokenName, _tokenSymbol) {
        if (_maxSupply == 0) revert MaxSupplyZero();
        if (bytes(_uriPrefix).length == 0) revert URIPrefixEmpty();

        maxSupply = _maxSupply;
        uriPrefix = _uriPrefix;
        pMintPrice = _pMintPrice;
    }

    /// @dev public mint
    /// @param _amount The number of minting NFTs
    function publicSale(uint256 _amount) external payable virtual whenNotPaused nonReentrant mintCompliance(_amount) {
        if (!isEnabledPublicSale) revert PublicSaleNotAvailable();
        if (msg.value < pMintPrice * _amount) revert MintInsufficientFund();

        _safeMint(_msgSender(), _amount);
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
    ) external payable virtual whenNotPaused nonReentrant mintCompliance(_amount) {
        WhitelistSaleInfo memory wlInfo = wlSaleInfos[wlSaleCounter];

        if (wlInfo.merkleRoot == "") revert WhitelistNotAvailable();
        if (msg.value < wlInfo.mintPrice * _amount) revert MintInsufficientFund();
        if (block.timestamp < wlInfo.mintStartTime || block.timestamp > wlInfo.mintEndTime) revert MintNotAvailable();

        bytes32 leaf = keccak256(abi.encodePacked(_index, _msgSender(), _maxAmount));
        if (!MerkleProof.verify(_proof, wlInfo.merkleRoot, leaf)) revert InvalidSale();

        if (_amount + wlMintedAmt[wlSaleCounter][_msgSender()] > _maxAmount) revert WhitelistMaxSupply();

        wlMintedAmt[wlSaleCounter][_msgSender()] += _amount;
        _safeMint(_msgSender(), _amount);
    }

    /// @dev Mint function for owner that allows for free minting for a specified address
    /// @param _to The address of receiver
    /// @param _amount The amount of minting
    function mintForAddress(address _to, uint256 _amount) external virtual mintCompliance(_amount) onlyOwner {
        _safeMint(_to, _amount);
    }

    // the starting tokenId
    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }

    /// @dev get the tokenIds of NFTs owned by _owner
    /// @param _owner NFT owner address
    function tokenIdsOf(address _owner) external view virtual returns (uint256[] memory) {
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

    /// @dev set public mint price by only collection owner
    /// @param _pMintPrice The public mint price (ETH)
    function setPublicMintPrice(uint256 _pMintPrice) external virtual onlyOwner {
        pMintPrice = _pMintPrice;
        emit SetPublicMintPrice(_pMintPrice);
    }

    /// @dev set NFT URI Prefix by only collection owner
    /// @param _uriPrefix The prefix string
    function setUriPrefix(string memory _uriPrefix) external virtual onlyOwner {
        if (bytes(_uriPrefix).length == 0) revert URIPrefixEmpty();

        uriPrefix = _uriPrefix;
        emit SetUriPrefix(_uriPrefix);
    }

    /// @dev Collection owner should set merkle root and start/end timestamp in order to start new whitelist mint schedule.
    /// @param _merkleRoot new merkle root hash
    /// @param _mintStartTime The start time of minting
    /// @param _mintEndTime The end time of minting
    /// @param _mintPrice The mint price (ETH)
    function setWhitelistSale(
        bytes32 _merkleRoot,
        uint256 _mintStartTime,
        uint256 _mintEndTime,
        uint256 _mintPrice
    ) external virtual onlyOwner {
        if (_merkleRoot == "") revert InvalidMerkleRoot();
        if (_mintStartTime < block.timestamp || _mintEndTime <= _mintStartTime) revert InvalidMintTime();

        ++wlSaleCounter;
        WhitelistSaleInfo storage wlInfo = wlSaleInfos[wlSaleCounter];
        wlInfo.merkleRoot = _merkleRoot;
        wlInfo.mintStartTime = _mintStartTime;
        wlInfo.mintEndTime = _mintEndTime;
        wlInfo.mintPrice = _mintPrice;

        emit SetWhitelistSale(_merkleRoot, _mintStartTime, _mintEndTime, _mintPrice);
    }

    /// @dev start public mint
    /// @param _enabled The flag of the enabled public sale
    function setEnabledPublicSale(bool _enabled) external onlyOwner {
        isEnabledPublicSale = _enabled;
        emit SetEnabledPublicSale(_enabled);
    }

    /// @dev withdraw ETH by owner
    /// @param _to target address
    function withdraw(address _to) external virtual nonReentrant onlyOwner {
        uint256 _depositedEth = address(this).balance;
        if (_depositedEth == 0) revert NoDepositedETH();

        payable(_to).transfer(_depositedEth);

        emit Withdrew(_depositedEth);
    }

    /// @dev get the NFT base URI (overrided)
    function _baseURI() internal view virtual override returns (string memory) {
        return uriPrefix;
    }

    /// @dev get the minted amount on whitelist sale
    function getWlMintedAmount(uint256 _wlSaleCounter, address _account) external view returns (uint256) {
        return wlMintedAmt[_wlSaleCounter][_account];
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
}
