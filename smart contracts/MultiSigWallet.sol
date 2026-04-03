// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title MultiSigWallet
 * @dev Multi-signature wallet requiring approval from Verifier, Admin, and Oracle
 */
contract MultiSigWallet is Ownable {
    using ECDSA for bytes32;
    
    // Required signers
    address public verifier;
    address public admin;
    address public oracle;
    
    // Transaction types
    enum TransactionType {
        MINT_CARBON,
        APPROVE_PROJECT,
        UPDATE_PRICE,
        EMERGENCY_PAUSE
    }
    
    // Transaction structure
    struct Transaction {
        uint256 id;
        TransactionType txType;
        bytes data;
        bool executed;
        mapping(address => bool) approvals;
        uint256 approvalCount;
    }
    
    // State
    mapping(uint256 => Transaction) public transactions;
    uint256 public transactionCount;
    uint256 public requiredApprovals = 3; // All 3 must approve
    
    // Events
    event TransactionCreated(uint256 indexed txId, TransactionType txType);
    event TransactionApproved(uint256 indexed txId, address indexed approver);
    event TransactionExecuted(uint256 indexed txId);
    event SignersUpdated(address verifier, address admin, address oracle);
    
    modifier onlySigner() {
        require(
            msg.sender == verifier || 
            msg.sender == admin || 
            msg.sender == oracle,
            "Not authorized"
        );
        _;
    }
    
    /**
     * @dev Constructor
     */
    constructor(address _verifier, address _admin, address _oracle) Ownable(msg.sender) {
        verifier = _verifier;
        admin = _admin;
        oracle = _oracle;
    }
    
    /**
     * @dev Submit a transaction for approval
     */
    function submitTransaction(TransactionType txType, bytes calldata data) 
        external 
        onlySigner 
        returns (uint256) 
    {
        uint256 txId = transactionCount++;
        Transaction storage tx = transactions[txId];
        
        tx.id = txId;
        tx.txType = txType;
        tx.data = data;
        tx.executed = false;
        tx.approvalCount = 0;
        
        emit TransactionCreated(txId, txType);
        return txId;
    }
    
    /**
     * @dev Approve a transaction
     */
    function approveTransaction(uint256 txId) external onlySigner {
        require(!transactions[txId].executed, "Already executed");
        require(!transactions[txId].approvals[msg.sender], "Already approved");
        
        transactions[txId].approvals[msg.sender] = true;
        transactions[txId].approvalCount++;
        
        emit TransactionApproved(txId, msg.sender);
        
        // Auto-execute if all approvals received
        if (transactions[txId].approvalCount == requiredApprovals) {
            executeTransaction(txId);
        }
    }
    
    /**
     * @dev Execute a transaction with all approvals
     */
    function executeTransaction(uint256 txId) public {
        require(!transactions[txId].executed, "Already executed");
        require(
            transactions[txId].approvalCount == requiredApprovals,
            "Insufficient approvals"
        );
        
        transactions[txId].executed = true;
        
        // Execute based on transaction type
        if (transactions[txId].txType == TransactionType.MINT_CARBON) {
            // Decode and execute mint operation
            (string memory projectID, uint256 amount) = abi.decode(
                transactions[txId].data,
                (string, uint256)
            );
            emit TransactionExecuted(txId);
        } else if (transactions[txId].txType == TransactionType.EMERGENCY_PAUSE) {
            // Emergency pause logic
            emit TransactionExecuted(txId);
        }
        
        emit TransactionExecuted(txId);
    }
    
    /**
     * @dev Get transaction details
     */
    function getTransaction(uint256 txId) 
        external 
        view 
        returns (
            uint256 id,
            TransactionType txType,
            bytes memory data,
            bool executed,
            uint256 approvalCount,
            bool verifierApproved,
            bool adminApproved,
            bool oracleApproved
        ) 
    {
        Transaction storage tx = transactions[txId];
        return (
            tx.id,
            tx.txType,
            tx.data,
            tx.executed,
            tx.approvalCount,
            tx.approvals[verifier],
            tx.approvals[admin],
            tx.approvals[oracle]
        );
    }
    
    /**
     * @dev Update signers
     */
    function updateSigners(
        address _verifier,
        address _admin,
        address _oracle
    ) external onlyOwner {
        verifier = _verifier;
        admin = _admin;
        oracle = _oracle;
        
        emit SignersUpdated(_verifier, _admin, _oracle);
    }
}