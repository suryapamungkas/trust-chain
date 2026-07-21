// =====================================================================
// TrustChain UMKM — Types & Helpers
// All mock data has been removed. Data now comes from SQLite via API.
// =====================================================================

export interface UMKMProfile {
  id: string | number;
  name: string;
  owner: string;
  category: string;
  province: string;
  city: string;
  walletAddress: string;
  reliabilityScore: number;
  verificationStatus: "verified" | "pending" | "rejected" | "unverified";
  certifications: string[];
  joinDate: string;
  totalProducts: number;
  totalTransactions: number;
  exportReady: boolean;
  creditScore: number;
  annualRevenue: number;
  employees: number;
  description?: string;
  alamatLengkap?: string;
  tipeIndustri?: string;
  businessName?: string;
}

export interface Product {
  id: string | number;
  productId: string;
  name: string;
  category: string;
  umkmId: string | number;
  umkmName: string;
  origin: string;
  status: "active" | "in_transit" | "delivered" | "exported";
  blockchainHash: string;
  ipfsHash: string;
  qrCode: string;
  createdAt: string;
  lastUpdated: string;
  certifications: Certification[];
  supplyChainSteps: SupplyChainStep[];
  qualityScore: number;
  exportEligible: boolean;
  targetMarkets: string[];
  price: number;
  unit: string;
  quantity: number;
  rawMaterials: RawMaterial[];
  aiRiskScore: number;
  aiDemandPrediction: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  validUntil: string;
  status: "valid" | "expired" | "pending";
  txHash: string;
}

export interface SupplyChainStep {
  id: string;
  step: string;
  description: string;
  location: string;
  timestamp: string;
  actor: string;
  txHash: string;
  verified: boolean;
  documents: string[];
  coordinates: { lat: number; lng: number };
}

export interface RawMaterial {
  name: string;
  origin: string;
  supplier: string;
  quantity: string;
  certified: boolean;
}

export interface SmartContract {
  id: string;
  name: string;
  address: string;
  type: "quality" | "certification" | "payment" | "escrow";
  status: "active" | "paused" | "terminated";
  triggered: number;
  successRate: number;
  deployedAt: string;
  lastTriggered: string;
  abi: string;
}

export interface AIInsight {
  id: string;
  type: "fraud_detection" | "demand_prediction" | "risk_monitoring" | "quality_assessment";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  affectedProducts: string[];
  recommendation: string;
  timestamp: string;
  resolved: boolean;
}

export interface Transaction {
  id: string;
  txHash: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  type: "payment" | "certification" | "transfer" | "escrow";
  status: "confirmed" | "pending" | "failed";
  blockNumber: number;
  timestamp: string;
  gasUsed: number;
  productId?: string;
}

export interface ExportOpportunity {
  id: string;
  targetCountry: string;
  targetMarket: string;
  category: string;
  demandLevel: "high" | "medium" | "low";
  potentialRevenue: number;
  requiredCertifications: string[];
  readinessScore: number;
  estimatedTimeline: string;
  barriers: string[];
}

export interface CreditAssessment {
  umkmId: string;
  umkmName: string;
  creditScore: number;
  loanEligibility: number;
  interestRate: number;
  supplyChainScore: number;
  salesHistoryScore: number;
  reliabilityScore: number;
  riskLevel: "low" | "medium" | "high";
  recommendation: string;
  bankPartners: string[];
}

export interface NationalStats {
  totalUMKM: number;
  totalProducts: number;
  totalTransactions: number;
  totalExportValue: number;
  activeSupplyChains: number;
  verifiedCertifications: number;
  aiAlertsResolved: number;
  avgReliabilityScore: number;
  topProvinces: { province: string; umkmCount: number; exportValue: number }[];
  categoryDistribution: { category: string; count: number; percentage: number }[];
  monthlyGrowth: { month: string; newUMKM: number; transactions: number; exportValue: number }[];
}

// =====================================================================
// STATIC DATA (Smart Contracts, AI Insights, Export Opportunities)
// These don't change frequently and are kept as constants
// =====================================================================

export const mockSmartContracts: SmartContract[] = [
  {
    id: "sc-001", name: "QualityValidator v2.1",
    address: "0x1234567890AbCdEf1234567890AbCdEf12345678",
    type: "quality", status: "active", triggered: 4521, successRate: 98.7,
    deployedAt: "2024-01-15T00:00:00Z", lastTriggered: "2025-01-13T10:25:00Z", abi: "QualityValidator",
  },
  {
    id: "sc-002", name: "CertificationManager v1.5",
    address: "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12",
    type: "certification", status: "active", triggered: 2103, successRate: 99.2,
    deployedAt: "2024-03-20T00:00:00Z", lastTriggered: "2025-01-13T09:45:00Z", abi: "CertificationManager",
  },
  {
    id: "sc-003", name: "SupplyChainEscrow v3.0",
    address: "0x9876543210FeDcBa9876543210FeDcBa98765432",
    type: "escrow", status: "active", triggered: 8934, successRate: 97.5,
    deployedAt: "2024-02-10T00:00:00Z", lastTriggered: "2025-01-13T11:00:00Z", abi: "SupplyChainEscrow",
  },
  {
    id: "sc-004", name: "AutoPayment v2.0",
    address: "0xFeDcBa9876543210FeDcBa9876543210FeDcBa98",
    type: "payment", status: "active", triggered: 12847, successRate: 99.8,
    deployedAt: "2024-04-05T00:00:00Z", lastTriggered: "2025-01-13T11:30:00Z", abi: "AutoPayment",
  },
];

