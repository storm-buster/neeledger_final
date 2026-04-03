# Installation Guide - Smart Contracts Only

## 📦 Files to Copy

Copy these files into your `blueledger-main/blueledger-main/contracts/` folder:

1. ✅ **CarbonRegistry.sol**
2. ✅ **CarbonCreditToken.sol**
3. ✅ **MultiSigWallet.sol**
4. ✅ **OracleConsumer.sol**
5. ✅ **MerkleTreeUtils.sol**

## 🔧 Setup Steps

### 1. Install Dependencies

```bash
cd blueledger-main/blueledger-main
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers ethers@6 @openzeppelin/contracts dotenv
```

### 2. Create Folders

```bash
mkdir -p contracts test scripts
```

### 3. Copy Files

Copy the 5 `.sol` files into the `contracts/` folder.

### 4. Copy Config Files

Copy these files to the root of your project:

- **hardhat.config.ts** → `blueledger-main/blueledger-main/hardhat.config.ts`
- **deploy.ts** → `blueledger-main/blueledger-main/scripts/deploy.ts`

### 5. Update package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "compile": "hardhat compile",
    "deploy": "hardhat run scripts/deploy.ts --network localhost",
    "deploy:sepolia": "hardhat run scripts/deploy.ts --network sepolia",
    "test": "hardhat test"
  }
}
```

## 🚀 Deployment

### Local Deployment

```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy contracts
npm run compile
npm run deploy
```

### Testnet Deployment

```bash
# Create .env file with:
# SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
# PRIVATE_KEY=your_private_key

npm run deploy:sepolia
```

## ✅ Verification

After deployment, check:

```bash
npx hardhat console --network localhost
```

Then run:

```javascript
const CarbonRegistry = await ethers.getContractFactory("CarbonRegistry");
const registry = CarbonRegistry.attach("YOUR_REGISTRY_ADDRESS");
const totalProjects = await registry.totalProjects();
console.log("Total Projects:", totalProjects.toString());
```

## 📋 Contract Addresses

After deployment, addresses will be saved to:
- `deployments/latest.json`
- `deployments/localhost-TIMESTAMP.json`

## 🎯 Smart Contract Features

### CarbonRegistry
- ✅ Project registration with unique IDs
- ✅ Anti-double counting mechanism
- ✅ Immutable data hashes (SHA-256)
- ✅ Merkle tree optimization
- ✅ Role-based access control

### CarbonCreditToken
- ✅ ERC-1155 standard
- ✅ 1 token = 1 ton CO₂
- ✅ Multi-signature minting
- ✅ Lifecycle management (Mint → Transfer → Retire)

### MultiSigWallet
- ✅ 3-party approval system
- ✅ Transaction queuing
- ✅ Emergency pause mechanism

### OracleConsumer
- ✅ NDVI verification requests
- ✅ Carbon calculation approvals
- ✅ Cryptographic proof generation

### MerkleTreeUtils
- ✅ Merkle root registration
- ✅ Proof verification
- ✅ Batch operations
- ✅ Data integrity verification

## 💡 Usage Example

```javascript
// In Hardhat console or frontend:

// 1. Register a project
await registry.registerProject(
  "MY-PROJECT-001",
  "0x" + "1".repeat(64),
  "0x" + "2".repeat(64),
  "ipfs://Qm..."
);

// 2. Verify project
await registry.verifyProject("MY-PROJECT-001");

// 3. Calculate carbon credits
const credits = await oracle.calculateCarbonCredits(
  100, // AGB (tons/ha)
  34,  // BGB (tons/ha)
  50,  // SOC (tons/ha)
  1    // Area (ha)
);

// 4. Mint carbon credits (with signatures)
await token.mintCarbon(
  "MY-PROJECT-001",
  credits,
  verifierSignature,
  oracleSignature,
  adminSignature
);

// 5. Retire credits
await token.retire(100); // Retire 100 credits
```

## ❓ Troubleshooting

**Error: "Cannot find module 'hardhat'"**
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

**Error: "Compiler error"**
```bash
npm run compile
```

**Error: "Network not found"**
```bash
npx hardhat node  # Start in another terminal
```

## 🎉 Done!

Your smart contracts are now ready to use. Deploy them and start managing carbon credits on the blockchain! 🌍💚