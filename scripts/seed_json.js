const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function generateWallet() {
  return '0x' + crypto.randomBytes(20).toString('hex');
}

function generateTxHash() {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

function extractProvince(wilayah) {
  if (!wilayah || wilayah === 'NULL') return 'DKI Jakarta';
  const mapping = {
    'Jakarta': 'DKI Jakarta', 'Jawa Barat': 'Jawa Barat', 'Jawa Timur': 'Jawa Timur',
    'Jawa Tengah': 'Jawa Tengah', 'Banten': 'Banten', 'Sumatera Utara': 'Sumatera Utara',
    'Bali': 'Bali', 'Sulawesi Selatan': 'Sulawesi Selatan',
  };
  const w = String(wilayah).toLowerCase();
  for (const [key, prov] of Object.entries(mapping)) {
    if (w.includes(key.toLowerCase())) return prov;
  }
  return wilayah;
}

async function main() {
  // 1. Setup Images
  const imagesDir = path.join(__dirname, '../public/products');
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
  
  const brainDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\96ed6433-fd37-4454-b139-7c3cd53ae5c9';
  const imgMap = {
    'minyak': 'minyak_gosok_1779978075477.png',
    'kapsul': 'kapsul_herbal_1779978093550.png',
    'minuman': 'minuman_herbal_1779978109651.png',
    'salep': 'salep_herbal_1779978128790.png',
    'teh': 'teh_herbal_1779978150121.png',
  };

  for (const [name, filename] of Object.entries(imgMap)) {
    const src = path.join(brainDir, filename);
    const dest = path.join(imagesDir, `${name}.png`);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    } else {
      console.warn(`Warning: ${src} not found`);
    }
  }

  // 2. Connect to DB
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'trustchain_umkm',
  });

  // 3. Read JSON
  const jsonPath = fs.existsSync(path.join(__dirname, '../data/dataset_35.json'))
    ? path.join(__dirname, '../data/dataset_35.json')
    : path.join(__dirname, '../dataset_35.json');
  const dataset = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${dataset.length} items from JSON`);

  const defaultPassword = await bcrypt.hash('umkm123', 10);

  // Clear old products (keep 1-7 from seed)
  // await pool.query('DELETE FROM products WHERE id > 7');

  for (let i = 0; i < dataset.length; i++) {
    const item = dataset[i];
    const nama_industri = item.nama_industri || `UMKM ${i}`;
    const alamat = item.alamat || '';
    const wilayah = item.wilayah || '';
    const tipe = item.tipe_industri || 'UD';
    const province = extractProvince(wilayah);
    
    const email = `umkm${i+100}@trustchain.id`;
    const wallet = generateWallet();
    
    // Insert User
    const [userResult] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, address, wallet_address, balance_idr, balance_usd)
       VALUES (?, ?, ?, 'umkm', ?, ?, ?, ?)`,
      [nama_industri, email, defaultPassword, alamat, wallet, Math.floor(Math.random() * 90000000) + 10000000, Math.floor(Math.random() * 4000) + 1000]
    );
    const userId = userResult.insertId;
    
    // Insert UMKM Profile
    const [profileResult] = await pool.query(
      `INSERT INTO umkm_profiles (user_id, business_name, business_type, province, city, category, description, verification_status)
       VALUES (?, ?, ?, ?, ?, 'Obat Tradisional', ?, 'verified')`,
      [userId, nama_industri, tipe, province, wilayah, `Toko ${nama_industri} menjual berbagai produk herbal dan obat tradisional berkualitas tinggi.`]
    );
    const profileId = profileResult.insertId;
    
    // Assign a product category
    const cats = [
      ["Minyak Gosok Tradisional", "Minyak", 35000, 2.5, "/images/products/minyak.png"],
      ["Kapsul Ekstrak Herbal", "Suplemen", 85000, 5.5, "/images/products/kapsul.png"],
      ["Sirup Jamu Herbal", "Jamu Cair", 45000, 3.0, "/images/products/minuman.png"],
      ["Salep Kulit Alami", "Kosmetik", 30000, 2.0, "/images/products/salep.png"],
      ["Teh Seduh Organik", "Minuman", 55000, 3.8, "/images/products/teh.png"]
    ];
    
    const [prodName, prodCat, price, usd, img] = cats[i % 5];
    const finalProdName = `${prodName} ${nama_industri.substring(0, 10)}`;
    
    // Insert Product
    await pool.query(
      `INSERT INTO products (umkm_profile_id, name, category, description, price_idr, price_usd, stock, unit, image_url, blockchain_hash, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pcs', ?, ?, 'active')`,
      [profileId, finalProdName, prodCat, `Produk unggulan dari ${nama_industri}.`, price, usd, Math.floor(Math.random() * 450) + 50, img, generateTxHash()]
    );
  }
  
  console.log('Successfully seeded 35 UMKM profiles and 35 products!');

  // Update existing 5 herbalindo farma products to have images
  const herbalImages = [
    ["/images/products/minuman.png", 1],
    ["/images/products/kapsul.png", 2],
    ["/images/products/teh.png", 3],
    ["/images/products/minyak.png", 4],
  ];

  for (const [img, pId] of herbalImages) {
    await pool.query('UPDATE products SET image_url = ? WHERE id = ?', [img, pId]);
  }
  
  console.log('Updated Herbalindo images!');
  
  pool.end();
}

main().catch(console.error);
