// =====================================================================
// TrustChain UMKM — Input Validation Schemas (Zod)
// Centralized validation for all API endpoints
// =====================================================================

import { z } from "zod";

// =====================================================================
// AUTH SCHEMAS
// =====================================================================

export const loginSchema = z.object({
  email: z
    .string()
    .email("Format email tidak valid")
    .max(255, "Email terlalu panjang"),
  password: z
    .string()
    .min(1, "Password tidak boleh kosong")
    .max(128, "Password terlalu panjang"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(255, "Nama terlalu panjang")
    .trim(),
  email: z
    .string()
    .email("Format email tidak valid")
    .max(255, "Email terlalu panjang"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(128, "Password terlalu panjang"),
  role: z.enum(["umkm", "buyer"], {
    errorMap: () => ({ message: "Role harus 'umkm' atau 'buyer'" }),
  }),
  businessName: z
    .string()
    .min(2, "Nama bisnis minimal 2 karakter")
    .max(255)
    .optional(),
  companyName: z
    .string()
    .min(2, "Nama perusahaan minimal 2 karakter")
    .max(255)
    .optional(),
  province: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Format email tidak valid")
    .max(255, "Email terlalu panjang"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token tidak boleh kosong"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(128, "Password terlalu panjang"),
});

// =====================================================================
// PRODUCT SCHEMAS
// =====================================================================

export const createProductSchema = z.object({
  name: z
    .string()
    .min(2, "Nama produk minimal 2 karakter")
    .max(255, "Nama produk terlalu panjang")
    .trim(),
  category: z
    .string()
    .min(1, "Kategori tidak boleh kosong")
    .max(100),
  description: z
    .string()
    .max(5000, "Deskripsi terlalu panjang")
    .optional()
    .default(""),
  priceIdr: z
    .number()
    .min(0, "Harga IDR tidak boleh negatif")
    .max(999999999999, "Harga IDR terlalu besar"),
  priceUsd: z
    .number()
    .min(0, "Harga USD tidak boleh negatif")
    .max(999999999, "Harga USD terlalu besar"),
  stock: z
    .number()
    .int("Stok harus bilangan bulat")
    .min(0, "Stok tidak boleh negatif")
    .max(9999999, "Stok terlalu besar"),
  unit: z
    .string()
    .max(50)
    .optional()
    .default("pcs"),
  imageUrl: z
    .string()
    .max(500)
    .optional()
    .default(""),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).max(255).trim().optional(),
  category: z.string().min(1).max(100).optional(),
  description: z.string().max(5000).optional(),
  price_idr: z.number().min(0).max(999999999999).optional(),
  price_usd: z.number().min(0).max(999999999).optional(),
  stock: z.number().int().min(0).max(9999999).optional(),
  unit: z.string().max(50).optional(),
  image_url: z.string().max(500).optional(),
  status: z.enum(["active", "inactive", "sold_out", "pending", "rejected"]).optional(),
});

// =====================================================================
// WALLET SCHEMAS
// =====================================================================

export const topUpSchema = z.object({
  amount: z
    .number()
    .positive("Jumlah harus lebih dari 0"),
  currency: z.enum(["IDR", "USD"], {
    errorMap: () => ({ message: "Currency harus 'IDR' atau 'USD'" }),
  }),
});

// =====================================================================
// MARKETPLACE SCHEMAS
// =====================================================================

export const purchaseSchema = z.object({
  productId: z
    .number()
    .int()
    .positive("Product ID tidak valid"),
  quantity: z
    .number()
    .int("Quantity harus bilangan bulat")
    .min(1, "Quantity minimal 1")
    .max(99999, "Quantity terlalu besar"),
  currency: z.enum(["IDR", "USD"]).default("IDR"),
  destinationCountry: z
    .string()
    .max(100)
    .optional()
    .default("Indonesia"),
});

// =====================================================================
// CHAT SCHEMAS
// =====================================================================

export const sendMessageSchema = z.object({
  roomId: z.number().int().positive().optional(),
  partnerId: z.number().int().positive().optional(),
  productId: z.number().int().positive().optional(),
  message: z
    .string()
    .min(1, "Pesan tidak boleh kosong")
    .max(5000, "Pesan terlalu panjang")
    .trim(),
  messageType: z.enum(["text", "image", "file", "system"]).default("text"),
  attachmentUrl: z.string().max(512).nullable().optional(),
});

// =====================================================================
// REVIEW SCHEMAS
// =====================================================================

export const createReviewSchema = z.object({
  productId: z
    .number()
    .int()
    .positive("Product ID tidak valid"),
  rating: z
    .number()
    .int("Rating harus bilangan bulat")
    .min(1, "Rating minimal 1")
    .max(5, "Rating maksimal 5"),
  comment: z
    .string()
    .max(2000, "Komentar terlalu panjang")
    .optional()
    .default(""),
});

// =====================================================================
// PROFILE SCHEMAS
// =====================================================================

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(255).trim().optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  // UMKM-specific
  businessName: z.string().min(2).max(255).optional(),
  businessType: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  description: z.string().max(5000).optional(),
  nibNumber: z.string().max(100).optional(),
  alamatLengkap: z.string().max(500).optional(),
  tipeIndustri: z.string().max(100).optional(),
  // Buyer-specific
  companyName: z.string().max(255).optional(),
  companyType: z.enum(["investor", "buyer", "distributor", "bank", "government"]).optional(),
  country: z.string().max(100).optional(),
});

// =====================================================================
// ADMIN SCHEMAS
// =====================================================================

export const adminUpdateUmkmSchema = z.object({
  verification_status: z.enum(["verified", "pending", "unverified", "rejected"]).optional(),
  reliability_score: z.number().int().min(0).max(100).optional(),
  business_name: z.string().min(2).max(255).optional(),
  business_type: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  description: z.string().max(5000).optional(),
  nib_number: z.string().max(100).optional(),
  alamat_lengkap: z.string().max(500).optional(),
  tipe_industri: z.string().max(100).optional(),
  certifications: z.string().max(2000).optional(),
});

// =====================================================================
// EXPORT SCHEMA
// =====================================================================

export const exportQuerySchema = z.object({
  type: z.enum(["transactions", "products", "umkm"]).default("transactions"),
  format: z.enum(["csv"]).default("csv"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// =====================================================================
// SUPPLY CHAIN TRACKING
// =====================================================================

export const addTrackingSchema = z.object({
  transactionId: z.number().int().positive(),
  status: z.string().min(1).max(255).trim(),
  location: z.string().min(1).max(255).trim(),
});

// =====================================================================
// HELPER: Validate and parse request body
// =====================================================================

import { NextResponse } from "next/server";

export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown):
  { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return {
      success: false,
      response: NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      ),
    };
  }
  return { success: true, data: result.data };
}

export function validateQuery<T>(schema: z.ZodSchema<T>, params: URLSearchParams):
  { success: true; data: T } | { success: false; response: NextResponse } {
  const obj: Record<string, string> = {};
  params.forEach((value, key) => { obj[key] = value; });
  return validateBody(schema, obj);
}
