# Proposal Submission Tahap 2: TrustChain UMKM

## 1. Identitas Tim
* **ID Tim:** S0339
* **Nama Tim:** S0339
* **Proposal Title:** TrustChain UMKM: Ekosistem Blockchain & AI untuk Rantai Pasokan Transparan dan Kesiapan Ekspor UMKM Indonesia
* **Team Composition:** 
  1. Muhammad Bazwa Arigusna (Ketua) - *Project Manager & Full-stack Developer*
  2. Nur Hidayat Surya Pamungkas (Anggota) - *AI Engineer & Smart Contract Developer*
  3. Alvia Nabila Azzahra (Anggota) - *UI/UX Designer & System Analyst*

---

## 2. Ringkasan & Definisi Masalah (Problem)
* **Executive Summary:** TrustChain UMKM adalah platform inovatif berbasis kecerdasan buatan (AI) dan Blockchain yang dirancang khusus untuk merevolusi rantai pasokan UMKM di Indonesia. Masalah utama yang kami selesaikan adalah rendahnya kepercayaan pasar global terhadap produk UMKM akibat kurangnya transparansi dan kesulitan dalam melacak keaslian (traceability) serta sertifikasi produk. Melalui TrustChain, seluruh perjalanan produk dari hulu ke hilir dicatat di dalam buku besar blockchain yang *immutable*, dilengkapi dengan AI untuk menganalisa tren, risiko, dan kesiapan ekspor. Dampak utama yang kami targetkan adalah peningkatan drastis pada kredibilitas produk UMKM lokal sehingga mereka dapat dengan mudah menembus pasar internasional.
* **Problem Statement:** UMKM Indonesia memiliki potensi besar namun kesulitan bersaing di pasar global maupun lokal kelas menengah ke atas karena ketiadaan sistem pelacakan rantai pasokan yang transparan, minimnya verifikasi sertifikasi yang terpercaya (anti-pemalsuan), serta keterbatasan pemahaman terhadap data dan tren pasar ekspor.
* **Primary Sub-Problem Statement:** 
  1. Sulitnya pembeli (baik B2B maupun B2C) memverifikasi klaim keaslian, kehalalan, atau standar organik suatu produk UMKM.
  2. Fragmentasi data antara produsen, distributor, dan konsumen yang menyulitkan audit mutu.
  3. Proses verifikasi dokumen administratif dan sertifikasi ekspor yang masih sangat manual dan rentan pemalsuan.
* **Problem Validation:** Inti permasalahannya adalah krisis kepercayaan dan inefisiensi data. Di era pasar modern, konsumen dan mitra B2B (terutama di luar negeri) menuntut *provenance* (asal-usul) barang yang sangat jelas. Jika sebuah UMKM mengklaim produknya "100% Organik" atau "Halal", tidak ada infrastruktur digital yang murah dan mudah diakses untuk membuktikan hal tersebut secara mutlak. Akar masalahnya terletak pada infrastruktur pencatatan UMKM yang masih tradisional dan tidak saling terintegrasi.

---

## 3. Solusi & Keselarasan Sistem (Solution & Alignment)
* **Problem–Solution Mapping:** 
  - *Problem:* Sulit verifikasi keaslian → *Solusi:* Pencatatan *Supply Chain* di Blockchain (Smart Contract) → *Outcome:* Data permanen yang tidak bisa dipalsukan (Immutable traceability).
  - *Problem:* Pemalsuan sertifikat → *Solusi:* Verifikasi sertifikasi terintegrasi dengan persetujuan Admin/Sistem terpusat → *Outcome:* Pembeli bisa mempercayai kredibilitas *seller*.
  - *Problem:* Ketidaksiapan bersaing → *Solusi:* Modul AI Analytics → *Outcome:* Prediksi permintaan dan penilaian kelayakan kredit UMKM.
* **Ecosystem Alignment:** Solusi ini dirancang untuk menjadi jembatan antara UMKM, pembeli B2B/B2C, lembaga sertifikasi, dan pemerintah. Dengan adanya *dashboard* khusus Admin (sebagai regulator/verifikator), platform ini memastikan kepatuhan (compliance) terhadap regulasi lokal mengenai standar mutu (BPOM/Halal). 
* **Solution Approach & Mechanism:** Platform kami berjalan secara *end-to-end*. UMKM mendaftar dan memverifikasi profil mereka (disetujui oleh admin). Setelah terverifikasi, UMKM dapat membuat produk dan menambahkan *log* pelacakan (misal: "Barang dipanen", "Barang dikemas") ke dalam sistem yang dikunci oleh teknologi Blockchain. Pembeli dapat melihat riwayat lengkap perjalanan produk ini sebelum melakukan pembelian (menggunakan fitur *Marketplace* terintegrasi). Semua transaksi tercatat menggunakan sistem Wallet internal.

