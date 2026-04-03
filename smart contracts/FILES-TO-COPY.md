# 📁 Files to Copy - Smart Contracts Only

## 📋 Complete File List

Here are ALL the files you need to copy to your blueledger-main project:

### 📜 Smart Contracts (5 files)
**Destination:** `blueledger-main/blueledger-main/contracts/`

1. ✅ **CarbonRegistry.sol**
2. ✅ **CarbonCreditToken.sol**
3. ✅ **MultiSigWallet.sol**
4. ✅ **OracleConsumer.sol**
5. ✅ **MerkleTreeUtils.sol**

### ⚙️ Configuration Files (2 files)
**Destination:** `blueledger-main/blueledger-main/`

6. ✅ **hardhat.config.ts**
7. ✅ **scripts/deploy.ts**

## 🚀 Quick Start

### Step 1: Copy Smart Contracts
Copy the 5 `.sol` files into: `blueledger-main/blueledger-main/contracts/`

### Step 2: Copy Config Files
- Copy `hardhat.config.ts` to: `blueledger-main/blueledger-main/hardhat.config.ts`
- Create `scripts/` folder if it doesn't exist
- Copy `deploy.ts` to: `blueledger-main/blueledger-main/scripts/deploy.ts`

### Step 3: Install Dependencies
```bash
cd blueledger-main/blueledger-main
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers ethers@6 @openzeppelin/contracts dotenv
```

### Step 4: Update package.json
Add these scripts:
```json
"scripts": {
  "compile": "hardhat compile",
  "deploy": "hardhat run scripts/deploy.ts --network localhost",
  "deploy:sepolia": "hardhat run scripts/deploy.ts --network sepolia",
  "test": "hardhat test"
}
```

### Step 5: Deploy
```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy contracts
npm run compile
npm run deploy
```

## ✅ That's It!

Your smart contracts are now ready to use! All files are self-contained and will work immediately after installation.

## 📊 What Each Contract Does

| Contract | Purpose |
|----------|---------|
| **CarbonRegistry** | Register projects, prevent double counting |
| **CarbonCreditToken** | ERC-1155 token, 1 token = 1 ton CO₂ |
| **MultiSigWallet** | 3-party approval system |
| **OracleConsumer** | NDVI verification, carbon calculations |
| **MerkleTreeUtils** | Efficient data storage with Merkle trees |

## 💡 Key Features

✅ Anti-double counting mechanism
✅ Multi-signature security (Verifier + Admin + Oracle)
✅ Oracle integration for verification
✅ Merkle tree optimization
✅ ERC-1155 token standard
✅ Complete lifecycle management

## 🎯 Testing After Deployment

```javascript
// In Hardhat console:
const CarbonRegistry = await ethers.getContractFactory("CarbonRegistry");
const registry = CarbonRegistry.attach("YOUR_REGISTRY_ADDRESS");

// Register a project
await registry.registerProject(
  "TEST-001",
  "0x" + "1".repeat(64),
  "0x" + "2".repeat(64),
  "ipfs://test"
);

// Check it worked
const project = await registry.getProject("TEST-001");
console.log("Project:", project);
```

## 🎉 Ready!

Just copy, install, and deploy. Everything works out of the box!