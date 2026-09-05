<div align="center">

<img width="1920" height="1080" alt="TrustChain UMKM Banner" src="https://github.com/user-attachments/assets/927c6afd-edea-436b-9ada-853b02265986" />

# 🌿 TrustChain UMKM

**Platform Digital Berbasis AI & Blockchain untuk Rantai Pasok dan Marketplace Jamu & Herbal Warisan Nusantara.**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-20232A?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-43%20Passed-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## 📖 Tentang Proyek

**TrustChain UMKM** adalah ekosistem digital terdesentralisasi yang dirancang khusus untuk memberdayakan pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) jamu tradisional dan formula herbal nusantara kelas menengah-atas. Dengan mengintegrasikan **keamanan kriptografi blockchain** dan **kecerdasan buatan (AI)**, TrustChain memberikan kepastian keaslian produk, transparansi jejak rantai pasok (supply chain traceability), serta perlindungan dari pemalsuan izin edar dan dokumen mutu (BPOM, Halal MUI, CPOTB).

---

## ✨ Fitur Utama

### 🏛️ 1. Katalog & Marketplace Jamu Warisan Nusantara
- **Koleksi Jamu Kelas Menengah-Atas:** Menampilkan produk jamu premium (Kunyit Asam Keraton, Beras Kencur Solo Imperial, Ekstrak Curcumin Gold, Minyak Balur 69 Rempah, Purwoceng Dieng, Galian Singset Ratu Madura, dsb.).
- **Studio Photography & Responsive Grid:** Desain kartu modern dengan rasio foto studio 4:3, zoom-hover, dan sistem fallback gambar otomatis.
- **Dual-Currency Pricing:** Tampilan harga ganda Rupiah (IDR) dan ekuivalen USD/USDT secara presisi.
- **On-Chain Verification Badge:** Setiap produk terdaftar memiliki hash kriptografi permanen yang dapat diaudit langsung di ledger.

### 💳 2. Sistem Pembayaran Multi-Jalur (QRIS & Web3 Crypto)
- Alur checkout 4-langkah: Ringkasan Pesanan $\rightarrow$ Faktur Elektronik $\rightarrow$ Pembayaran QRIS Standar Indonesia / Barcode USDT Tether $\rightarrow$ Bukti Transaksi On-Chain.
- Auto-generated crypto wallet (EIP-191 compliant) dengan enkripsi kunci privat AES-256-CBC via `ethers.js`.

### 🔍 3. Supply Chain Traceability & Audit Independen
- Pelacakan batch produksi dari asal rempah hulu (perkebunan petani lokal), proses ekstraksi CPOTB, uji laboratorium, hingga ke tangan buyer/konsumen.
- Halaman verifikasi publik (`/verify/[txHash]`) dengan pemindaian QR Code untuk pembuktian keaslian seketika.

### 🤖 4. AI Analytics Engine
- **AI Fraud Detection:** Deteksi anomali pada sertifikasi BPOM dan jejak transaksi rantai pasok.
- **AI Demand Prediction:** Prediksi kebutuhan bahan baku dan lonjakan permintaan pasar berdasarkan musiman.
- **Credit Scoring UMKM:** Penilaian kelayakan kredit berbantuan AI untuk kemudahan akses permodalan KUR perbankan.

### 🌐 5. Desain Modern & Dwi-Bahasa (ID ↔ EN)
- Sinkronisasi multi-bahasa instan antara **Bahasa Indonesia** dan **English**.
- Tema gelap dan terang (Dark/Light Mode) monokromatik elegan dengan sistem design tokens native.

---

## 🛠️ Tech Stack

