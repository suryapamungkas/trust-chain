# TrustChain UMKM

Platform digital berbasis **AI** dan **Blockchain** untuk mencatat seluruh perjalanan produk UMKM obat tradisional Indonesia — dari bahan baku hingga ekspor.

## ✨ Fitur Utama

- **3 Dashboard** — Admin, UMKM (Seller), dan Buyer/Investor
- **Auto-Generated Crypto Wallet** — Setiap user mendapat wallet address via ethers.js
- **Marketplace** — Jual beli produk UMKM dengan transaksi blockchain
- **Supply Chain Tracking** — Lacak perjalanan produk dari hulu ke hilir
- **AI Fraud Detection** — Analisis anomali dan deteksi kecurangan
- **AI Demand Prediction** — Prediksi permintaan berdasarkan tren dan musim
- **Chat System** — Komunikasi langsung antara buyer dan UMKM
- **Order Management** — Status pesanan lengkap (pending → delivered)
- **Review & Rating** — Buyer bisa memberikan ulasan produk
- **Export CSV** — Ekspor data transaksi, produk, dan UMKM
- **Multi-bahasa** — Bahasa Indonesia & English
- **Dark/Light Mode** — Tema monochrome elegan

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Vanilla CSS (Design Token System) |
| Backend | Next.js API Routes |
| Database | MySQL (mysql2) |
| Blockchain | ethers.js (wallet generation, hashing, signing) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| AI | Custom statistical analysis engine |
| Charts | Recharts |
| Icons | Lucide React |

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js 18+
- MySQL 8+ (running di localhost)

### Setup

```bash
# 1. Clone & install
cd trustchain-umkm
npm install

# 2. Buat database MySQL
mysql -u root -p -e "CREATE DATABASE trustchain_umkm;"

# 3. Copy environment (sudah ada .env.local)
# Pastikan DB_HOST, DB_USER, DB_PASSWORD, DB_NAME sudah benar

# 4. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

### Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@trustchain.id | admin123 |
| UMKM | siti@herbalindo.id | umkm123 |
| UMKM | bachtiar@jamugayo.id | umkm123 |
| Buyer | investor@nusantarasehat.co.id | buyer123 |
| Buyer | buyer@globalpharma.com | buyer123 |

## 📁 Struktur Project

```
src/
├── app/
│   ├── (dashboard)/    # Admin dashboard pages
│   ├── (umkm)/         # UMKM seller pages
│   ├── (buyer)/        # Buyer/investor pages
│   ├── api/            # API routes
│   ├── login/          # Authentication
│   ├── register/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── marketplace/    # Public marketplace
│   └── verify/         # Blockchain verification
├── components/         # Shared components
├── contexts/           # React contexts (Auth, Theme, Language)
└── lib/                # Core libraries
    ├── db.ts           # Database operations (MySQL)
    ├── auth.ts         # JWT & password utilities
    ├── blockchain.ts   # Blockchain hashing & signing
    ├── ai-engine.ts    # Fraud detection & demand prediction
    ├── validation.ts   # Zod input validation schemas
    ├── rate-limit.ts   # API rate limiting
    └── env-check.ts    # Environment variable validation
```

## 🔒 Keamanan

- JWT dengan signature verification (jose + jsonwebtoken)
- Password hashing (bcrypt, 12 rounds)
- Wallet private key encryption (AES-256-CBC)
- Input validation (Zod) di semua API endpoints
- Rate limiting pada auth & wallet endpoints
- SQL parameterized queries (anti SQL injection)
- HttpOnly secure cookies

## 📊 API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | /api/auth/login | Login user |
| POST | /api/auth/register | Register user baru |
| POST | /api/auth/forgot-password | Request reset password |
| POST | /api/auth/reset-password | Reset password dengan token |
| GET | /api/auth/me | Get current user info |
| GET/POST | /api/products | CRUD produk |
| POST | /api/marketplace/purchase | Beli produk |
| GET/POST | /api/wallet | Get wallet / Top-up |
| GET/PUT | /api/orders | Order management |
| GET/POST | /api/reviews | Review & rating produk |
| GET/PUT | /api/profile | User profile management |
| GET | /api/export?type=transactions | Export data CSV |
| GET | /api/stats | Platform statistics |

## 📜 Lisensi

Hak cipta © 2026 TrustChain UMKM Team. All rights reserved.
