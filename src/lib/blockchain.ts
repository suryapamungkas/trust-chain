// =====================================================================
// TrustChain UMKM — Blockchain Service
// Local blockchain operations using ethers.js for real hash generation
// =====================================================================

import { ethers } from "ethers";

// Generate a local wallet for the platform (no real testnet needed for demo)
const PLATFORM_PRIVATE_KEY = process.env.PLATFORM_WALLET_KEY || ethers.Wallet.createRandom().privateKey;
const platformWallet = new ethers.Wallet(PLATFORM_PRIVATE_KEY);

export interface BlockchainRecord {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  data: string;
  signature: string;
  verified: boolean;
}

/**
 * Generate a real blockchain-verifiable hash for product data
 * Uses ethers.js to create EIP-191 signed messages
 */
export async function hashProductData(productData: {
  productId: string;
  name: string;
  umkmId: string;
  origin: string;
  category: string;
  certifications: string[];
  rawMaterials: string[];
}): Promise<BlockchainRecord> {
  const dataString = JSON.stringify({
    ...productData,
    timestamp: new Date().toISOString(),
    platform: "TrustChain UMKM",
    version: "1.0",
  });

  const dataHash = ethers.keccak256(ethers.toUtf8Bytes(dataString));
  const signature = await platformWallet.signMessage(dataHash);

  return {
    txHash: dataHash,
    blockNumber: Math.floor(Date.now() / 1000),
    timestamp: new Date().toISOString(),
    from: platformWallet.address,
    data: dataString,
    signature,
    verified: true,
  };
}

/**
 * Verify a signed message against our platform wallet
 */
export function verifySignature(message: string, signature: string): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress === platformWallet.address;
  } catch {
    return false;
  }
}

/**
 * Generate supply chain step hash (chain of hashes)
 */
export async function hashSupplyChainStep(step: {
  productHash: string;
  stepName: string;
  location: string;
  actor: string;
  previousHash?: string;
}): Promise<BlockchainRecord> {
  const dataString = JSON.stringify({
    ...step,
    timestamp: new Date().toISOString(),
    nonce: Math.random().toString(36).substring(2),
  });

  const dataHash = ethers.keccak256(ethers.toUtf8Bytes(dataString));
  const signature = await platformWallet.signMessage(dataHash);

  return {
    txHash: dataHash,
    blockNumber: Math.floor(Date.now() / 1000),
    timestamp: new Date().toISOString(),
    from: platformWallet.address,
    data: dataString,
    signature,
    verified: true,
  };
}

/**
 * Generate certification hash
 */
export async function hashCertification(cert: {
  productId: string;
  certName: string;
  issuer: string;
  validUntil: string;
}): Promise<BlockchainRecord> {
  const dataString = JSON.stringify({
    ...cert,
    timestamp: new Date().toISOString(),
    type: "certification",
  });

  const dataHash = ethers.keccak256(ethers.toUtf8Bytes(dataString));
  const signature = await platformWallet.signMessage(dataHash);

  return {
    txHash: dataHash,
    blockNumber: Math.floor(Date.now() / 1000),
    timestamp: new Date().toISOString(),
    from: platformWallet.address,
    data: dataString,
    signature,
    verified: true,
  };
}

/**
 * Generate wallet address for a new UMKM
 */
export function generateWalletAddress(): { address: string; privateKey: string } {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

/**
 * Get the platform wallet info
 */
export function getPlatformInfo() {
  return {
    address: platformWallet.address,
    network: "TrustChain Local Network",
    chainId: 2026,
    blockHeight: Math.floor(Date.now() / 1000),
  };
}

/**
 * Simulate smart contract execution
 */
export async function executeSmartContract(contractType: string, params: Record<string, unknown>): Promise<{
  success: boolean;
  txHash: string;
  gasUsed: number;
  result: string;
}> {
  const dataString = JSON.stringify({
    contractType,
    params,
    executor: platformWallet.address,
    timestamp: new Date().toISOString(),
  });

  const txHash = ethers.keccak256(ethers.toUtf8Bytes(dataString));

  // Simulate gas cost
  const gasUsed = 21000 + Math.floor(JSON.stringify(params).length * 68);

  return {
    success: true,
    txHash,
    gasUsed,
    result: `Contract ${contractType} executed successfully`,
  };
}
