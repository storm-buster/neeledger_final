// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CarbonRegistry
 * @dev Registry for carbon credit projects with anti-double counting mechanism
 * Implements immutable data storage with Merkle tree optimization
 */
contract CarbonRegistry is Ownable, ReentrancyGuard {
    
    // Struct to store project information
    struct Project {
        string projectID;          // Unique project identifier
        bytes32 dataHash;          // Immutable SHA-256 hash of project data
        bytes32 merkleRoot;        // Merkle root for large datasets
        address owner;             // Project owner address
        address verifier;          // Approved verifier address
        uint256 timestamp;         // Registration timestamp
        bool verified;             // Verification status
        bool carbonMinted;         // Anti-double counting flag
        string metadataURI;        // IPFS/off-chain storage URI
    }
    
    // Mappings
    mapping(string => Project) public projects;
    mapping(address => bool) public approvedVerifiers;
    mapping(address => bool) public admins;
    
    // Counters
    uint256 public totalProjects;
    uint256 public totalVerified;
    
    // Events
    event ProjectRegistered(
        string indexed projectID,
        bytes32 dataHash,
        bytes32 merkleRoot,
        address indexed owner,
        address indexed verifier,
        uint256 timestamp
    );
    
    event ProjectVerified(
        string indexed projectID,
        address indexed verifier,
        uint256 timestamp
    );
    
    event VerifierApproved(address indexed verifier, bool status);
    event AdminApproved(address indexed admin, bool status);
    
    event CarbonMinted(string indexed projectID, uint256 timestamp);
    
    // Modifiers
    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admin can perform this action");
        _;
    }
    
    modifier onlyVerifier() {
        require(approvedVerifiers[msg.sender], "Only approved verifier can perform this action");
        _;
    }
    
    modifier projectExists(string memory projectID) {
        require(bytes(projects[projectID].projectID).length > 0, "Project does not exist");
        _;
    }
    
    /**
     * @dev Constructor to deploy the registry
     */
    constructor() Ownable(msg.sender) {
        admins[msg.sender] = true;
        emit AdminApproved(msg.sender, true);
    }
    
    /**
     * @dev Register a new carbon project
     * @param projectID Unique identifier for the project
     * @param dataHash SHA-256 hash of project data (immutable)
     * @param merkleRoot Merkle root for dataset optimization
     * @param metadataURI URI for off-chain data storage
     */
    function registerProject(
        string memory projectID,
        bytes32 dataHash,
        bytes32 merkleRoot,
        string memory metadataURI
    ) external nonReentrant returns (uint256) {
        // Check if project already exists (anti-double counting)
        require(bytes(projects[projectID].projectID).length == 0, "Project already registered");
        
        // Store project data
        projects[projectID] = Project({
            projectID: projectID,
            dataHash: dataHash,
            merkleRoot: merkleRoot,
            owner: msg.sender,
            verifier: address(0),
            timestamp: block.timestamp,
            verified: false,
            carbonMinted: false,
            metadataURI: metadataURI
        });
        
        totalProjects++;
        
        emit ProjectRegistered(
            projectID,
            dataHash,
            merkleRoot,
            msg.sender,
            address(0),
            block.timestamp
        );
        
        return totalProjects - 1;
    }
    
    /**
     * @dev Verify a project (only by approved verifiers)
     * @param projectID ID of the project to verify
     */
    function verifyProject(string memory projectID) 
        external 
        onlyVerifier 
        projectExists(projectID) 
        nonReentrant 
    {
        require(!projects[projectID].verified, "Project already verified");
        
        projects[projectID].verified = true;
        projects[projectID].verifier = msg.sender;
        totalVerified++;
        
        emit ProjectVerified(projectID, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Get project details
     * @param projectID ID of the project
     */
    function getProject(string memory projectID) 
        external 
        view 
        projectExists(projectID)
        returns (
            string memory,
            bytes32,
            bytes32,
            address,
            address,
            uint256,
            bool,
            bool,
            string memory
        ) 
    {
        Project memory project = projects[projectID];
        return (
            project.projectID,
            project.dataHash,
            project.merkleRoot,
            project.owner,
            project.verifier,
            project.timestamp,
            project.verified,
            project.carbonMinted,
            project.metadataURI
        );
    }
    
    /**
     * @dev Check if project is ready for carbon minting
     * @param projectID ID of the project
     */
    function isReadyForMinting(string memory projectID) 
        external 
        view 
        projectExists(projectID)
        returns (bool) 
    {
        return projects[projectID].verified && !projects[projectID].carbonMinted;
    }
    
    /**
     * @dev Mark carbon as minted (called by token contract)
     * @param projectID ID of the project
     */
    function markCarbonMinted(string memory projectID) 
        external 
        projectExists(projectID) 
    {
        require(projects[projectID].verified, "Project not verified");
        require(!projects[projectID].carbonMinted, "Carbon already minted");
        
        projects[projectID].carbonMinted = true;
        
        emit CarbonMinted(projectID, block.timestamp);
    }
    
    /**
     * @dev Approve a verifier
     * @param verifier Address of the verifier
     * @param approved Approval status
     */
    function approveVerifier(address verifier, bool approved) 
        external 
        onlyAdmin 
    {
        approvedVerifiers[verifier] = approved;
        emit VerifierApproved(verifier, approved);
    }
    
    /**
     * @dev Approve an admin
     * @param admin Address of the admin
     * @param approved Approval status
     */
    function approveAdmin(address admin, bool approved) 
        external 
        onlyOwner 
    {
        admins[admin] = approved;
        emit AdminApproved(admin, approved);
    }
}