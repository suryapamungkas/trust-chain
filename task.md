# Task List for Claude - TrustChain UMKM Redesign

Gunakan checklist ini untuk merombak proyek secara sistematis.

## Tahap 1: Setup & Konfigurasi Desain (Monochrome)
- [ ] Update `tailwind.config.ts` (jika ada) atau `globals.css` untuk menghapus warna bawaan dan memaksakan tema hitam-putih.
- [ ] Update komponen utama (`layout.tsx`, `navbar`, `sidebar`) menjadi gaya monochrome (Background putih, teks hitam, border hitam tajam, tanpa shadow berlebihan).
- [ ] Install library tambahan yang dibutuhkan:
  - `npm install ethers qrcode.react`
  - `npm install -D @types/qrcode.react` (jika perlu).

## Tahap 2: Update Database Schema (`src/lib/db.ts`)
- [ ] Tambahkan kolom `wallet_address` dan `encrypted_private_key` pada query pembentukan tabel `users`.
- [ ] Buat tabel `products` untuk keperluan Marketplace (id, nama, harga_idr, harga_usd, deskripsi, gambar).
- [ ] Update tabel `transactions` untuk mendukung simulasi blockchain yang menampilkan status, mata uang (IDR/USD), dan alamat wallet pengirim/penerima.

## Tahap 3: Logic Auto-Generate Wallet (Backend / API)
- [ ] Update *endpoint* registrasi (atau *seed data* di `db.ts`) agar setiap pembuatan akun baru secara otomatis memanggil fungsi dari `ethers.js` untuk membuat *wallet*.
- [ ] Pastikan wallet address disimpan ke database.

## Tahap 4: Dashboard UMKM (Seller)
- [ ] Buat/Rombak halaman `/umkm`. Desain dengan gaya elegan hitam-putih.
- [ ] Buat komponen **Wallet Card**: Menampilkan Wallet Address, QR Code (gunakan `qrcode.react`), dan saldo.
- [ ] Buat halaman **Manajemen Produk (CRUD)**: UMKM bisa menambah barang (Jamu/Herbal), mengedit, dan menghapus.

## Tahap 5: Dashboard Buyer (Marketplace)
- [ ] Buat/Rombak halaman `/buyer`. 
- [ ] Buat komponen **Marketplace Catalog**: Menampilkan grid produk jamu/herbal.
- [ ] Buat fungsi **Beli / Investasi**: Saat dibeli, saldo dompet (crypto/fiat) berkurang, saldo UMKM bertambah, dan memunculkan notifikasi sukses (simulasi transaksi blockchain).
- [ ] Buat komponen **Wallet Buyer**: Menampilkan saldo IDR & USD (stablecoin) dan fitur pindai/scan QR untuk bayar.

## Tahap 6: Dashboard Admin
- [ ] Rombak halaman `/admin`. Gunakan grafik berwarna hitam-putih/abu-abu (jika menggunakan Chart.js/Recharts).
- [ ] Tampilkan tabel keseluruhan (Global Transaction Logs) dengan *hash* transaksi (bisa di-*click*).
- [ ] Pastikan fitur Verifikasi UMKM berjalan sempurna.

## Tahap 7: Review & Polish
- [ ] Pastikan tidak ada warna mencolok (merah/biru/hijau), gunakan hitam, putih, dan abu-abu.
- [ ] Lakukan pengujian CRUD produk dan simulasi perpindahan saldo dompet kripto.
