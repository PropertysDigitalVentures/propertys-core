//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

// import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./VRFConsumerBaseUpgradeable.sol";

import "./interfaces/IBrickToken.sol";
import "./libraries/RandomLib.sol";

import "hardhat/console.sol";

contract PropertyNFT is
    AccessControlEnumerableUpgradeable,
    PausableUpgradeable,
    OwnableUpgradeable,
    ERC721EnumerableUpgradeable,
    VRFConsumerBaseUpgradable
{
    using SafeMathUpgradeable for uint256;
    using StringsUpgradeable for uint256;
    using ECDSAUpgradeable for bytes32;
    using RandomLib for RandomLib.Random;

    struct Whitelist {
        uint8 tier;
        uint8 cap;
    }

    // Max Supply
    uint256 public constant MAX_SUPPLY = 6000;

    // Mint Prices
    uint256 public constant LAUNCH_PRICE = 0.09 ether;
    uint256[] public PRIVATE_SALE_PRICES;
    uint256 public constant PARTNER_SALE_PRICE = 0.08 ether;

    // Wallet Restrictions
    uint8 public constant MAX_QUANTITY = 8; // maximum number of mint per transaction
    uint8 public constant WALLET_LIMIT_PUBLIC = 16; // to change
    mapping(address => uint256) public totalOwned; // Total number of PROPERTY owned;
    mapping(address => Whitelist) public whitelistedAddresses; // PROPERTY AGENTS
    mapping(address => bool) public whitelistedPartners;

    // Sales Timings
    uint256 public PRIVATE_SALE_START;
    uint256 public PRIVATE_SALE_WINDOW;
    uint256 public PUBLIC_SALE_START;

    // Treasury Address
    address payable public TREASURY;

    // Metadata
    string public baseTokenURI;
    string public notRevealedURI;
    bool public revealed;

    // Chainlink
    bytes32 internal keyHash;
    uint256 internal fee;

    // PRIVATE VARIABLES
    mapping(address => uint8) private publicAddressMintedAmount; // number of NFT minted for each wallet during public sale
    mapping(bytes => uint256) private postalCodeUint; // Maps postal code to token id
    mapping(uint256 => bytes) private postalCodeBytes;

    uint32[] private available;

    uint256 private _currentTokenID;

    RandomLib.Random internal random;

    // Reserve Storage
    uint256[50] private ______gap;

    // ---------------------- MODIFIERS ---------------------------

    /// @dev Only EOA modifier
    modifier onlyEOA() {
        require(msg.sender == tx.origin, "PropertyNFT: Only EOA");
        _;
    }

    // ---------------------- INITIALIZER -------------------------

    function __PropertyNFT_init(
        string memory _notRevealedUri,
        address _owner,
        address _treasury,
        uint256 _privateSaleStart,
        uint256 _privateSaleWindow,
        uint256 _publicSaleStart,
        address _vrfCoordinator,
        address _link,
        bytes32 _keyHash,
        uint256 _fee
    ) public initializer {
        __AccessControlEnumerable_init();
        __Ownable_init();
        __Pausable_init();
        __ERC721_init_unchained("PropertyNFT", "PP");
        __ERC721Enumerable_init();
        __VRFConsumableBase_init(_vrfCoordinator, _link);
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        grantRole(DEFAULT_ADMIN_ROLE, _treasury);
        notRevealedURI = _notRevealedUri;
        TREASURY = payable(_treasury);
        PRIVATE_SALE_START = _privateSaleStart;
        PRIVATE_SALE_WINDOW = _privateSaleWindow;
        PUBLIC_SALE_START = _publicSaleStart;
        PRIVATE_SALE_PRICES = [0.08 ether, 0.0725 ether, 0.065 ether];
        keyHash = _keyHash;
        fee = _fee;
        transferOwnership(_owner);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory currentBaseURI = _baseURI();

        if (!revealed) {
            return notRevealedURI;
        } else {
            return
                bytes(currentBaseURI).length > 0
                    ? string(
                        abi.encodePacked(currentBaseURI, tokenId.toString())
                    )
                    : "";
        }
    }

    // -------------------------- PUBLIC FUNCTIONS ----------------------------

    /// @dev Presale Mint
    function presaleMint(uint8 _mintAmount)
        public
        payable
        onlyEOA
        whenNotPaused
    {
        Whitelist storage whitelist = whitelistedAddresses[msg.sender];
        // require(isPresaleOpen(), "PropertyNFT: Presale Mint not open!");
        require(
            _mintAmount <= whitelist.cap,
            "PropertyNFT: Presale limit exceeded!"
        );
        require(whitelist.tier > 0, "PropertyNFT: Not Whitelisted!");
        require(
            msg.value == PRIVATE_SALE_PRICES[whitelist.tier - 1] * _mintAmount,
            "PropertyNFT: Insufficient ETH!"
        );
        require(
            totalSupply() + _mintAmount <= MAX_SUPPLY,
            "PropertyNFT: Maximum Supply Reached!"
        );

        (bool success, ) = TREASURY.call{value: msg.value}(""); // forward amount to treasury wallet
        require(success, "PropertyNFT: Unable to forward message to treasury!");

        // Reduce Cap
        whitelist.cap -= _mintAmount;

        for (uint256 i = 1; i <= _mintAmount; i++) {
            _mintRandom(msg.sender);
        }
    }

    /// @dev partner Mint
    function partnerMint() public payable onlyEOA whenNotPaused {
        // require(isPresaleOpen(), "PropertyNFT: Presale Mint not open!");
        require(
            whitelistedPartners[msg.sender],
            "PropertyNFT: You do not have whitelist mints!"
        );

        require(
            msg.value == PARTNER_SALE_PRICE,
            "PropertyNFT: Insufficient ETH!"
        );
        require(
            totalSupply() + 1 <= MAX_SUPPLY,
            "PropertyNFT: Maximum Supply Reached!"
        );

        (bool success, ) = TREASURY.call{value: msg.value}(""); // forward amount to treasury wallet
        require(success, "PropertyNFT: Unable to forward message to treasury!");

        // Remove from Partner Whitelist
        whitelistedPartners[msg.sender] == false;
        _mintRandom(msg.sender);
    }

    /// @dev Public sale
    function publicMint(uint8 _mintAmount)
        public
        payable
        onlyEOA
        whenNotPaused
    {
        // require(
        //     (isPublicSaleOpen()),
        //     "PropertyNFT: Public sale has not started!"
        // );
        require(
            publicAddressMintedAmount[msg.sender] + _mintAmount <=
                WALLET_LIMIT_PUBLIC,
            "PropertyNFT: Maximum amount of mints exceeded!"
        );
        require(
            _mintAmount <= MAX_QUANTITY,
            "PropertyNFT: Maximum mint amount per transaction exceeded!"
        );
        require(
            totalSupply() + _mintAmount <= MAX_SUPPLY,
            "PropertyNFT: Maximum Supply Reached!"
        );
        require(
            msg.value == LAUNCH_PRICE * _mintAmount,
            "PropertyNFT: Insufficient ETH!"
        );

        (bool success, ) = TREASURY.call{value: msg.value}(""); // forward amount to treasury wallet
        require(success, "PropertyNFT: Unable to forward message to treasury!");

        publicAddressMintedAmount[msg.sender] += _mintAmount;

        for (uint256 i; i < _mintAmount; i++) {
            _mintRandom(msg.sender);
        }
    }

    // ----------------- VIEW FUNCTIONS ------------------------

    function walletOfOwner(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    /// @dev Check if Presale is Open
    function isPresaleOpen() public view returns (bool) {
        return
            block.timestamp >= PRIVATE_SALE_START &&
            block.timestamp < (PRIVATE_SALE_START + PRIVATE_SALE_WINDOW);
    }

    /// @dev Check if Public Sale is Open
    function isPublicSaleOpen() public view returns (bool) {
        return block.timestamp >= PUBLIC_SALE_START;
    }

    /// @dev Check if user is whitelisted
    function checkWhitelist(address _user)
        public
        view
        returns (Whitelist memory)
    {
        return whitelistedAddresses[_user];
    }

    /// @dev Get Whitelist Price
    function getWhitelistPrice(address user) public view returns (uint256) {
        if (whitelistedAddresses[user].tier > 0) {
            return PRIVATE_SALE_PRICES[whitelistedAddresses[user].tier - 1];
        } else {
            return LAUNCH_PRICE;
        }
    }

    // ------------------ PURE FUNCTIONS ------------------------
    function parsePostalCode(bytes memory postalCode)
        public
        pure
        returns (uint8[4] memory)
    {
        return [
            uint8(postalCode[0]), // City
            uint8(postalCode[1]), // District
            uint8(postalCode[2]), // Street
            uint8(postalCode[3]) // House
        ];
    }

    function getPostalCode(uint32 tokenId) public pure returns (bytes memory) {
        return abi.encodePacked(tokenId);
    }

    function getAvailable() public view returns (uint32[] memory) {
        return available;
    }

    // ------------------ INTERNAL FUNCTIONS ------------------------

    /// @dev Sets baseURI
    function _setBaseURI(string memory _baseTokenURI) internal virtual {
        baseTokenURI = _baseTokenURI;
    }

    /// @dev Gets baseToken URI
    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    /// @dev For local testing
    function mockfulfillRandomness(uint256 randomness)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        fulfillRandomness("", randomness);
    }

    /// @dev Initialize Randomness using chainlink
    function initializeRandomness()
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (bytes32 requestId)
    {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        return requestRandomness(keyHash, fee);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        RandomLib.setInitialRandom(random, randomness);
    }

    function _mintRandom(address user) internal {
        require(
            available.length > 0,
            "PropertyNFT: No more available Propertys"
        );
        uint256 randN = RandomLib.nextRandom(random);
        uint256 postalCode = available[randN % available.length];
        _removeFromAvailable(randN % available.length);
        _mint(user, postalCode);
    }

    // ------------------------ ADMIN FUNCTIONS ----------------------------

    /// @dev Set Available mints
    function pushAvailable(uint32[] memory _available)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        for (uint256 i; i < _available.length; i++) {
            available.push(_available[i]);
        }
    }

    /// @dev Reserve some NFTS by postalcode
    function reserve(uint256 amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
        for (uint256 i; i < amount; i++) {
            _mintRandom(msg.sender);
        }
    }

    ///  @dev Pauses all token transfers.
    function pause() public virtual onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @dev Unpauses all token transfers.
    function unpause() public virtual onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function reveal() public onlyRole(DEFAULT_ADMIN_ROLE) {
        revealed = true;
    }

    function updateBaseURI(string memory _newBaseURI)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _setBaseURI(_newBaseURI);
    }

    /// @dev Add users to whitelist
    function whitelistUsers(address[] memory _users, uint8[] memory _tier)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        for (uint256 i = 0; i < _users.length; i++) {
            whitelistedAddresses[_users[i]] = Whitelist(_tier[i], _tier[i]);
        }
    }

    /// @dev Add users to whitelist
    function whitelistPartners(address[] memory _users)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        for (uint256 i = 0; i < _users.length; i++) {
            whitelistedPartners[_users[i]] = true;
        }
    }

    /// @dev Emergency Function to withdraw ETH from this contract
    function withdrawToTreasury() public onlyRole(DEFAULT_ADMIN_ROLE) {
        (bool success, ) = TREASURY.call{value: address(this).balance}("");
        require(success);
    }

    // -------------------------- INTERNAL OVERRIDES -----------------------------

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721EnumerableUpgradeable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // ------------------------- PRIVATE FUNCTIONS ------------------------------

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(
            AccessControlEnumerableUpgradeable,
            ERC721EnumerableUpgradeable
        )
        returns (bool)
    {
        return
            interfaceId ==
            type(IAccessControlEnumerableUpgradeable).interfaceId ||
            interfaceId == type(IERC721EnumerableUpgradeable).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function _removeFromAvailable(uint256 index) private {
        require(index < available.length);
        available[index] = available[available.length - 1];
        available.pop();
    }
}
