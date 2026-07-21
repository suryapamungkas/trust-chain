import { describe, it, expect } from "vitest";
import { analyzeSupplyChainFraud, predictDemand } from "../ai-engine";

describe("AI Engine — Fraud Detection", () => {
  it("should return low risk for clean UMKM", () => {
    const result = analyzeSupplyChainFraud({
      umkmId: "1",
      umkmName: "Test UMKM",
      reliabilityScore: 85,
      totalTransactions: 100,
      certifications: ["SNI", "BPOM", "Halal MUI"],
      annualRevenue: 2000000000, // 2M
      employees: 10,
    });

    expect(result.riskLevel).toBe("low");
    expect(result.riskScore).toBeLessThan(25);
    expect(result.anomalies).toHaveLength(0);
    expect(result.modelVersion).toContain("TrustChain");
  });

  it("should detect revenue anomaly when ratio is too high", () => {
    const result = analyzeSupplyChainFraud({
      umkmId: "2",
      umkmName: "Suspicious UMKM",
      reliabilityScore: 80,
      totalTransactions: 50,
      certifications: ["SNI", "BPOM", "Halal MUI"],
      annualRevenue: 50000000000, // 50M — 2 employees
      employees: 2,
    });

    expect(result.anomalies.some((a) => a.type === "revenue_anomaly")).toBe(true);
    expect(result.riskScore).toBeGreaterThan(0);
  });

  it("should detect certification gaps for high-transaction UMKM", () => {
    const result = analyzeSupplyChainFraud({
      umkmId: "3",
      umkmName: "No Cert UMKM",
      reliabilityScore: 80,
      totalTransactions: 1500,
      certifications: [],
      annualRevenue: 5000000000,
      employees: 20,
    });

    expect(result.anomalies.some((a) => a.type === "certification_gap")).toBe(true);
    expect(result.riskScore).toBeGreaterThanOrEqual(25);
  });

  it("should flag low reliability score", () => {
    const result = analyzeSupplyChainFraud({
      umkmId: "4",
      umkmName: "Low Reliability",
      reliabilityScore: 40,
      totalTransactions: 10,
      certifications: ["SNI", "BPOM", "Halal MUI"],
      annualRevenue: 1000000000,
      employees: 5,
    });

    expect(result.anomalies.some((a) => a.type === "low_reliability")).toBe(true);
    expect(result.riskScore).toBeGreaterThanOrEqual(20);
  });

  it("should detect transaction velocity anomaly", () => {
    const result = analyzeSupplyChainFraud({
      umkmId: "5",
      umkmName: "High Velocity",
      reliabilityScore: 80,
      totalTransactions: 24000, // 1000/month
      certifications: ["SNI", "BPOM", "Halal MUI"],
      annualRevenue: 3000000000,
      employees: 5,
    });

    expect(result.anomalies.some((a) => a.type === "transaction_velocity")).toBe(true);
  });

  it("should detect supply chain verification gaps", () => {
    const result = analyzeSupplyChainFraud({
      umkmId: "6",
      umkmName: "Unverified Chain",
      reliabilityScore: 80,
      totalTransactions: 100,
      certifications: ["SNI", "BPOM", "Halal MUI"],
      annualRevenue: 2000000000,
      employees: 10,
      supplyChainSteps: [
        { verified: false, timestamp: "2026-01-01", location: "Jakarta" },
        { verified: false, timestamp: "2026-01-02", location: "Surabaya" },
        { verified: true, timestamp: "2026-01-03", location: "Bandung" },
      ],
    });

    expect(result.anomalies.some((a) => a.type === "verification_gap")).toBe(true);
  });

  it("should cap risk score at 100", () => {
    const result = analyzeSupplyChainFraud({
      umkmId: "7",
      umkmName: "Maximum Risk",
      reliabilityScore: 20,
      totalTransactions: 50000,
      certifications: [],
      annualRevenue: 100000000000,
      employees: 2,
      supplyChainSteps: [
        { verified: false, timestamp: "2026-01-01", location: "X" },
        { verified: false, timestamp: "2026-01-02", location: "Y" },
        { verified: false, timestamp: "2026-01-03", location: "Z" },
      ],
    });

    expect(result.riskScore).toBeLessThanOrEqual(100);
    expect(result.riskLevel).toBe("critical");
  });
});

describe("AI Engine — Demand Prediction", () => {
  it("should return low confidence for insufficient data", () => {
    const result = predictDemand({
      category: "Herbal",
      historicalData: [{ month: "2026-01", value: 100 }],
    });

    expect(result.confidence).toBeLessThanOrEqual(30);
    expect(result.productCategory).toBe("Herbal");
  });

  it("should predict rising trend for increasing data", () => {
    const result = predictDemand({
      category: "Jamu",
      historicalData: [
        { month: "2026-01", value: 100 },
        { month: "2026-02", value: 120 },
        { month: "2026-03", value: 150 },
        { month: "2026-04", value: 180 },
        { month: "2026-05", value: 220 },
        { month: "2026-06", value: 260 },
      ],
    });

    expect(result.predictedDemand).toBeGreaterThan(result.currentDemand);
    expect(result.trend).toBe("rising");
    expect(result.changePercent).toBeGreaterThan(0);
  });

  it("should predict declining trend for decreasing data", () => {
    const result = predictDemand({
      category: "Rempah",
      historicalData: [
        { month: "2026-01", value: 300 },
        { month: "2026-02", value: 280 },
        { month: "2026-03", value: 250 },
        { month: "2026-04", value: 220 },
        { month: "2026-05", value: 190 },
        { month: "2026-06", value: 160 },
      ],
    });

    expect(result.predictedDemand).toBeLessThan(result.currentDemand);
    expect(result.trend).toBe("declining");
    expect(result.changePercent).toBeLessThan(0);
  });

  it("should generate forecast data points", () => {
    const result = predictDemand({
      category: "Minyak Atsiri",
      historicalData: [
        { month: "2026-01", value: 100 },
        { month: "2026-02", value: 110 },
        { month: "2026-03", value: 105 },
        { month: "2026-04", value: 115 },
      ],
    });

    expect(result.dataPoints.length).toBeGreaterThan(0);
    result.dataPoints.forEach((dp) => {
      expect(dp.lower).toBeLessThanOrEqual(dp.predicted);
      expect(dp.upper).toBeGreaterThanOrEqual(dp.predicted);
    });
  });

  it("should include seasonal factors when provided", () => {
    const result = predictDemand({
      category: "Kunyit",
      historicalData: [
        { month: "2026-01", value: 100 },
        { month: "2026-02", value: 110 },
        { month: "2026-03", value: 120 },
      ],
      seasonalFactors: ["Ramadhan", "Musim Hujan"],
    });

    expect(result.seasonalFactors).toContain("Ramadhan");
    expect(result.seasonalFactors).toContain("Musim Hujan");
  });
});
