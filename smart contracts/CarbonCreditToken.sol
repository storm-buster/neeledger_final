// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/**
 * @title CarbonCreditToken
 * @dev ERC-1155 token for carbon credits with lifecycle management
 * 1 token = 1 ton CO₂
 */
contract CarbonCreditToken is ERC1155, ERC1155Supply, Ownable {
    
    // Reference to CarbonRegistry
    address public registry;
    
    // Multi-sig signers
    address public verifierSigner;
    address public oracleSigner;
    address public adminSigner;
    
    // Retirement tracking
    mapping(address => uint256) public retiredCredits;
    
    // Project to token ID mapping
    mapping(string => uint256) public projectTokenIds;
    
    // Token metadata
    mapping(uint256 => string) public tokenURIs;
    
    // Counters
    uint256 private _nextTokenId = 1;
    
    // Events
    event CarbonMinted(
        uint256 indexed tokenId,
        string indexed projectID,
        address indexed to,
        uint256 amount
    );
    
    event CreditsRetired(
        address indexed account,
        uint256 amount,
        uint256 timestamp
    );
    
    event SignersUpdated(
        address verifier,
        address oracle,
        address admin
    );
    
    /**
     * @dev Constructor
     * @param _registry Address of CarbonRegistry contract
     */
    constructor(address _registry) ERC1155("") Ownable(msg.sender) {
        registry = _registry;
        verifierSigner = msg.sender;
        oracleSigner = msg.sender;
        adminSigner = msg.sender;
    }
    
    /**
     * @dev Mint carbon credits for a verified project
     * Requires multi-sig approval from verifier, oracle, and admin
     * @param projectID ID of the verified project
     * @param amount Amount of carbon credits to mint (1 token = 1 ton CO₂)
     * @param verifierSignature Signature from verifier
     * @param oracleSignature Signature from oracle
     * @param adminSignature Signature from admin
     */
    function mintCarbon(
        string memory projectID,
        uint256 amount,
        bytes memory verifierSignature,
        bytes memory oracleSignature,
        bytes memory adminSignature
    ) external returns (uint256) {
        // Verify project exists and is ready
        (bool ready, bytes memory data) = registry.staticcall(
            abi.encodeWithSelector(
                bytes4(keccak256("isReadyForMinting(string)")),
                projectID
            )
        );
        require(ready, "Project not ready for minting");
        
        // Create message hash for multi-sig
        bytes32 messageHash = keccak256(abi.encodePacked(projectID, amount));
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        
        // Verify all three signatures
        require(
            recoverSigner(ethSignedMessageHash, verifierSignature) == verifierSigner,
            "Invalid verifier signature"
        );
        require(
            recoverSigner(ethSignedMessageHash, oracleSignature) == oracleSigner,
            "Invalid oracle signature"
        );
        require(
            recoverSigner(ethSignedMessageHash, adminSignature) == adminSigner,
            "Invalid admin signature"
        );
        
        // Get or create token ID for project
        uint256 tokenId = projectTokenIds[projectID];
        if (tokenId == 0) {
            tokenId = _nextTokenId++;
            projectTokenIds[projectID] = tokenId;
        }
        
        // Get project owner
        (bool success, bytes memory ownerData) = registry.staticcall(
            abi.encodeWithSelector(
                bytes4(keccak256("getProject(string)")),
                projectID
            )
        );
        require(success, "Failed to get project");
        (,,,, address owner,,,,) = abi.decode(ownerData, (string, bytes32, bytes32, address, address, uint256, bool, bool, string));
        
        // Mint tokens to project owner
        _mint(owner, tokenId, amount, "");
        
        // Mark carbon as minted in registry
        (bool mintSuccess, ) = registry.call(
            abi.encodeWithSelector(
                bytes4(keccak256("markCarbonMinted(string)")),
                projectID
            )
        );
        require(mintSuccess, "Failed to mark carbon as minted");
        
        emit CarbonMinted(tokenId, projectID, owner, amount);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint carbon credits for multiple projects
     */
    function batchMintCarbon(
        string[] memory projectIDs,
        uint256[] memory amounts,
        bytes[] memory verifierSignatures,
        bytes[] memory oracleSignatures,
        bytes[] memory adminSignatures
    ) external returns (uint256[] memory) {
        require(
            projectIDs.length == amounts.length &&
            projectIDs.length == verifierSignatures.length &&
            projectIDs.length == oracleSignatures.length &&
            projectIDs.length == adminSignatures.length,
            "Array length mismatch"
        );
        
        uint256[] memory tokenIds = new uint256[](projectIDs.length);
        
        for (uint256 i = 0; i < projectIDs.length; i++) {
            tokenIds[i] = mintCarbon(
                projectIDs[i],
                amounts[i],
                verifierSignatures[i],
                oracleSignatures[i],
                adminSignatures[i]
            );
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Retire carbon credits (for ESG claims)
     * Once retired, credits cannot be reused
     * @param amount Amount of credits to retire
     */
    function retire(uint256 amount) external {
        require(balanceOf(msg.sender, 1) >= amount, "Insufficient balance");
        
        _burn(msg.sender, 1, amount);
        retiredCredits[msg.sender] += amount;
        
        emit CreditsRetired(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Set multi-sig signers
     */
    function setSigners(
        address _verifierSigner,
        address _oracleSigner,
        address _adminSigner
    ) external onlyOwner {
        verifierSigner = _verifierSigner;
        oracleSigner = _oracleSigner;
        adminSigner = _adminSigner;
        
        emit SignersUpdated(_verifierSigner, _oracleSigner, _adminSigner);
    }
    
    /**
     * @dev Set token URI
     */
    function setTokenURI(uint256 tokenId, string memory uri) external onlyOwner {
        tokenURIs[tokenId] = uri;
    }
    
    /**
     * @dev Get token URI
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        if (bytes(tokenURIs[tokenId]).length > 0) {
            return tokenURIs[tokenId];
        }
        return "";
    }
    
    /**
     * @dev Recover signer from signature
     */
    function recoverSigner(bytes32 ethSignedMessageHash, bytes memory signature)
        public
        pure
        returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }
    
    /**
     * @dev Split signature into r, s, v
     */
    function splitSignature(bytes memory sig)
        public
        pure
        returns (bytes32 r, bytes32 s, uint8 v)
    {
        require(sig.length == 65, "Invalid signature length");
        
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}