---

## 4. Dampak & Nilai Strategis (Impact & Value)
* **Impact Scale & Targets:** Dampak utama dari solusi ini adalah terciptanya ekosistem UMKM yang *trustless* (dapat dipercaya tanpa keraguan). Skala dampaknya kami proyeksikan secara nasional, menargetkan ribuan UMKM di sektor agrikultur, herbal, kriya, dan makanan olahan yang ingin *go international* atau meningkatkan *brand value* mereka.
* **Impact Measurement:** Keberhasilan akan diukur melalui: 
  1. Jumlah UMKM terverifikasi yang bergabung.
  2. *Gross Merchandise Value* (GMV) transaksi yang terjadi di dalam ekosistem.
  3. Jumlah produk yang memiliki *track record* blockchain penuh dari hulu ke hilir.
  4. Peningkatan rasio UMKM yang berhasil mengekspor produknya setelah menggunakan sistem ini.
* **System & Public Value Proposition:** Untuk masyarakat luas, TrustChain menjamin hak konsumen untuk mendapatkan produk yang benar-benar asli, aman, dan sesuai klaim. Untuk ekosistem nasional, TrustChain mendigitalkan dan menaikkan level kredibilitas ekonomi kerakyatan Indonesia agar setara dengan standar operasional korporasi multinasional.

---

## 5. Inovasi & Keunikan (Innovation)
* **Solution Originality:** Kebanyakan platform UMKM saat ini hanya berfokus pada sisi *marketplace* (penjualan). TrustChain mengambil langkah lebih jauh dengan menjadi *Trust Platform*. Kami tidak hanya menjual barang, tetapi menjual "Kepercayaan" melalui *Traceability Blockchain* yang sebelumnya hanya digunakan oleh perusahaan-perusahaan logistik raksasa.
* **Technological / Method Innovation:** Kami mengintegrasikan Web3 (Blockchain/Smart Contracts via Ethers.js) dengan Web2 tradisional (Next.js & MySQL) sehingga pengguna biasa tidak perlu memahami rumitnya *crypto wallet* (Metamask, dll) untuk mendapatkan manfaat keamanan blockchain. Semuanya diabstraksi di balik UI/UX yang *seamless* dan elegan. Kami juga menambahkan lapisan Kecerdasan Buatan (AI) untuk memberikan analisis cerdas bagi UMKM.
* **Creativity in Implementation:** Kreativitas kami terletak pada model gamifikasi kepercayaan. Semakin lengkap *tracking* yang dicatat oleh sebuah UMKM pada produknya, semakin tinggi "Trust Score" mereka, yang akan membuat produk mereka muncul paling atas pada pencarian pembeli/investor. 

---

## 6. Teknis & Kelayakan (Technical & Feasibility)
* **System Architecture:** Sistem kami dibangun menggunakan arsitektur modern Monorepo dengan Next.js 16 (App Router) sebagai *Full-stack framework*. Sistem database relasional dikelola oleh MySQL untuk data pengguna dan transaksi (*off-chain*), sementara bukti integritas (*proof of integrity*) data suplai dicatat pada Blockchain menggunakan Smart Contract (Ethereum/EVM Compatible) yang berinteraksi melalui pustaka *Ethers.js*. Pengguna diotentikasi menggunakan JWT (JSON Web Tokens).
* **Data & Feasibility:** Data di dalam aplikasi berasal dari input langsung UMKM (First-party data) yang divalidasi oleh sistem administrasi. Selain itu, kami juga merancang sistem untuk bisa menyerap data sekunder (seperti *dataset* UMKM Obat Tradisional) untuk memperkaya analisis AI. Infrastruktur telah terbukti dapat dideploy di *environment* Linux standar (seperti cPanel/Passenger).
* **Security & Compliance:** Keamanan data pengguna diamankan melalui enkripsi bcrypt untuk kata sandi, perlindungan rute via *Middleware* / pengecekan JWT tingkat *server*, serta pemisahan data sensitif di luar *public ledger*. Kepatuhan terhadap kebenaran data dijamin oleh sistem persetujuan ganda (Admin Approval) untuk hal-hal vital seperti penghapusan produk atau verifikasi dokumen.
* **Implementation Readiness (MVP):** Saat ini (Status MVP), sistem inti telah berhasil beroperasi di lingkungan *production* langsung (cPanel). Fitur otentikasi (Admin, UMKM, Buyer), *dashboard* masing-masing *role*, manajemen produk, *wallet*, dan simulasi *marketplace* telah selesai dibangun dan siap pakai.

