const mysql = require('mysql2/promise');
const crypto = require('crypto');

function generateTxHash() {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'trustchain_umkm',
  });

  console.log('Seeding rich relations data into MySQL (`trustchain_umkm`)...');

  // 1. Get profiles and products
  const [profiles] = await pool.query('SELECT id, user_id, business_name FROM umkm_profiles');
  const [products] = await pool.query('SELECT id, umkm_profile_id, name FROM products');
  const [transactions] = await pool.query('SELECT id, from_user_id, to_user_id FROM transactions');
  const [users] = await pool.query('SELECT id, name, role FROM users');

  // 2. Insert Certifications
  for (const profile of profiles.slice(0, 15)) {
    const profileProducts = products.filter(p => p.umkm_profile_id === profile.id);
    const prodId = profileProducts.length > 0 ? profileProducts[0].id : null;

    const certTypes = [
      { type: 'BPOM', name: 'Sertifikat Izin Edar BPOM RI TR.212345671', issuer: 'Badan Pengawas Obat dan Makanan (BPOM)' },
      { type: 'Halal', name: 'Sertifikat Halal MUI ID31110000123450923', issuer: 'BPJPH Kemenag RI / LPPOM MUI' },
      { type: 'SNI', name: 'Sertifikat SNI 01-4433-1998 (Obat Tradisional)', issuer: 'Badan Standardisasi Nasional (BSN)' },
      { type: 'CPOTB', name: 'Sertifikat Cara Pembuatan Obat Tradisional yang Baik', issuer: 'Direktorat Pengawasan Obat Tradisional BPOM' }
    ];

    for (const c of certTypes) {
      await pool.query(
        `INSERT IGNORE INTO certifications (umkm_profile_id, product_id, type, name, issuer, issued_at, valid_until, status, tx_hash)
         VALUES (?, ?, ?, ?, ?, NOW() - INTERVAL FLOOR(RAND()*365) DAY, NOW() + INTERVAL FLOOR(RAND()*730) DAY, 'active', ?)`,
        [profile.id, prodId, c.type, c.name, c.issuer, generateTxHash()]
      );
    }
  }
  console.log(' - Certifications seeded successfully.');

  // 3. Insert Supply Chain Tracking
  for (const tx of transactions) {
    const steps = [
      { status: 'Bahan Baku Verifikasi', location: 'Gudang Pusat UMKM' },
      { status: 'Sertifikasi & Uji Lab BPOM', location: 'Laboratorium Uji Mutu Jakarta' },
      { status: 'Pengemasan & Smart Contract Hashed', location: 'Pabrik Pengemasan' },
      { status: 'Dalam Pengiriman Logistik', location: 'Pelabuhan Tanjung Priok / Cargo Hub' },
      { status: 'Diterima Distributor / Buyer', location: 'Gudang Pembeli' }
    ];

    for (const step of steps) {
      await pool.query(
        `INSERT IGNORE INTO supply_chain_tracking (transaction_id, status, location, tx_hash, updated_by_id, created_at)
         VALUES (?, ?, ?, ?, ?, NOW() - INTERVAL FLOOR(RAND()*10) HOUR)`,
        [tx.id, step.status, step.location, generateTxHash(), tx.to_user_id]
      );
    }
  }
  console.log(' - Supply Chain Tracking steps seeded successfully.');

  // 4. Insert Export Documents
  for (const profile of profiles.slice(0, 10)) {
    const docs = [
      { type: 'Phytosanitary Certificate', url: '/docs/phytosanitary_cert.pdf', status: 'approved' },
      { type: 'Certificate of Origin (COO)', url: '/docs/certificate_of_origin.pdf', status: 'approved' },
      { type: 'BPOM Export License', url: '/docs/bpom_export_license.pdf', status: 'approved' },
      { type: 'Commercial Invoice & Packing List', url: '/docs/invoice_packing_list.pdf', status: 'pending' }
    ];

    for (const doc of docs) {
      await pool.query(
        `INSERT IGNORE INTO export_documents (umkm_profile_id, document_type, file_url, status, review_notes)
         VALUES (?, ?, ?, ?, ?)`,
        [profile.id, doc.type, doc.url, doc.status, doc.status === 'approved' ? 'Dokumen telah diverifikasi dan memenuhi standar ekspor internasional.' : 'Sedang dalam proses pengecekan kelengkapan Bea Cukai.']
      );
    }
  }
  console.log(' - Export Documents seeded successfully.');

  // 5. Insert Chat Rooms & Messages
  const buyers = users.filter(u => u.role === 'buyer');
  const umkms = users.filter(u => u.role === 'umkm');

  if (buyers.length > 0 && umkms.length > 0) {
    for (let i = 0; i < Math.min(3, buyers.length); i++) {
      const b = buyers[i];
      const u = umkms[i % umkms.length];
      const prod = products.find(p => p.umkm_profile_id === u.id) || null;

      const [roomRes] = await pool.query(
        `INSERT IGNORE INTO chat_rooms (user1_id, user2_id, product_id, last_message, last_message_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [b.id, u.id, prod ? prod.id : null, 'Apakah produk ini siap untuk diekspor ke Singapura/Eropa dalam kuantitas 10.000 botol?']
      );

      const roomId = roomRes.insertId || 1; // if already exists or newly inserted

      // Check if messages already exist in this room
      const [msgCheck] = await pool.query('SELECT COUNT(*) as cnt FROM chat_messages WHERE room_id = ?', [roomId]);
      if (msgCheck[0].cnt === 0) {
        await pool.query(
          `INSERT INTO chat_messages (room_id, sender_id, message, message_type, is_read, created_at)
           VALUES (?, ?, ?, 'text', 1, NOW() - INTERVAL 2 HOUR)`,
          [roomId, b.id, `Halo ${u.name}, kami tertarik dengan produk Anda. Apakah bisa minta quotation harga untuk ekspor 10.000 botol?`]
        );
        await pool.query(
          `INSERT INTO chat_messages (room_id, sender_id, message, message_type, is_read, created_at)
           VALUES (?, ?, ?, 'text', 1, NOW() - INTERVAL 1 HOUR)`,
          [roomId, u.id, `Halo Pak/Bu! Tentu siap. Semua produk kami sudah memiliki sertifikasi BPOM dan CPOTB lengkap, serta tercatat di blockchain TrustChain.`]
        );
        await pool.query(
          `INSERT INTO chat_messages (room_id, sender_id, message, message_type, is_read, created_at)
           VALUES (?, ?, ?, 'text', 0, NOW())`,
          [roomId, b.id, `Apakah produk ini siap untuk diekspor ke Singapura/Eropa dalam kuantitas 10.000 botol?`]
        );
      }
    }
  }
  console.log(' - Chat Rooms & Messages seeded successfully.');

  await pool.end();
  console.log('All rich relations seeding completed cleanly!');
}

main().catch(console.error);
