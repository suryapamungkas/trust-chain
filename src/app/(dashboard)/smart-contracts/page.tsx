/* eslint-disable react-hooks/purity */
"use client";

import { useState } from "react";
import Topbar from "@/components/Topbar";
import { StatusBadge, BlockchainHash, ProgressBar } from "@/components/UIComponents";
import { mockSmartContracts, formatNumber } from "@/lib/database";

const solidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TrustChainUMKM
 * @dev Smart contract untuk manajemen supply chain UMKM Indonesia
 * @author TrustChain UMKM Team
 */
contract TrustChainUMKM is Ownable, ReentrancyGuard {
    
    // ==================== STRUCTS ====================
    
    struct Product {
        bytes32 productId;
        string ipfsHash;        // Metadata di IPFS
        address umkmAddress;
        uint256 qualityScore;   // 0-100
        bool exportEligible;
        ProductStatus status;
        uint256 createdAt;
        uint256 lastUpdated;
    }
    
    struct SupplyChainStep {
        string description;
        string location;
        address actor;
        bytes32 txHash;
        bool verified;
        uint256 timestamp;
    }
    
    struct Certification {
        bytes32 certId;
        string name;
        address issuer;
        uint256 validUntil;
        bool isValid;
    }
    
    // ==================== ENUMS ====================
    
    enum ProductStatus { 
        Active, 
        InTransit, 
        Delivered, 
        Exported 
    }
    
    // ==================== EVENTS ====================
    
    event ProductRegistered(
        bytes32 indexed productId, 
        address indexed umkm, 
        uint256 timestamp
    );
    
    event SupplyChainUpdated(
        bytes32 indexed productId, 
        string step, 
        address indexed actor
    );
    
    event CertificationVerified(
        bytes32 indexed productId, 
        bytes32 certId, 
        bool isValid
    );
    
    event QualityScoreUpdated(
        bytes32 indexed productId, 
        uint256 newScore
    );
    
    event ExportApproved(
        bytes32 indexed productId, 
        address indexed umkm
    );
    
    // ==================== STATE ====================
    
    mapping(bytes32 => Product) public products;
    mapping(bytes32 => SupplyChainStep[]) public supplyChain;
    mapping(bytes32 => Certification[]) public certifications;
    mapping(address => bool) public authorizedVerifiers;
    mapping(address => bytes32[]) public umkmProducts;
    
    uint256 public totalProducts;
    uint256 public totalVerifiedProducts;
    
    // ==================== MODIFIERS ====================
    
    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender], "Not authorized verifier");
        _;
    }
    
    modifier productExists(bytes32 productId) {
        require(products[productId].createdAt != 0, "Product not found");
        _;
    }
    
    // ==================== FUNCTIONS ====================
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Daftarkan produk baru ke blockchain
     */
    function registerProduct(
        bytes32 productId,
        string memory ipfsHash,
        uint256 initialQualityScore
    ) external {
        require(products[productId].createdAt == 0, "Product already exists");
        require(initialQualityScore <= 100, "Invalid score");
        
        products[productId] = Product({
            productId: productId,
            ipfsHash: ipfsHash,
            umkmAddress: msg.sender,
            qualityScore: initialQualityScore,
            exportEligible: false,
            status: ProductStatus.Active,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        umkmProducts[msg.sender].push(productId);
        totalProducts++;
        
        emit ProductRegistered(productId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Tambah langkah supply chain
     */
    function addSupplyChainStep(
        bytes32 productId,
        string memory description,
        string memory location
    ) external productExists(productId) {
        supplyChain[productId].push(SupplyChainStep({
            description: description,
            location: location,
            actor: msg.sender,
            txHash: keccak256(abi.encodePacked(block.timestamp, msg.sender)),
            verified: false,
            timestamp: block.timestamp
        }));
        
        products[productId].lastUpdated = block.timestamp;
        emit SupplyChainUpdated(productId, description, msg.sender);
    }
    
    /**
     * @dev Verifikasi sertifikasi produk (otomatis via smart contract)
     */
    function verifyCertification(
        bytes32 productId,
        bytes32 certId,
        string memory certName,
        uint256 validUntil
    ) external onlyVerifier productExists(productId) {
        bool isValid = validUntil > block.timestamp;
        
        certifications[productId].push(Certification({
            certId: certId,
            name: certName,
            issuer: msg.sender,
            validUntil: validUntil,
            isValid: isValid
        }));
        
        if (isValid) {
            _updateExportEligibility(productId);
        }
        
        emit CertificationVerified(productId, certId, isValid);
    }
    
    /**
     * @dev Update skor kualitas via AI oracle
     */
    function updateQualityScore(
        bytes32 productId,
        uint256 newScore
    ) external onlyVerifier productExists(productId) {
        require(newScore <= 100, "Invalid score");
        products[productId].qualityScore = newScore;
        products[productId].lastUpdated = block.timestamp;
        
        if (newScore >= 75) {
            _updateExportEligibility(productId);
        }
        
        emit QualityScoreUpdated(productId, newScore);
    }
    
    /**
     * @dev Cek dan update eligibilitas ekspor
     */
    function _updateExportEligibility(bytes32 productId) internal {
        Product storage product = products[productId];
        bool eligible = product.qualityScore >= 75 && 
                       certifications[productId].length >= 2;
        
        if (eligible && !product.exportEligible) {
            product.exportEligible = true;
            totalVerifiedProducts++;
            emit ExportApproved(productId, product.umkmAddress);
        }
    }
}`;

export default function SmartContractsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "code" | "interact">("overview");
  const [selectedContract, setSelectedContract] = useState(mockSmartContracts[0]);
  const [callResult, setCallResult] = useState("");
  const [calling, setCalling] = useState(false);

  const simulateCall = async (functionName: string) => {
    setCalling(true);
    setCallResult("");
    await new Promise((r) => setTimeout(r, 1500));
     
    const results: Record<string, string> = {
      registerProduct: `✅ Transaction successful!\nTx Hash: 0x${Math.random().toString(16).slice(2, 42)}\nGas Used: 68,421\nBlock: ${(18945231 + Math.floor(Math.random() * 100)).toLocaleString()}\nProduct registered on Ethereum mainnet.`,
      verifyCertification: `✅ Certification verified!\nTx Hash: 0x${Math.random().toString(16).slice(2, 42)}\nCert ID: CERT-${Math.floor(Math.random() * 9999)}\nValid Until: 2026-12-31\nExport eligibility updated: TRUE`,
      updateQualityScore: `✅ Quality score updated!\nTx Hash: 0x${Math.random().toString(16).slice(2, 42)}\nNew Score: 94/100\nExport Eligible: TRUE\nAI Oracle confirmed.`,
      addSupplyChainStep: `✅ Supply chain step recorded!\nTx Hash: 0x${Math.random().toString(16).slice(2, 42)}\nStep: "Quality Control"\nLocation: Solo, Jawa Tengah\nTimestamp: ${new Date().toISOString()}`,
    };
    setCallResult(results[functionName] || "✅ Function called successfully!");
    setCalling(false);
  };

  return (
    <>
      <Topbar title="Smart Contracts" subtitle="Manajemen kontrak pintar Ethereum untuk otomasi supply chain" />

      <div className="p-6 space-y-6">
        {/* Contract List */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {mockSmartContracts.map((sc) => (
            <div
              key={sc.id}
              onClick={() => setSelectedContract(sc)}
              className={`glass-card p-4 cursor-pointer transition-all ${
                selectedContract.id === sc.id ? "border-2 border-indigo-500" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <StatusBadge status={sc.status} />
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}
                >
                  {sc.type.toUpperCase()}
                </span>
              </div>
              <div className="text-sm font-bold text-[var(--text-primary)] mb-1">{sc.name}</div>
              <BlockchainHash hash={sc.address} />
              <div className="mt-3 space-y-1.5">
                <ProgressBar value={sc.successRate} color="#10b981" label="Success Rate" />
                <div className="text-xs text-[var(--text-muted)]">
                  {formatNumber(sc.triggered)} calls total
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contract Detail */}
        <div className="glass-card">
          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: "var(--border-color)" }}>
            {(["overview", "code", "interact"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-6 py-4 text-sm font-semibold capitalize transition-all"
                style={{
                  color: activeTab === tab ? "#818cf8" : "#94a3b8",
                  borderBottom: activeTab === tab ? "2px solid #6366f1" : "2px solid transparent",
                }}
              >
                {tab === "overview" ? "📊 Overview" : tab === "code" ? "💻 Solidity Code" : "⚡ Interact"}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">{selectedContract.name}</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Contract Address", value: <BlockchainHash hash={selectedContract.address} truncate={false} /> },
                      { label: "Type", value: <span className="badge badge-primary">{selectedContract.type}</span> },
                      { label: "Status", value: <StatusBadge status={selectedContract.status} /> },
                      { label: "Total Calls", value: <span className="font-bold text-[var(--text-primary)]">{formatNumber(selectedContract.triggered)}</span> },
                      { label: "Success Rate", value: <span className="font-bold text-emerald-400">{selectedContract.successRate}%</span> },
                      { label: "Deployed At", value: <span className="text-sm text-[var(--text-secondary)]">{new Date(selectedContract.deployedAt).toLocaleDateString("id-ID")}</span> },
                      { label: "Last Triggered", value: <span className="text-sm text-[var(--text-secondary)]">{new Date(selectedContract.lastTriggered).toLocaleString("id-ID")}</span> },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--bg-tertiary)" }}>
                        <span className="text-xs text-[var(--text-muted)]">{label}</span>
                        <div className="text-right">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">Fungsi Utama</h3>
                  <div className="space-y-2">
                    {[
                      { fn: "registerProduct()", desc: "Daftar produk baru ke blockchain", type: "write" },
                      { fn: "addSupplyChainStep()", desc: "Catat langkah supply chain", type: "write" },
                      { fn: "verifyCertification()", desc: "Verifikasi sertifikasi otomatis", type: "write" },
                      { fn: "updateQualityScore()", desc: "Update skor kualitas dari AI oracle", type: "write" },
                      { fn: "getProduct()", desc: "Baca data produk", type: "read" },
                      { fn: "getSupplyChain()", desc: "Baca semua langkah supply chain", type: "read" },
                      { fn: "checkExportEligibility()", desc: "Cek kelayakan ekspor", type: "read" },
                    ].map(({ fn, desc, type }) => (
                      <div key={fn} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)" }}>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0"
                          style={{
                            background: type === "write" ? "rgba(99,102,241,0.2)" : "rgba(16,185,129,0.2)",
                            color: type === "write" ? "#818cf8" : "#10b981",
                          }}
                        >
                          {type.toUpperCase()}
                        </span>
                        <div>
                          <div className="font-mono text-xs text-[var(--text-primary)]">{fn}</div>
                          <div className="text-xs text-[var(--text-muted)]">{desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Code Tab */}
          {activeTab === "code" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">TrustChainUMKM.sol</h3>
                  <p className="text-xs text-[var(--text-muted)]">Solidity 0.8.19 · Audited · OpenZeppelin</p>
                </div>
                <div className="flex gap-2">
                  <span className="badge badge-success">✓ Audited</span>
                  <span className="badge badge-info">OpenZeppelin</span>
                </div>
              </div>
              <div
                className="rounded-xl overflow-auto"
                style={{ background: "#020817", border: "1px solid rgba(99,102,241,0.2)", maxHeight: "500px" }}
              >
                <pre className="p-6 text-xs leading-relaxed" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#e2e8f0" }}>
                  <code>
                    {solidityCode.split('\n').map((line, i) => (
                      <span key={i} className="block">
                        <span style={{ color: "#475569", userSelect: "none", marginRight: "16px", minWidth: "28px", display: "inline-block" }}>
                          {i + 1}
                        </span>
                        {line
                          .replace(/\/\/.+/, (m) => `<comment>${m}</comment>`)
                          .split(/<comment>|<\/comment>/)
                          .map((part, j) => {
                            if (j % 2 === 1) return <span key={j} style={{ color: "#64748b" }}>{part}</span>;
                            return <span key={j}>{part
                              .split(/\b/)
                              .map((word, k) => {
                                const keywords = ['pragma', 'solidity', 'import', 'contract', 'struct', 'enum', 'event', 'mapping', 'function', 'external', 'internal', 'public', 'private', 'view', 'returns', 'require', 'emit', 'memory', 'storage', 'indexed', 'modifier', 'bool', 'uint256', 'bytes32', 'string', 'address', 'constructor'];
                                if (keywords.includes(word)) return <span key={k} style={{ color: "#818cf8" }}>{word}</span>;
                                if (/^".*"$/.test(word) || /^'.*'$/.test(word)) return <span key={k} style={{ color: "#10b981" }}>{word}</span>;
                                return <span key={k}>{word}</span>;
                              })
                            }</span>;
                          })
                        }
                      </span>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          )}

          {/* Interact Tab */}
          {activeTab === "interact" && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Fungsi Write</h3>
                  <div className="space-y-4">
                    {[
                      { fn: "registerProduct", label: "Register Produk", fields: ["Product ID", "IPFS Hash", "Quality Score"] },
                      { fn: "addSupplyChainStep", label: "Tambah Langkah", fields: ["Product ID", "Deskripsi", "Lokasi"] },
                      { fn: "verifyCertification", label: "Verifikasi Sertifikasi", fields: ["Product ID", "Cert Name", "Valid Until"] },
                      { fn: "updateQualityScore", label: "Update Skor AI", fields: ["Product ID", "New Score (0-100)"] },
                    ].map(({ fn, label, fields }) => (
                      <div key={fn} className="p-4 rounded-xl" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)" }}>
                        <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">{label}</div>
                        {fields.map((field) => (
                          <input key={field} className="custom-input mb-2" placeholder={field} />
                        ))}
                        <button
                          onClick={() => simulateCall(fn)}
                          disabled={calling}
                          className="btn-primary w-full text-sm mt-1"
                        >
                          {calling ? "Sending Transaction..." : `Call ${label}`}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Output Transaksi</h3>
                  <div
                    className="rounded-xl p-4 font-mono text-xs h-64 overflow-auto"
                    style={{ background: "#020817", border: "1px solid rgba(99,102,241,0.2)", color: "#10b981", whiteSpace: "pre-wrap", lineHeight: "1.8" }}
                  >
                    {calling ? (
                      <span className="text-indigo-400">⏳ Broadcasting transaction to Ethereum network...</span>
                    ) : callResult || (
                      <span className="text-[var(--text-muted)]">{"// Transaction output will appear here\n// Connect wallet to interact with live contracts"}</span>
                    )}
                  </div>

                  <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    <div className="text-xs font-semibold text-indigo-400 mb-2">Network Info</div>
                    <div className="space-y-1">
                      {[
                        ["Network", "Ethereum Mainnet"],
                        ["Chain ID", "1"],
                        ["RPC", "https://mainnet.infura.io/v3/..."],
                        ["Gas Price", "23 Gwei"],
                        ["Block Number", "#18,945,231"],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs">
                          <span className="text-[var(--text-muted)]">{k}</span>
                          <span className="font-mono text-[var(--text-secondary)]">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
