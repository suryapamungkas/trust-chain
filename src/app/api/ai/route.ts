import { NextRequest, NextResponse } from "next/server";
import { analyzeSupplyChainFraud, predictDemand, analyzeSupplyChainRisk } from "@/lib/ai-engine";
import { getAllUmkmProfiles, getProducts, getProductById, getTransactions, RowDataPacket } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json();

    switch (action) {
      case "fraud_analysis": {
        const allProfiles = await getAllUmkmProfiles();

        if (data?.umkmId) {
          const umkm = allProfiles.find((u: RowDataPacket) => u.id === Number(data.umkmId) || u.user_id === Number(data.umkmId));
          if (!umkm) return NextResponse.json({ error: "UMKM not found" }, { status: 404 });

          let certs: string[] = [];
          try { certs = typeof umkm.certifications === "string" ? JSON.parse(umkm.certifications) : (umkm.certifications || []); } catch { certs = []; }

          const userTx = await getTransactions({ userId: umkm.user_id as number });

          const result = analyzeSupplyChainFraud({
            umkmId: String(umkm.id),
            umkmName: (umkm.business_name || umkm.user_name || "Unknown") as string,
            reliabilityScore: (umkm.reliability_score || 0) as number,
            totalTransactions: userTx.length,
            certifications: certs,
            annualRevenue: (umkm.annual_revenue || 0) as number,
            employees: (umkm.employees || 1) as number,
          });
          return NextResponse.json({ success: true, result });
        }

        // Analyze all UMKMs
        const results = await Promise.all(
          allProfiles.map(async (umkm: RowDataPacket) => {
            let certs: string[] = [];
            try { certs = typeof umkm.certifications === "string" ? JSON.parse(umkm.certifications as string) : (umkm.certifications as string[] || []); } catch { certs = []; }

            const userTx = await getTransactions({ userId: umkm.user_id as number, limit: 100 });

            return {
              umkmId: umkm.id,
              umkmName: umkm.business_name || umkm.user_name || "Unknown",
              ...analyzeSupplyChainFraud({
                umkmId: String(umkm.id),
                umkmName: (umkm.business_name || umkm.user_name || "Unknown") as string,
                reliabilityScore: (umkm.reliability_score || 0) as number,
                totalTransactions: userTx.length,
                certifications: certs,
                annualRevenue: (umkm.annual_revenue || 0) as number,
                employees: (umkm.employees || 1) as number,
              }),
            };
          })
        );
        return NextResponse.json({ success: true, results });
      }

      case "demand_prediction": {
        const category = data?.category || "Obat Tradisional";
        const historicalData = data?.historicalData || [
          { month: "Jul 2024", value: 82 },
          { month: "Agu 2024", value: 85 },
          { month: "Sep 2024", value: 91 },
          { month: "Okt 2024", value: 108 },
          { month: "Nov 2024", value: 124 },
          { month: "Des 2024", value: 135 },
          { month: "Jan 2025", value: 129 },
        ];

        const result = predictDemand({
          category,
          historicalData,
          seasonalFactors: data?.seasonalFactors || [],
        });
        return NextResponse.json({ success: true, result });
      }

      case "supply_chain_risk": {
        if (!data?.productId) {
          return NextResponse.json({ error: "productId required" }, { status: 400 });
        }
        const product = await getProductById(Number(data.productId));
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        let certs: string[] = [];
        try { certs = typeof product.certifications === "string" ? JSON.parse(product.certifications) : (product.certifications || []); } catch { certs = []; }

        const result = analyzeSupplyChainRisk({
          totalSteps: 5,
          verifiedSteps: product.status === "active" ? 4 : 1,
          avgDeliveryTime: 7,
          supplierCount: 3,
          certificationCount: certs.length,
          exportReady: false,
        });
        return NextResponse.json({ success: true, result });
      }

      case "price_anomaly": {
        // Price anomaly detection: compare each product's price against its category average
        const allProducts = await getProducts({ status: "active" });
        if (!allProducts || allProducts.length === 0) {
          return NextResponse.json({ success: true, anomalies: [], summary: { totalProducts: 0, anomaliesFound: 0 } });
        }

        // Group by category and calculate averages
        const categoryMap: Record<string, { total: number; count: number; products: RowDataPacket[] }> = {};
        for (const p of allProducts) {
          const cat = (p.category as string) || "Lainnya";
          if (!categoryMap[cat]) categoryMap[cat] = { total: 0, count: 0, products: [] };
          categoryMap[cat].total += (p.price_idr as number) || 0;
          categoryMap[cat].count++;
          categoryMap[cat].products.push(p);
        }

        const anomalies: Record<string, unknown>[] = [];
        for (const [category, data] of Object.entries(categoryMap)) {
          if (data.count < 2) continue; // Need at least 2 products to compare
          const avg = data.total / data.count;

          for (const p of data.products) {
            const price = (p.price_idr as number) || 0;
            if (avg === 0) continue;
            const deviation = ((price - avg) / avg) * 100;

            let riskLevel: string | null = null;
            if (price < avg * 0.4) riskLevel = "high";
            else if (price < avg * 0.6) riskLevel = "medium";
            else if (price > avg * 3.0) riskLevel = "high";
            else if (price > avg * 2.0) riskLevel = "medium";

            if (riskLevel) {
              anomalies.push({
                productId: p.id,
                productName: p.name,
                umkmName: p.umkm_name || "Unknown",
                category,
                priceIdr: price,
                avgCategoryPrice: Math.round(avg),
                deviationPercent: Math.round(deviation),
                riskLevel,
                reason: price < avg ? "Harga jauh di bawah rata-rata kategori — potensi produk palsu atau kualitas rendah" : "Harga jauh di atas rata-rata kategori — potensi markup berlebihan",
              });
            }
          }
        }

        anomalies.sort((a, b) => (a.riskLevel === "high" ? -1 : 1) - (b.riskLevel === "high" ? -1 : 1));

        return NextResponse.json({
          success: true,
          anomalies,
          summary: {
            totalProducts: allProducts.length,
            anomaliesFound: anomalies.length,
            categoriesAnalyzed: Object.keys(categoryMap).length,
            analysisTimestamp: new Date().toISOString(),
            modelVersion: "TrustChain-PriceGuard v1.0",
          },
        });
      }

      default:
        return NextResponse.json({ error: "Unknown action. Available: fraud_analysis, demand_prediction, supply_chain_risk, price_anomaly" }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
