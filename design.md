# TrustChain UMKM - V2 Redesign & Feature Expansion

## 1. Konsep UI/UX (Desain)
- **Tema:** *Strict Monochrome* (Hanya Hitam dan Putih). 
- **Tujuan:** Memberikan kesan *elegant, professional, premium*, dan sangat *clean*.
- **Warna Spesifik:** 
  - `bg-white` untuk *background* utama.
  - `bg-black` untuk *sidebar*, *header* (opsional), atau *card* yang ingin di- *highlight*.
  - `text-black` untuk teks pada *background* terang, `text-white` untuk teks pada *background* gelap.
  - *Borders* menggunakan `border-black` atau `border-gray-200` (maksimal abu-abu sangat muda untuk pembatas halus, atau cukup garis hitam murni yang tipis).
- **Tipografi:** Menggunakan font Sans-Serif modern yang geometris (seperti *Inter*, *Space Grotesk*, atau *Manrope*) untuk memberikan kesan profesional dan futuristik.

## 2. Struktur Dasbor
Proyek ini memiliki 3 entitas utama, masing-masing dengan dasbor khusus:

### A. Dashboard Admin
- **Overview:** Statistik total UMKM, transaksi crypto/fiat, dan produk.
- **Approval/Verifikasi:** CRUD dan persetujuan registrasi UMKM.
- **Smart Contract & AI:** Pantauan *fraud detection* dan *smart contract logs*.

### B. Dashboard UMKM (Seller/Producer)
- **Marketplace Management:** CRUD Produk (Tambah, Edit, Hapus, Lihat produk jualan).
- **Wallet & Transaksi:** Menampilkan *address* dompet kripto, saldo (IDR/USD stablecoins), riwayat masuk/keluar, dan QR Code wallet untuk discan.
- **Profile:** CRUD profil perusahaan, sertifikasi BPOM/Halal.

### C. Dashboard Buyer (Investor / Distributor)
- **Marketplace Explorer:** Katalog produk jamu dan UMKM. Fitur *search, filter*, dan *buy/invest*.
- **Portfolio & Transaksi:** Riwayat pembelian/investasi.
- **Wallet:** Dompet kripto *Buyer* dengan fitur *Top-Up* dan *Transfer*.

## 3. Fitur Utama & Logika Sistem

### 3.1. Auto-Generated Crypto Wallet (Custodial Demo)
- **Saat Registrasi:** Setiap kali user baru dibuat (Admin, UMKM, atau Buyer), sistem akan men-*generate* sepasang kunci (Public Key / Wallet Address & Private Key) menggunakan `ethers.js` atau `web3.js`.
- **Database:** Simpan `wallet_address` dan `encrypted_private_key` di tabel `users`.
- **QR Code:** Di dasbor, *wallet address* ditampilkan dalam bentuk teks (bisa di-*copy*) dan QR Code (menggunakan library `qrcode.react`).
- **Blockchain Explorer:** Setiap transaksi atau alamat dompet bisa diklik dan mengarah ke *mock* blockchain explorer atau testnet explorer (seperti Sepolia Etherscan jika menggunakan Testnet nyata).

### 3.2. Marketplace & Transaksi
- **Transaksi:** Menggunakan mata uang (IDR / USD). Dalam konteks blockchain, ini disimulasikan sebagai token ERC-20 (misal: IDRT atau USDC).
- **Flow Pembelian:**
  1. Buyer memilih produk di Marketplace.
  2. Buyer klik "Beli / Investasi".
  3. Sistem memotong saldo *wallet* Buyer dan menambah saldo *wallet* UMKM, lalu mencatat *hash* transaksi di database (tabel `transactions`).

## 4. Perubahan Database (MySQL)
**Tabel `users`:**
- Tambahan kolom: `wallet_address` (VARCHAR), `encrypted_private_key` (VARCHAR).

**Tabel `products`:**
- Kolom: `id`, `umkm_profile_id`, `name`, `description`, `price_idr`, `price_usd`, `stock`, `image_url`.

**Tabel `transactions`:**
- Kolom: `tx_hash` (VARCHAR UNIQUE), `from_address` (VARCHAR), `to_address` (VARCHAR), `amount` (DOUBLE), `currency` (ENUM: 'IDR', 'USD'), `status`, `created_at`.