export const mockAIInsights: AIInsight[] = [
  {
    id: "ai-001", type: "fraud_detection", title: "Anomali Sertifikasi BPOM Terdeteksi",
    description: "Pola sertifikasi tidak konsisten pada 3 produk obat tradisional. Kemungkinan pemalsuan dokumen BPOM 78%.",
    severity: "high", confidence: 78, affectedProducts: ["prod-1", "prod-2"],
    recommendation: "Verifikasi manual sertifikasi BPOM asli dengan lembaga penerbit. Tahan sementara distribusi.",
    timestamp: "2026-05-26T08:30:00Z", resolved: false,
  },
  {
    id: "ai-002", type: "demand_prediction", title: "Lonjakan Permintaan Jamu — Ramadan 2026",
    description: "Model prediksi menunjukkan peningkatan permintaan jamu herbal 280% menjelang Ramadan. Rekomendasi produksi segera.",
    severity: "low", confidence: 91, affectedProducts: ["prod-3"],
    recommendation: "Tingkatkan kapasitas produksi jamu 3x lipat. Amankan bahan baku herbal mulai awal Mei.",
    timestamp: "2026-05-25T14:00:00Z", resolved: false,
  },
  {
    id: "ai-003", type: "risk_monitoring", title: "Risiko Supply Chain Bahan Herbal",
    description: "Cuaca ekstrem di Jawa Tengah dapat mengganggu pasokan kunyit dan temulawak. Prediksi keterlambatan 2-3 minggu.",
    severity: "medium", confidence: 65, affectedProducts: ["prod-4"],
    recommendation: "Aktifkan kontrak buffer dengan supplier alternatif di Jawa Timur. Koordinasi logistik untuk rerouting.",
    timestamp: "2026-05-24T09:15:00Z", resolved: false,
  },
  {
    id: "ai-004", type: "quality_assessment", title: "Penurunan Mutu Ekstrak Herbal",
    description: "Analisis batch terbaru menunjukkan penurunan kandungan aktif 12% pada ekstrak temulawak. Potensi masalah pada proses ekstraksi.",
    severity: "medium", confidence: 84, affectedProducts: ["prod-5"],
    recommendation: "Kalibrasi ulang peralatan ekstraksi. Review SOP standar CPOTB.",
    timestamp: "2026-05-23T16:00:00Z", resolved: true,
  },
];

export const mockExportOpportunities: ExportOpportunity[] = [
  {
    id: "exp-001", targetCountry: "Jepang", targetMarket: "Tokyo Kampo Medicine Market",
    category: "Obat Tradisional", demandLevel: "high", potentialRevenue: 45000000000,
    requiredCertifications: ["BPOM", "JIS Standard", "CPOTB", "Halal"],
    readinessScore: 91, estimatedTimeline: "Q3 2026",
    barriers: ["Biaya sertifikasi JIS", "Standar kemasan Jepang"],
  },
  {
    id: "exp-002", targetCountry: "Malaysia", targetMarket: "ASEAN Herbal Medicine Hub",
    category: "Jamu", demandLevel: "high", potentialRevenue: 28000000000,
    requiredCertifications: ["BPOM", "Halal JAKIM", "GMP"],
    readinessScore: 87, estimatedTimeline: "Q2 2026",
    barriers: ["Regulasi Medsafe Malaysia", "Volume minimum"],
  },
  {
    id: "exp-003", targetCountry: "Uni Eropa", targetMarket: "European Herbal Supplement Market",
    category: "Suplemen Herbal", demandLevel: "medium", potentialRevenue: 65000000000,
    requiredCertifications: ["CE Mark", "THMPD Directive", "GMP EU"],
    readinessScore: 65, estimatedTimeline: "Q1 2027",
    barriers: ["Sertifikasi THMPD", "Standar kemasan EU", "Registrasi EFSA"],
  },
];

// =====================================================================
// Helper functions
// =====================================================================

export function formatCurrency(value: number, currency: string = "IDR"): string {
  if (currency === "IDR") {
    if (value >= 1000000000000) {
      return `Rp ${(value / 1000000000000).toFixed(1)} T`;
    } else if (value >= 1000000000) {
      return `Rp ${(value / 1000000000).toFixed(1)} M`;
    } else if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(0)} jt`;
    }
    return `Rp ${value.toLocaleString("id-ID")}`;
  }
  return `${value} ${currency}`;
}

export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString("id-ID");
}

export function formatHash(hash: string): string {
  if (!hash || hash.length <= 14) return hash || '';
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    active: "#10b981", verified: "#10b981", confirmed: "#10b981", valid: "#10b981",
    exported: "#6366f1", in_transit: "#f59e0b", pending: "#f59e0b",
    delivered: "#06b6d4", rejected: "#f43f5e", failed: "#f43f5e", expired: "#f43f5e",
    paused: "#94a3b8", terminated: "#f43f5e", unverified: "#94a3b8",
    low: "#10b981", medium: "#f59e0b", high: "#f43f5e", critical: "#ef4444",
  };
  return map[status] || "#94a3b8";
}

// =====================================================================
// Compatibility: Empty arrays for pages that haven't been migrated yet
// These will be gradually replaced by API calls
// =====================================================================

export const mockUMKMProfiles: UMKMProfile[] = [];
export const mockProducts: Product[] = [];
export const mockTransactions: Transaction[] = [];
export const mockCreditAssessments: CreditAssessment[] = [];
export const mockNationalStats: NationalStats = {
  totalUMKM: 0, totalProducts: 0, totalTransactions: 0, totalExportValue: 0,
  activeSupplyChains: 0, verifiedCertifications: 0, aiAlertsResolved: 0, avgReliabilityScore: 0,
  topProvinces: [], categoryDistribution: [], monthlyGrowth: [],
};
