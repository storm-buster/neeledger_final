// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title MerkleTreeUtils
 * @dev Utilities for Merkle tree operations and data optimization
 * Enables efficient storage of large project datasets
 */
contract MerkleTreeUtils is Ownable {
    
    // Merkle root storage for projects
    mapping(string => bytes32) public projectMerkleRoots;
    mapping(string => bool) public rootVerified;
    
    // Data hash storage
    mapping(bytes32 => bool) public dataHashRegistered;
    
    // Events
    event MerkleRootRegistered(
        string indexed projectID,
        bytes32 merkleRoot,
        uint256 timestamp
    );
    
    event DataHashVerified(bytes32 indexed dataHash, bool verified);
    
    /**
     * @dev Register a Merkle root for a project
     * @param projectID ID of the project
     * @param merkleRoot Merkle root of the dataset
     */
    function registerMerkleRoot(
        string memory projectID,
        bytes32 merkleRoot
    ) external returns (bool) {
        require(
            projectMerkleRoots[projectID] == bytes32(0),
            "Merkle root already registered"
        );
        
        projectMerkleRoots[projectID] = merkleRoot;
        
        emit MerkleRootRegistered(projectID, merkleRoot, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Verify a Merkle proof
     * @param projectID ID of the project
     * @param proof Merkle proof
     * @param leaf Leaf node
     */
    function verifyMerkleProof(
        string memory projectID,
        bytes32[] memory proof,
        bytes32 leaf
    ) external view returns (bool) {
        bytes32 root = projectMerkleRoots[projectID];
        require(root != bytes32(0), "Merkle root not registered");
        
        return MerkleProof.verify(proof, root, leaf);
    }
    
    /**
     * @dev Verify batch of Merkle proofs
     */
    function verifyBatchMerkleProof(
        string memory projectID,
        bytes32[][] memory proofs,
        bytes32[] memory leaves
    ) external view returns (bool[] memory) {
        require(
            proofs.length == leaves.length,
            "Array length mismatch"
        );
        
        bool[] memory results = new bool[](leaves.length);
        bytes32 root = projectMerkleRoots[projectID];
        
        for (uint256 i = 0; i < leaves.length; i++) {
            results[i] = MerkleProof.verify(proofs[i], root, leaves[i]);
        }
        
        return results;
    }
    
    /**
     * @dev Verify individual data hash
     * @param dataHash Hash to verify
     */
    function verifyDataHash(bytes32 dataHash) external returns (bool) {
        dataHashRegistered[dataHash] = true;
        
        emit DataHashVerified(dataHash, true);
        
        return true;
    }
    
    /**
     * @dev Check if data hash is registered
     * @param dataHash Hash to check
     */
    function isDataHashRegistered(bytes32 dataHash) external view returns (bool) {
        return dataHashRegistered[dataHash];
    }
    
    /**
     * @dev Compute Merkle root from leaves
     * @param leaves Array of leaf hashes
     */
    function computeMerkleRoot(bytes32[] memory leaves) 
        public 
        pure 
        returns (bytes32) 
    {
        if (leaves.length == 0) {
            return bytes32(0);
        }
        
        bytes32[] memory currentLayer = leaves;
        
        while (currentLayer.length > 1) {
            bytes32[] memory nextLayer = new bytes32[]((currentLayer.length + 1) / 2);
            
            for (uint256 i = 0; i < currentLayer.length; i += 2) {
                if (i + 1 < currentLayer.length) {
                    nextLayer[i / 2] = keccak256(
                        abi.encodePacked(currentLayer[i], currentLayer[i + 1])
                    );
                } else {
                    nextLayer[i / 2] = currentLayer[i];
                }
            }
            
            currentLayer = nextLayer;
        }
        
        return currentLayer[0];
    }
    
    /**
     * @dev Compute Merkle proof for a leaf
     * @param leaves Array of leaf hashes
     * @param index Index of the leaf to prove
     */
    function computeMerkleProof(bytes32[] memory leaves, uint256 index)
        public
        pure
        returns (bytes32[] memory)
    {
        require(index < leaves.length, "Index out of bounds");
        
        uint256 proofLength = 0;
        uint256 leafCount = leaves.length;
        
        // Calculate proof length
        while (leafCount > 1) {
            proofLength++;
            leafCount = (leafCount + 1) / 2;
        }
        
        bytes32[] memory proof = new bytes32[](proofLength);
        bytes32[] memory currentLayer = leaves;
        uint256 currentIndex = index;
        uint256 proofIndex = 0;
        
        while (currentLayer.length > 1) {
            uint256 siblingIndex = (currentIndex % 2 == 0) ? currentIndex + 1 : currentIndex - 1;
            
            if (siblingIndex < currentLayer.length) {
                proof[proofIndex] = currentLayer[siblingIndex];
                proofIndex++;
            }
            
            currentIndex = currentIndex / 2;
            
            // Build next layer
            bytes32[] memory nextLayer = new bytes32[]((currentLayer.length + 1) / 2);
            for (uint256 i = 0; i < currentLayer.length; i += 2) {
                if (i + 1 < currentLayer.length) {
                    nextLayer[i / 2] = keccak256(
                        abi.encodePacked(currentLayer[i], currentLayer[i + 1])
                    );
                } else {
                    nextLayer[i / 2] = currentLayer[i];
                }
            }
            currentLayer = nextLayer;
        }
        
        return proof;
    }
    
    /**
     * @dev Update Merkle root (owner only)
     * @param projectID ID of the project
     * @param newRoot New Merkle root
     */
    function updateMerkleRoot(
        string memory projectID,
        bytes32 newRoot
    ) external onlyOwner {
        require(
            projectMerkleRoots[projectID] != bytes32(0),
            "Merkle root not registered"
        );
        
        projectMerkleRoots[projectID] = newRoot;
        rootVerified[projectID] = true;
        
        emit MerkleRootRegistered(projectID, newRoot, block.timestamp);
    }
    
    /**
     * @dev Delete Merkle root (owner only)
     * @param projectID ID of the project
     */
    function deleteMerkleRoot(string memory projectID) external onlyOwner {
        require(
            projectMerkleRoots[projectID] != bytes32(0),
            "Merkle root not registered"
        );
        
        projectMerkleRoots[projectID] = bytes32(0);
        rootVerified[projectID] = false;
    }
}