---

## 7. Model Bisnis & Keberlanjutan (Business Model)
* **Value Proposition:** 
  - *Untuk UMKM:* Alat validasi untuk meningkatkan harga jual dan daya saing ekspor.
  - *Untuk Buyer B2B/B2C:* Keamanan transaksi dan kepastian kualitas produk yang dibeli.
* **Model Revenue / Funding:** 
  1. *Transaction Fee:* Memotong komisi persentase kecil (misalnya 1-2%) dari setiap transaksi sukses yang terjadi di dalam *marketplace* TrustChain.
  2. *Verification Fee:* Biaya administrasi ringan untuk proses verifikasi dokumen dan sertifikasi oleh Admin atau lembaga audit pihak ketiga.
* **Cost Structure & Sustainability:** Biaya terbesar ada pada infrastruktur *cloud/server*, pemeliharaan *smart contract*, dan operasional Admin. Dengan basis pengguna yang terus berkembang melalui transaksi *marketplace*, profitabilitas jangka panjang dapat dijaga secara berkelanjutan.
* **Scalability:** Arsitektur berbasis Node.js dan Next.js sangat mudah di-*scale* secara horizontal. Model bisnis *platform-based* memungkinkan ekspansi ke jutaan pengguna tanpa batasan ruang fisik. Penggunaan blockchain juga tidak membebani penyimpanan *server* internal.
* **Partnership & Distribution:** Kami menargetkan kolaborasi strategis dengan Kementerian Koperasi & UKM, BPJPH (Halal), serta perusahaan ekspedisi (Logistik) untuk menghubungkan API sistem pengiriman secara langsung.

---

## 8. Pasar & Kesiapan Pengguna (Market & Adoption)
* **Problem–Market Fit:** Era pasca-pandemi dan globalisasi memaksa konsumen lebih peduli pada aspek kesehatan, higienitas, dan asal-usul (organik/fair-trade) suatu produk. Di sisi lain, UMKM lokal sedang gencar didorong untuk ekspor. Solusi kami bertemu tepat di tengah-tengah perpotongan kebutuhan (demand) keamanan konsumen dan kebutuhan (supply) validasi UMKM.
* **Evidence of Demand:** Berdasarkan data kementerian, ribuan produk UMKM sering tertolak di pasar Eropa atau negara maju karena gagal melacak asal muasal bahan bakunya (*traceability failure*). Semakin menjamurnya pemalsuan barang herbal (seperti di dataset kami terkait Obat Tradisional) adalah bukti nyata dibutuhkannya solusi ini.
* **Target Market:** 
  1. UMKM Menengah & Atas (F&B, Herbal, Kerajinan Tangan) yang ingin / sedang melakukan ekspor.
  2. Pembeli Korporat (B2B), Importir luar negeri, maupun individu (B2C) yang *health/quality conscious*.
* **Adoption Readiness:** Sangat mudah. Aplikasi berbasis web (Progressive Web App) yang tidak memerlukan instalasi rumit. UX dirancang sama persis dengan aplikasi E-commerce pada umumnya, menyembunyikan segala kompleksitas *crypto* dari pengguna awam.

---

## 9. Perkembangan Proyek (Progress)
* **Progress Since the 1st Submission:** Sejak tahap pengajuan pertama, kami telah berhasil merealisasikan rancangan menjadi aplikasi yang *live* dan fungsional. Proses integrasi *database* ke server *cloud* (cPanel) yang stabil berhasil diselesaikan dengan baik, dan modul-modul peran (Admin, UMKM, Buyer) telah berfungsi sebagaimana rancangan.
* **Current Status:** **Prototype / Pilot** (Sistem sudah live dan dapat diakses, dengan integrasi database *real-time* dan sistem autentikasi yang berjalan penuh).
* **Link Attachment (URL):** [https://trustchainumkm.site](https://trustchainumkm.site)
