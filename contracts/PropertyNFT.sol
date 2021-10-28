//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

import "./interfaces/IBrickToken.sol";

// import "./ERC1155SnapshotUpgradeable.sol";

contract PropertyNFT is
    AccessControlEnumerableUpgradeable,
    PausableUpgradeable,
    OwnableUpgradeable,
    ERC721EnumerableUpgradeable
{
    using SafeMathUpgradeable for uint256;
    using StringsUpgradeable for uint256;
    using ECDSAUpgradeable for bytes32;

    uint256 public constant MAX_SUPPLY = 6000;
    uint256 public constant LAUNCH_PRICE = 0.09 ether;
    uint256 public constant SENIOR_BROKER_PRICE = 0.075 ether;
    uint256 public constant EXECUTIVE_REALTORS_PRICE = 0.06 ether;
    uint256 public constant MAX_QUANTITY = 4; // maximum number of mint per transaction
    uint256 public constant MAX_PER_WALLET = 8;
    string public constant PRE_REVEAL_METADATA = "";
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    uint256 public constant PRE_SALE_WINDOW = 0; // to change
    uint256 public constant PRE_SALE_START = 0; //  to change
    uint256 public constant PUBLIC_SALE_START = 0; // to change
    uint256 public constant WALLET_LIMIT_PUBLIC = 8; // to change
    uint256 public constant WALLET_LIMIT_PRESALE = 8; // to change

    // PUBLIC VARIABLES

    IBrickToken public BRICK_TOKEN;
    address payable public TREASURY;

    string public baseTokenURI;
    string public notRevealedUri;

    bool public revealed;

    mapping(uint256 => address) public creators;
    mapping(uint256 => uint256) public tokenSupply;

    mapping(uint256 => uint256) private _totalSupplyById; // total supply by id
    mapping(uint256 => string) private _tokenURIs;

    mapping(address => uint256) public totalOwned; // Total number of PROPERTY owned;
    mapping(address => bool) public whitelistedAddresses; // all address of whitelisted OGs

    // PRIVATE VARIABLES
    mapping(address => uint256) private presaleAddressMintedAmount; // number of NFT minted for each wallet during presale
    mapping(address => uint256) private publicAddressMintedAmount; // number of NFT minted for each wallet during public sale
    mapping(bytes => bool) private _nonceUsed; // nonce was used to mint already

    address private signerAddressPublic;
    address private signerAddressPresale;
    uint256 private _currentTokenID;

    // Reserve Storage
    uint256[50] private ______gap;

    // ---------------------- MODIFIERS ---------------------------

    /**
     * @dev Require msg.sender to be the creator of the token id
     */
    modifier creatorOnly(uint256 _id) {
        require(
            creators[_id] == msg.sender,
            "UniWeapons: ONLY_CREATOR_ALLOWED"
        );
        _;
    }

    /// @dev Only EOA modifier
    modifier onlyEOA() {
        require(msg.sender == tx.origin, "PropertyNFT: Only EOA");
        _;
    }

    // ---------------------- INITIALIZER -------------------------

    function __PropertyNFT_init(
        string memory _name,
        string memory _symbol,
        string memory _notRevealedUri,
        address _signerAddressPresale,
        address _signerAddressPublic,
        address _owner,
        address _treasury
    ) public initializer {
        __AccessControlEnumerable_init();
        __Ownable_init();
        __Pausable_init();
        __ERC721_init_unchained(_name, _symbol);
        __ERC721Enumerable_init();
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        grantRole(DEFAULT_ADMIN_ROLE, _treasury);
        notRevealedUri = _notRevealedUri;
        setSignerAddressPresale(_signerAddressPresale);
        setSignerAddressPublic(_signerAddressPublic);
        TREASURY = payable(_treasury);
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
            return notRevealedUri;
        } else {
            return
                bytes(currentBaseURI).length > 0
                    ? string(
                        abi.encodePacked(currentBaseURI, tokenId.toString())
                    )
                    : "";
        }
    }

    /// @dev Reserve some NFTS
    function reserve(uint256 mintAmounts)
        public
        onlyEOA
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(
            totalSupply() + mintAmounts <= MAX_SUPPLY,
            "PropertyNFT: total mint amount exceeded supply"
        );
    }

    /// @dev Public sale
    function publicMint(
        bytes memory nonce,
        bytes memory signature,
        uint256 _mintAmount
    ) public payable onlyEOA whenNotPaused {
        require(
            (isPublicSaleOpen()),
            "PropertyNFT: public sale has not started"
        );
        require(!_nonceUsed[nonce], "PropertyNFT: nonce was used");
        require(
            isSignedBySigner(msg.sender, nonce, signature, signerAddressPublic),
            "invalid signature"
        );
        require(
            publicAddressMintedAmount[msg.sender] + _mintAmount <=
                WALLET_LIMIT_PUBLIC,
            "PropertyNFT: You have exceeded max amount of mints"
        );
        require(
            _mintAmount <= MAX_QUANTITY,
            "PropertyNFT: exceeded max mint amount per transaction"
        );
        require(
            totalSupply() + _mintAmount <= MAX_SUPPLY,
            "PropertyNFT: total mint amount exceeded supply, try lowering amount"
        );

        (bool success, ) = TREASURY.call{value: msg.value}(""); // forward amount to treasury wallet
        require(
            success,
            "PropertyNFT: not able to forward msg value to treasury"
        );

        require(
            msg.value == LAUNCH_PRICE * _mintAmount,
            "PropertyNFT: not enough ether sent for mint amount"
        );

        uint256 tokenId;

        for (uint256 i = 1; i <= _mintAmount; i++) {
            tokenId = getRandomTokenId();
            publicAddressMintedAmount[msg.sender]++;
            _mintRandom(msg.sender);
        }
        _nonceUsed[nonce] = true;
    }

    function _mintRandom(address user) internal {}

    // Todo: use chainlink to mint random NFT
    function getRandomTokenId() private returns (uint256) {}

    // presale mint
    function presaleMint(
        bytes memory nonce,
        bytes memory signature,
        uint256 _mintAmount
    ) public payable onlyEOA whenNotPaused {
        require(
            isPresaleOpen(),
            "PropertyNFT: presale has not started or it has ended"
        );
        require(
            whitelistedAddresses[msg.sender],
            "PropertyNFT: you are not in the whitelist"
        );
        require(!_nonceUsed[nonce], "PropertyNFT: nonce was used");
        require(
            isSignedBySigner(
                msg.sender,
                nonce,
                signature,
                signerAddressPresale
            ),
            "PropertyNFT: invalid signature"
        );
        require(
            presaleAddressMintedAmount[msg.sender] + _mintAmount <=
                WALLET_LIMIT_PRESALE,
            "PropertyNFT: you can only mint a maximum of two nft during presale"
        );
        require(
            msg.value >= SENIOR_BROKER_PRICE * _mintAmount,
            "PropertyNFT: not enought ethere sent for mint amount"
        );

        (bool success, ) = TREASURY.call{value: msg.value}(""); // forward amount to treasury wallet
        require(
            success,
            "PropertyNFT: not able to forward msg value to treasury"
        );
        uint256 tokenId;

        for (uint256 i = 1; i <= _mintAmount; i++) {
            tokenId = getRandomTokenId();
            publicAddressMintedAmount[msg.sender]++;
            _mint(msg.sender, tokenId);
        }
        _nonceUsed[nonce] = true;
    }

    //*************** PUBLIC FUNCTIONS ******************//

    //*************** INTERNAL FUNCTIONS ******************//
    function isSignedBySigner(
        address sender,
        bytes memory nonce,
        bytes memory signature,
        address signerAddress
    ) private pure returns (bool) {
        bytes32 hash = keccak256(abi.encodePacked(sender, nonce));
        return signerAddress == hash.recover(signature);
    }

    function _setBaseURI(string memory _baseTokenURI) internal virtual {
        baseTokenURI = _baseTokenURI;
    }

    function isPresaleOpen() public view returns (bool) {
        return
            block.timestamp >= PRE_SALE_START &&
            block.timestamp < (PRE_SALE_START + PRE_SALE_WINDOW);
    }

    function isPublicSaleOpen() public view returns (bool) {
        return block.timestamp >= PUBLIC_SALE_START;
    }

    function isWhitelisted(address _user) public view returns (bool) {
        return whitelistedAddresses[_user];
    }

    //*************** OWNER FUNCTIONS ******************//

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

    function setBrickToken(address _brickToken)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        BRICK_TOKEN = IBrickToken(_brickToken);
    }

    function whitelistUsers(address[] calldata _users)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        for (uint256 i = 0; i < _users.length; i++) {
            whitelistedAddresses[_users[i]] = true;
        }
    }

    function withdrawToTreasury() public payable onlyRole(DEFAULT_ADMIN_ROLE) {
        (bool success, ) = TREASURY.call{value: address(this).balance}("");
        require(success);
    }

    function setSignerAddressPresale(address presaleSignerAddresss)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        signerAddressPresale = presaleSignerAddresss;
    }

    function setSignerAddressPublic(address publicSignerAddress)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        signerAddressPublic = publicSignerAddress;
    }

    // ------------------ INTERNAL OVERRIDES ----------------------

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721EnumerableUpgradeable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // ------------------------- INTERNAL FUNCTIONS ------------------------------

    /// @dev Gets baseToken URI
    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    /**
     * @dev Change the creator address for given token
     * @param _to   Address of the new creator
     * @param _id  Token IDs to change creator of
     */
    function _setCreator(address _to, uint256 _id) internal creatorOnly(_id) {
        creators[_id] = _to;
    }

    // ------------------------- PRIVATE FUNCTIONS ------------------------------

    /**
     * @dev calculates the next token ID based on value of _currentTokenID
     * @return uint256 for the next token ID
     */
    function _getNextTokenID() private view returns (uint256) {
        return _currentTokenID + 1;
    }

    /**
     * @dev increments the value of _currentTokenID
     */
    function _incrementTokenTypeId() private {
        _currentTokenID++;
    }

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
}