| Lapisan | Teknologi & Pustaka |
|---|---|
| **Framework** | [Next.js 16.1.6](https://nextjs.org/) (App Router & Turbopack) |
| **Bahasa & UI** | [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | Vanilla CSS (Modern Design Tokens, Color-Scheme Native, Content-Visibility) |
| **Database** | [MySQL](https://www.mysql.com/) (`mysql2/promise`) dengan connection pool & graceful fallback |
| **Blockchain** | [ethers.js v6](https://docs.ethers.org/) (Wallet generation, Keccak-256, Signature Verification) |
| **Autentikasi** | JWT ([jose](https://github.com/panva/jose) di Edge/Proxy + [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) di Node) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Validasi Data** | [Zod v4](https://zod.dev/) (Strict type validation pada seluruh endpoint) |
| **Visualisasi** | [Recharts](https://recharts.org/), [Lucide React](https://lucide.dev/), [QRCode.react](https://github.com/zpao/qrcode.react) |
| **Pengujian** | [Vitest](https://vitest.dev/) (Unit & Integration tests) |

---

## 🚀 Panduan Menjalankan

### Kebutuhan Sistem (Prerequisites)
- [Node.js](https://nodejs.org/) v18 atau v20+
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) 8.0+

### Langkah Instalasi

```bash
# 1. Clone repositori
git clone https://github.com/suryapamungkas/trust-chain.git
cd trust-chain

# 2. Pasang dependensi
npm install

# 3. Konfigurasi Environment
# Salin .env.example menjadi .env.local dan sesuaikan kredensial MySQL
cp .env.example .env.local

# 4. Siapkan Database MySQL
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS trustchain_umkm;"

# 5. Jalankan Development Server
npm run dev
```

Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

---

## 🧪 Pengujian & Type Safety

Proyek ini dilengkapi pengujian otomatis dengan tingkat ketahanan tinggi:

```bash
# Menjalankan unit test suite
npm run test

# Menjalankan typecheck TypeScript
npx tsc --noEmit
```

---

## 🔑 Akun Demo Pengujian

| Peran (Role) | Email | Kata Sandi | Akses Dashboard |
|---|---|---|---|
| **Platform Admin** | `admin@trustchain.id` | `admin123` | `/dashboard` |
| **UMKM Mitra 1** | `siti@herbalindo.id` | `umkm123` | `/umkm` |
| **UMKM Mitra 2** | `bachtiar@jamugayo.id` | `umkm123` | `/umkm` |
| **Buyer / Investor 1** | `investor@nusantarasehat.co.id` | `buyer123` | `/buyer` |
| **Buyer Global** | `buyer@globalpharma.com` | `buyer123` | `/buyer` |

---

## 📁 Struktur Direktori

```
trust-chain/
├── public/
│   ├── images/products/    # Foto studio produk jamu resolusi tinggi
│   ├── logo_hitam.png      # Logo tema terang
│   └── logo_putih.png      # Logo tema gelap
├── src/
│   ├── app/
│   │   ├── (dashboard)/    # Modul Admin (analytics, audit, smart-contracts)
│   │   ├── (umkm)/         # Modul Seller UMKM (manajemen produk, pesanan)
│   │   ├── (buyer)/        # Modul Pembeli (marketplace, checkout, wallet)
│   │   ├── api/            # REST API endpoints
│   │   ├── marketplace/    # Katalog publik jamu nusantara
│   │   ├── verify/         # Auditor publik on-chain
│   │   ├── layout.tsx      # Root layout & providers
│   │   └── globals.css     # Design tokens & styling
│   ├── components/         # Reusable UI (Sidebar, Topbar, Skeletons, Chat)
│   ├── contexts/           # Contexts (AuthContext, LanguageContext, ThemeContext)
│   └── lib/                # Shared libraries
│       ├── db.ts           # Koneksi database MySQL & seed data
│       ├── product-utils.ts# Katalog produk jamu & parser sertifikasi
│       ├── blockchain.ts   # Operasi hash & signature ledger
│       ├── ai-engine.ts    # Algoritma machine learning & fraud detection
│       ├── validation.ts   # Skema validasi Zod
│       └── auth.ts         # Utilitas enkripsi & verifikasi JWT
├── next.config.mjs         # Konfigurasi Next.js & package optimization
├── tsconfig.json           # Konfigurasi TypeScript
└── vitest.config.ts        # Konfigurasi pengujian Vitest
```

---

## 👥 Tim Pengembang (Authors)

Proyek ini dirancang dan dikembangkan dengan bangga oleh:

- **Nur Hidayat Surya Pamungkas**
- **Muhammad Bazwa Arigusna**
- **Alvia Nabila Azzahra**

---

## 📜 Lisensi

Proyek ini dilisensikan di bawah ketentuan [MIT License](LICENSE).  
Hak Cipta © 2026 **Nur Hidayat Surya Pamungkas, Muhammad Bazwa Arigusna, Alvia Nabila Azzahra**. Seluruh hak cipta dilindungi undang-undang.
