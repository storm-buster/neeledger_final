// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OracleConsumer
 * @dev Oracle integration for NDVI verification and carbon calculation approval
 * Chainlink-style oracle model
 */
contract OracleConsumer is Ownable {
    
    // Oracle interface
    address public oracleAddress;
    
    // Request structure
    struct OracleRequest {
        bytes32 requestId;
        address requester;
        string projectID;
        bytes32 dataHash;
        bool fulfilled;
        uint256 timestamp;
    }
    
    // Oracle response structure
    struct OracleResponse {
        bool ndviVerified;
        bool carbonCalculationApproved;
        uint256 carbonCredits;
        bytes32 proof;
    }
    
    // State
    mapping(bytes32 => OracleRequest) public requests;
    mapping(bytes32 => OracleResponse) public responses;
    
    // Approved oracle operators
    mapping(address => bool) public approvedOracles;
    
    // Counters
    uint256 public requestCount;
    
    // Events
    event RequestSubmitted(
        bytes32 indexed requestId,
        address indexed requester,
        string projectID
    );
    
    event RequestFulfilled(
        bytes32 indexed requestId,
        bool ndviVerified,
        uint256 carbonCredits
    );
    
    event OracleApproved(address indexed oracle, bool approved);
    
    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {
        approvedOracles[msg.sender] = true;
    }
    
    /**
     * @dev Submit oracle request for NDVI verification
     * @param projectID ID of the project
     * @param dataHash Hash of project data
     */
    function requestNDVIVerification(
        string memory projectID,
        bytes32 dataHash
    ) external returns (bytes32) {
        bytes32 requestId = keccak256(abi.encodePacked(
            msg.sender,
            projectID,
            dataHash,
            block.timestamp,
            requestCount++
        ));
        
        requests[requestId] = OracleRequest({
            requestId: requestId,
            requester: msg.sender,
            projectID: projectID,
            dataHash: dataHash,
            fulfilled: false,
            timestamp: block.timestamp
        });
        
        emit RequestSubmitted(requestId, msg.sender, projectID);
        
        return requestId;
    }
    
    /**
     * @dev Request carbon calculation approval
     * @param projectID ID of the project
     * @param dataHash Hash of project data
     */
    function requestCarbonCalculation(
        string memory projectID,
        bytes32 dataHash
    ) external returns (bytes32) {
        bytes32 requestId = keccak256(abi.encodePacked(
            msg.sender,
            projectID,
            dataHash,
            block.timestamp,
            requestCount++
        ));
        
        requests[requestId] = OracleRequest({
            requestId: requestId,
            requester: msg.sender,
            projectID: projectID,
            dataHash: dataHash,
            fulfilled: false,
            timestamp: block.timestamp
        });
        
        emit RequestSubmitted(requestId, msg.sender, projectID);
        
        return requestId;
    }
    
    /**
     * @dev Fulfill oracle request (only approved oracles)
     * @param requestId ID of the request
     * @param ndviVerified NDVI verification result
     * @param carbonCalculationApproved Carbon calculation approval
     * @param carbonCredits Calculated carbon credits
     * @param proof Cryptographic proof
     */
    function fulfillRequest(
        bytes32 requestId,
        bool ndviVerified,
        bool carbonCalculationApproved,
        uint256 carbonCredits,
        bytes32 proof
    ) external {
        require(approvedOracles[msg.sender], "Not approved oracle");
        require(!requests[requestId].fulfilled, "Request already fulfilled");
        
        // Store response
        responses[requestId] = OracleResponse({
            ndviVerified: ndviVerified,
            carbonCalculationApproved: carbonCalculationApproved,
            carbonCredits: carbonCredits,
            proof: proof
        });
        
        requests[requestId].fulfilled = true;
        
        emit RequestFulfilled(requestId, ndviVerified, carbonCredits);
    }
    
    /**
     * @dev Get request details
     */
    function getRequest(bytes32 requestId)
        external
        view
        returns (
            bytes32 requestIdOut,
            address requester,
            string memory projectID,
            bytes32 dataHash,
            bool fulfilled,
            uint256 timestamp
        )
    {
        OracleRequest memory request = requests[requestId];
        return (
            request.requestId,
            request.requester,
            request.projectID,
            request.dataHash,
            request.fulfilled,
            request.timestamp
        );
    }
    
    /**
     * @dev Get response details
     */
    function getResponse(bytes32 requestId)
        external
        view
        returns (
            bool ndviVerified,
            bool carbonCalculationApproved,
            uint256 carbonCredits,
            bytes32 proof
        )
    {
        OracleResponse memory response = responses[requestId];
        return (
            response.ndviVerified,
            response.carbonCalculationApproved,
            response.carbonCredits,
            response.proof
        );
    }
    
    /**
     * @dev Approve an oracle
     * @param oracle Address of the oracle
     * @param approved Approval status
     */
    function approveOracle(address oracle, bool approved) external onlyOwner {
        approvedOracles[oracle] = approved;
        emit OracleApproved(oracle, approved);
    }
    
    /**
     * @dev Calculate carbon credits using standard formula
     * Carbon Credits = (AGB + BGB + SOC) × 0.47 × 3.67 × Area
     * where:
     * AGB = Above Ground Biomass (tons/ha)
     * BGB = Below Ground Biomass (34% of AGB)
     * SOC = Soil Organic Carbon (tons/ha)
     * Area = Project area (hectares)
     * 0.47 = Carbon fraction of biomass
     * 3.67 = Conversion factor (C to CO2)
     */
    function calculateCarbonCredits(
        uint256 agb,
        uint256 bgb,
        uint256 soc,
        uint256 area
    ) public pure returns (uint256) {
        // Total biomass in tons
        uint256 totalBiomass = agb + bgb + soc;
        
        // Convert to carbon (47% of biomass is carbon)
        uint256 carbonStock = totalBiomass * 47 / 100;
        
        // Convert to CO2 equivalent (multiply by 3.67)
        uint256 co2Equivalent = carbonStock * 367 / 100;
        
        // Multiply by area
        uint256 totalCredits = co2Equivalent * area;
        
        return totalCredits;
    }
}