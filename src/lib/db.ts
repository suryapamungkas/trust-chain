import bcrypt from "bcryptjs";
import { ethers } from "ethers";
import crypto from "crypto";
import { checkEnvOnStartup } from "./env-check";

// =====================================================================
// WALLET ENCRYPTION (AES-256-CBC)
// =====================================================================
const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY || "tc-umkm-default-encrypt-key-2026!";

function getEncryptionKey(): Buffer {
  return crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
}

export function encryptPrivateKey(privateKey: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getEncryptionKey(), iv);
  let encrypted = cipher.update(privateKey, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decryptPrivateKey(encryptedKey: string): string {
  try {
    const [ivHex, encrypted] = encryptedKey.split(":");
    if (!ivHex || !encrypted) return encryptedKey; // fallback for unencrypted legacy keys
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", getEncryptionKey(), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return encryptedKey; // fallback for unencrypted legacy keys
  }
}

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "trustchain_umkm",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export type RowDataPacket = Record<string, unknown>;
export type ResultSetHeader = { insertId: number; affectedRows: number; [key: string]: unknown };

export interface PoolConnectionInterface {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<[T, unknown]>;
  execute<T = unknown>(sql: string, params?: unknown[]): Promise<[T, unknown]>;
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  release(): void;
}

export interface PoolInterface {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<[T, unknown]>;
  execute<T = unknown>(sql: string, params?: unknown[]): Promise<[T, unknown]>;
  getConnection(): Promise<PoolConnectionInterface>;
}

export type Pool = PoolInterface;

// Singleton pool
let _pool: PoolInterface | null = null;

// Track whether env has been validated
let _envChecked = false;

export async function getDb(): Promise<PoolInterface> {
  if (!_pool) {
    // Validate environment on first DB access
    if (!_envChecked) {
      checkEnvOnStartup();
      _envChecked = true;
    }
    // Dynamic import to avoid Turbopack bundling issues with native modules
    const mysqlLib = await import("mysql2/promise");
    _pool = (mysqlLib as unknown as { createPool: (config: typeof dbConfig) => PoolInterface }).createPool(dbConfig);
    // Initialize schema when first connecting
    await initializeSchema(_pool!);
  }
  return _pool!;
}

// =====================================================================
// WALLET HELPER
// =====================================================================
export function generateWallet(): {
  address: string;
  privateKey: string;
} {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: encryptPrivateKey(wallet.privateKey),
  };
}

export function generateTxHash(): string {
  return "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

// =====================================================================
// SCHEMA
// =====================================================================
async function initializeSchema(pool: mysql.Pool) {
  await pool.query("SET FOREIGN_KEY_CHECKS=0;");

  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'umkm', 'buyer') NOT NULL,
      avatar VARCHAR(255),
      phone VARCHAR(50),
      address TEXT,
      wallet_address VARCHAR(255),
      wallet_private_key VARCHAR(255),
      balance_idr DOUBLE DEFAULT 0,
      balance_usd DOUBLE DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP NULL,
      is_active BOOLEAN DEFAULT TRUE,
      theme_preference VARCHAR(50) DEFAULT 'dark'
    )`,
    `CREATE TABLE IF NOT EXISTS umkm_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      business_name VARCHAR(255) NOT NULL,
      business_type VARCHAR(100),
      province VARCHAR(100),
      city VARCHAR(100),
      category VARCHAR(100),
      description TEXT,
      nib_number VARCHAR(100),
      npwp VARCHAR(100),
      reliability_score INT DEFAULT 0,
      verification_status ENUM('verified', 'pending', 'unverified', 'rejected') DEFAULT 'pending',
      credit_score INT DEFAULT 0,
      annual_revenue DOUBLE DEFAULT 0,
      employees INT DEFAULT 0,
      export_ready BOOLEAN DEFAULT FALSE,
      total_products INT DEFAULT 0,
      certifications TEXT,
      alamat_lengkap TEXT,
      tipe_industri VARCHAR(100),
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS buyer_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      company_name VARCHAR(255),
      company_type ENUM('investor', 'buyer', 'distributor', 'bank', 'government'),
      country VARCHAR(100),
      investment_range_min DOUBLE DEFAULT 0,
      investment_range_max DOUBLE DEFAULT 0,
      interests TEXT,
      total_investments INT DEFAULT 0,
      total_invested DOUBLE DEFAULT 0,
      verified BOOLEAN DEFAULT FALSE,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      umkm_profile_id INT,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      description TEXT,
      price_idr DOUBLE DEFAULT 0,
      price_usd DOUBLE DEFAULT 0,
      stock INT DEFAULT 0,
      unit VARCHAR(50) DEFAULT 'pcs',
      image_url VARCHAR(500),
      blockchain_hash VARCHAR(255),
      certifications TEXT,
      status ENUM('active', 'inactive', 'sold_out', 'pending', 'rejected') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (umkm_profile_id) REFERENCES umkm_profiles(id)
    )`,
    `CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tx_hash VARCHAR(255) UNIQUE,
      from_address VARCHAR(255),
      to_address VARCHAR(255),
      from_user_id INT,
      to_user_id INT,
      product_id INT NULL,
      amount DOUBLE DEFAULT 0,
      currency VARCHAR(50) DEFAULT 'IDR',
      type ENUM('purchase', 'top_up', 'transfer', 'certification', 'escrow', 'withdrawal', 'tax') DEFAULT 'transfer',
      status ENUM('confirmed', 'pending', 'failed') DEFAULT 'confirmed',
      description TEXT,
      block_number INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_user_id) REFERENCES users(id),
      FOREIGN KEY (to_user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`,
    `CREATE TABLE IF NOT EXISTS certifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      umkm_profile_id INT,
      product_id INT NULL,
      type VARCHAR(100) NOT NULL,
      name VARCHAR(255) NOT NULL,
      issuer VARCHAR(255),
      issued_at TIMESTAMP NULL,
      valid_until TIMESTAMP NULL,
      status ENUM('active', 'expired', 'pending', 'revoked') DEFAULT 'active',
      tx_hash VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (umkm_profile_id) REFERENCES umkm_profiles(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS supply_chain_tracking (
      id INT AUTO_INCREMENT PRIMARY KEY,
      transaction_id INT NOT NULL,
      status VARCHAR(100) NOT NULL,
      location VARCHAR(255) NOT NULL,
      tx_hash VARCHAR(255) NOT NULL,
      updated_by_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
      FOREIGN KEY (updated_by_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS export_documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      umkm_profile_id INT NOT NULL,
      document_type VARCHAR(100) NOT NULL,
      file_url VARCHAR(500) NOT NULL,
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      reviewed_by INT NULL,
      review_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (umkm_profile_id) REFERENCES umkm_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS chat_rooms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user1_id INT NOT NULL,
      user2_id INT NOT NULL,
      product_id INT NULL,
      last_message TEXT,
      last_message_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
      UNIQUE KEY unique_pair (user1_id, user2_id)
    )`,
    `CREATE TABLE IF NOT EXISTS chat_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      room_id INT NOT NULL,
      sender_id INT NOT NULL,
      message TEXT NOT NULL,
      message_type VARCHAR(50) DEFAULT 'text',
      attachment_url VARCHAR(512) NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE KEY unique_review (user_id, product_id)
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      transaction_id INT NOT NULL,
      buyer_user_id INT NOT NULL,
      seller_user_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      total_amount DOUBLE NOT NULL,
      currency VARCHAR(50) DEFAULT 'IDR',
      status ENUM('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled') DEFAULT 'pending',
      shipping_address TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id),
      FOREIGN KEY (buyer_user_id) REFERENCES users(id),
      FOREIGN KEY (seller_user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`,
  ];

  for (const tableQuery of tables) {
    await pool.query(tableQuery);
  }

  try {
    await pool.query("ALTER TABLE chat_messages MODIFY COLUMN message_type VARCHAR(50) DEFAULT 'text'");
  } catch { /* ignore */ }
  try {
    await pool.query("ALTER TABLE chat_messages ADD COLUMN attachment_url VARCHAR(512) NULL AFTER message_type");
  } catch { /* ignore */ }

  await pool.query("SET FOREIGN_KEY_CHECKS=1;");

  // Seed demo accounts if DB is empty
  const [rows] = (await pool.query(
    "SELECT COUNT(*) as cnt FROM users"
  )) as [RowDataPacket[], unknown];
  if (rows[0].cnt > 0) return;

  await seedDemoData(pool);
}

// =====================================================================
// SEED DATA
// =====================================================================
async function seedDemoData(pool: PoolInterface) {
  const adminHash = bcrypt.hashSync("admin123", 10);
  const umkmHash = bcrypt.hashSync("umkm123", 10);
  const buyerHash = bcrypt.hashSync("buyer123", 10);

  // Generate wallets for demo users
  const adminWallet = generateWallet();
  const umkm1Wallet = generateWallet();
  const umkm2Wallet = generateWallet();
  const buyer1Wallet = generateWallet();
  const buyer2Wallet = generateWallet();

  const insertUser = `
    INSERT INTO users (name, email, password_hash, role, phone, address, avatar, wallet_address, wallet_private_key, balance_idr, balance_usd)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await pool.query(insertUser, [
    "Admin TrustChain", "admin@trustchain.id", adminHash, "admin",
    "021-5550001", "Jakarta Pusat, DKI Jakarta", "A",
    adminWallet.address, adminWallet.privateKey, 0, 0,
  ]);

  const [umkm1Result] = (await pool.query(insertUser, [
    "Siti Rahayu", "siti@herbalindo.id", umkmHash, "umkm",
    "0812-3456-7890", "Jakarta Selatan, DKI Jakarta", "S",
    umkm1Wallet.address, umkm1Wallet.privateKey, 45000000, 2500,
  ])) as [ResultSetHeader, unknown];

  const [umkm2Result] = (await pool.query(insertUser, [
    "Bachtiar Musa", "bachtiar@jamugayo.id", umkmHash, "umkm",
    "0813-9876-5432", "Semarang, Jawa Tengah", "B",
    umkm2Wallet.address, umkm2Wallet.privateKey, 120000000, 8000,
  ])) as [ResultSetHeader, unknown];

  const [buyer1Result] = (await pool.query(insertUser, [
    "PT Investasi Nusantara Sehat", "investor@nusantarasehat.co.id", buyerHash, "buyer",
    "021-5551234", "Jakarta Selatan, DKI Jakarta", "I",
    buyer1Wallet.address, buyer1Wallet.privateKey, 500000000, 30000,
  ])) as [ResultSetHeader, unknown];

  const [buyer2Result] = (await pool.query(insertUser, [
    "Global Pharma Partners", "buyer@globalpharma.com", buyerHash, "buyer",
    "021-5559876", "Singapore", "G",
    buyer2Wallet.address, buyer2Wallet.privateKey, 1000000000, 65000,
  ])) as [ResultSetHeader, unknown];

  await pool.query("INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES (999, 'Pengunjung Web (Guest)', 'guest@trustchain.id', '', 'guest')");

  // UMKM Profiles
  const insertUmkm = `
    INSERT INTO umkm_profiles (user_id, business_name, business_type, province, city, category,
      description, nib_number, reliability_score, verification_status,
      credit_score, annual_revenue, employees, export_ready, total_products, tipe_industri, alamat_lengkap, certifications)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [umkm1Profile] = (await pool.query(insertUmkm, [
    umkm1Result.insertId, "HERBALINDO FARMA", "Obat Tradisional", "DKI Jakarta",
    "Kota Jakarta Selatan", "Jamu",
    "Produsen jamu dan obat tradisional berbahan herbal alami berkualitas tinggi dengan sertifikasi BPOM dan SNI.",
    "1234567890123456", 94, "verified", 88, 4500000000, 23, 1, 4, "PT",
    "Jl. Gatot Subroto No. 45, Kec. Setiabudi, Kota Jakarta Selatan",
    '["BPOM","SNI","Halal","CPOTB"]',
  ])) as [ResultSetHeader, unknown];

  const [umkm2Profile] = (await pool.query(insertUmkm, [
    umkm2Result.insertId, "JAMU GAYO SEHAT", "Obat Tradisional", "Jawa Tengah",
    "Kota Semarang", "Obat Tradisional",
    "Produsen obat tradisional dan suplemen herbal organik dengan sertifikasi BPOM.",
    "9876543210987654", 97, "verified", 92, 12000000000, 15, 1, 3, "CV",
    "Jl. Pandanaran No. 12, Kec. Semarang Tengah, Kota Semarang",
    '["BPOM","SNI","Halal"]',
  ])) as [ResultSetHeader, unknown];

  // Buyer Profiles
  const insertBuyer = `
    INSERT INTO buyer_profiles (user_id, company_name, company_type, country,
      investment_range_min, investment_range_max, interests, total_investments, total_invested, verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await pool.query(insertBuyer, [
    buyer1Result.insertId, "PT Investasi Nusantara Sehat", "investor", "Indonesia",
    500000000, 50000000000, "Obat Tradisional,Jamu,Suplemen Herbal", 12, 24500000000, 1,
  ]);
  await pool.query(insertBuyer, [
    buyer2Result.insertId, "Global Pharma Partners", "distributor", "Singapore",
    1000000000, 100000000000, "Obat Tradisional,Ekstrak Herbal,Minyak Atsiri", 8, 18200000000, 1,
  ]);

  // Products
  const insertProduct = `
    INSERT INTO products (umkm_profile_id, name, category, description, price_idr, price_usd, stock, unit, image_url, blockchain_hash, certifications, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await pool.query(insertProduct, [
    umkm1Profile.insertId, "Jamu Kunyit Asam Premium", "Jamu",
    "Jamu kunyit asam botol kaca 500ml, terbuat dari kunyit pilihan dan asam jawa alami.",
    45000, 2.8, 1000, "botol", "/products/kunyit-asam.jpg",
    generateTxHash(), '["BPOM","Halal"]', "active",
  ]);
  await pool.query(insertProduct, [
    umkm1Profile.insertId, "Ekstrak Temulawak", "Bahan Baku",
    "Ekstrak temulawak murni 1kg, kualitas farmasi untuk produksi obat herbal.",
    120000, 7.5, 500, "kg", "/products/temulawak.jpg",
    generateTxHash(), '["CPOTB"]', "active",
  ]);
  await pool.query(insertProduct, [
    umkm1Profile.insertId, "Teh Herbal Jahe Merah", "Minuman Herbal",
    "Teh celup jahe merah isi 20 sachet, menghangatkan dan menyehatkan tubuh.",
    35000, 2.2, 2500, "box", "/products/jahe-merah.jpg",
    generateTxHash(), '["BPOM","SNI"]', "active",
  ]);
  await pool.query(insertProduct, [
    umkm1Profile.insertId, "Minyak Angin Aromaterapi", "Obat Luar",
    "Minyak angin roll-on dengan campuran aromaterapi lavender dan eucalyptus.",
    25000, 1.6, 5000, "botol", "/products/minyak-angin.jpg",
    generateTxHash(), '["BPOM"]', "active",
  ]);
  await pool.query(insertProduct, [
    umkm2Profile.insertId, "Kapsul Habbatussauda", "Suplemen",
    "Kapsul habbatussauda (jintan hitam) 60 kapsul untuk daya tahan tubuh.",
    75000, 4.7, 800, "botol", "/products/habbatussauda.jpg",
    generateTxHash(), '["BPOM","Halal"]', "active",
  ]);
  await pool.query(insertProduct, [
    umkm2Profile.insertId, "Sirup Herbal Pegagan", "Minuman Herbal",
    "Sirup pegagan 250ml untuk meningkatkan konsentrasi dan daya ingat.",
    55000, 3.4, 600, "botol", "/products/pegagan.jpg",
    generateTxHash(), '["BPOM","SNI"]', "active",
  ]);
  await pool.query(insertProduct, [
    umkm2Profile.insertId, "Salep Herbal Kencur", "Obat Luar",
    "Salep kencur tradisional 50g untuk pegal linu dan nyeri otot.",
    30000, 1.9, 1200, "tube", "/products/salep-kencur.jpg",
    generateTxHash(), '["BPOM"]', "active",
  ]);

  // Transactions
  const insertTx = `
    INSERT INTO transactions (tx_hash, from_address, to_address, from_user_id, to_user_id, product_id, amount, currency, type, status, description, block_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await pool.query(insertTx, [
    generateTxHash(), buyer1Wallet.address, umkm1Wallet.address,
    buyer1Result.insertId, umkm1Result.insertId, 1,
    25000000, "IDR", "purchase", "confirmed", "Pembelian 555 botol Jamu Kunyit Asam Premium", 120005,
  ]);
  await pool.query(insertTx, [
    generateTxHash(), buyer2Wallet.address, umkm1Wallet.address,
    buyer2Result.insertId, umkm1Result.insertId, 2,
    60000000, "IDR", "purchase", "confirmed", "Pembelian 500kg Ekstrak Temulawak", 120010,
  ]);
  await pool.query(insertTx, [
    generateTxHash(), buyer1Wallet.address, umkm2Wallet.address,
    buyer1Result.insertId, umkm2Result.insertId, 5,
    37500000, "IDR", "purchase", "confirmed", "Pembelian 500 botol Kapsul Habbatussauda", 120050,
  ]);

  // Notifications
  const insertNotif = `
    INSERT INTO notifications (user_id, title, message, type, is_read)
    VALUES (?, ?, ?, ?, ?)
  `;
  await pool.query(insertNotif, [umkm1Result.insertId, "Pesanan Baru", "Anda menerima pesanan 555 botol Jamu Kunyit Asam Premium", "success", 0]);
  await pool.query(insertNotif, [umkm1Result.insertId, "Pembayaran Diterima", "Dana Rp 25.000.000 telah masuk ke wallet Anda", "success", 0]);
  await pool.query(insertNotif, [buyer1Result.insertId, "Pembelian Berhasil", "Transaksi pembelian Jamu Kunyit Asam Premium telah dikonfirmasi di blockchain", "success", 1]);
}

// =====================================================================
// USER CRUD
// =====================================================================
export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
  role: string
): Promise<number> {
  const pool = await getDb();
  const wallet = generateWallet();
  const initialBalanceIdr = role === "buyer" ? 100000000 : 0;
  const initialBalanceUsd = role === "buyer" ? 5000 : 0;

  const [result] = (await pool.query(
    `INSERT INTO users (name, email, password_hash, role, avatar, wallet_address, wallet_private_key, balance_idr, balance_usd)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, passwordHash, role, name.charAt(0).toUpperCase(), wallet.address, wallet.privateKey, initialBalanceIdr, initialBalanceUsd]
  )) as [ResultSetHeader, unknown];

  return result.insertId;
}

export async function createUmkmProfile(
  userId: number,
  data: { businessName: string; province?: string; city?: string }
): Promise<number> {
  const pool = await getDb();
  const [result] = (await pool.query(
    `INSERT INTO umkm_profiles (user_id, business_name, province, city, verification_status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [userId, data.businessName, data.province || "", data.city || ""]
  )) as [ResultSetHeader, unknown];
  return result.insertId;
}

export async function createBuyerProfile(
  userId: number,
  data: { companyName: string; country?: string }
): Promise<number> {
  const pool = await getDb();
  const [result] = (await pool.query(
    `INSERT INTO buyer_profiles (user_id, company_name, country, company_type)
     VALUES (?, ?, ?, 'buyer')`,
    [userId, data.companyName, data.country || "Indonesia"]
  )) as [ResultSetHeader, unknown];
  return result.insertId;
}

// =====================================================================
// USER QUERIES
// =====================================================================
// Safe columns that can be returned to the client (NO password_hash, NO wallet_private_key)
const USER_SAFE_COLUMNS = "id, name, email, role, avatar, phone, address, wallet_address, balance_idr, balance_usd, is_active, created_at, last_login, theme_preference";

export async function getUserByEmail(email: string) {
  const pool = await getDb();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT ${USER_SAFE_COLUMNS} FROM users WHERE email = ? AND is_active = 1`,
    [email]
  );
  return rows[0] || null;
}

/**
 * For authentication ONLY — returns password_hash for bcrypt comparison.
 * NEVER send this result to the client.
 */
export async function getUserByEmailForAuth(email: string) {
  const pool = await getDb();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, email, role, avatar, password_hash, wallet_address, balance_idr, balance_usd, theme_preference FROM users WHERE email = ? AND is_active = 1",
    [email]
  );
  return rows[0] || null;
}

export async function getUserById(id: number) {
  const pool = await getDb();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT ${USER_SAFE_COLUMNS} FROM users WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function getAllUsers() {
  const pool = await getDb();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, email, role, avatar, wallet_address, balance_idr, balance_usd, is_active, created_at, last_login FROM users ORDER BY created_at DESC"
  );
  return rows;
}

export async function updateUser(id: number, data: Record<string, unknown>) {
  const pool = await getDb();
  const allowedFields = ["name", "email", "phone", "address", "avatar", "is_active", "theme_preference", "balance_idr", "balance_usd", "last_login"];
  const filtered: Record<string, unknown> = {};
  for (const k of Object.keys(data)) {
    if (allowedFields.includes(k)) filtered[k] = data[k];
  }
  if (Object.keys(filtered).length === 0) return;
  const fields = Object.keys(filtered).map((k) => `${k} = ?`).join(", ");
  const values = Object.values(filtered);
  await pool.query(`UPDATE users SET ${fields} WHERE id = ?`, [...values, id]);
}

export async function deleteUser(id: number) {
  const pool = await getDb();
  await pool.query("UPDATE users SET is_active = 0 WHERE id = ?", [id]);
}

export async function updateLastLogin(userId: number) {
  const pool = await getDb();
  await pool.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [userId]);
}

// =====================================================================
// WALLET
// =====================================================================
export async function getWallet(userId: number) {
  const pool = await getDb();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT wallet_address, balance_idr, balance_usd FROM users WHERE id = ?",
    [userId]
  );
  return rows[0] || null;
}

export async function topUpWallet(userId: number, amount: number, currency: string) {
  const pool = await getDb();
  const col = currency === "USD" ? "balance_usd" : "balance_idr";
  await pool.query(`UPDATE users SET ${col} = ${col} + ? WHERE id = ?`, [amount, userId]);

  const user = await getUserById(userId);
  const txHash = generateTxHash();
  await pool.query(
    `INSERT INTO transactions (tx_hash, to_address, to_user_id, amount, currency, type, status, description, block_number)
     VALUES (?, ?, ?, ?, ?, 'top_up', 'confirmed', ?, ?)`,
    [txHash, user.wallet_address, userId, amount, currency, `Top-up ${currency} ${amount.toLocaleString()}`, Math.floor(Math.random() * 100000) + 200000]
  );
  return txHash;
}

// =====================================================================
// PRODUCTS CRUD
// =====================================================================
export async function getProducts(options?: {
  umkmProfileId?: number;
  category?: string;
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const pool = await getDb();
  let sql =
    "SELECT p.*, u.business_name as umkm_name, us.wallet_address as umkm_wallet FROM products p LEFT JOIN umkm_profiles u ON p.umkm_profile_id = u.id LEFT JOIN users us ON u.user_id = us.id WHERE 1=1";
  const params: unknown[] = [];

  if (options?.umkmProfileId) {
    sql += " AND p.umkm_profile_id = ?";
    params.push(options.umkmProfileId);
  }
  if (options?.category) {
    sql += " AND p.category = ?";
    params.push(options.category);
  }
  if (options?.search) {
    sql += " AND (p.name LIKE ? OR p.description LIKE ?)";
    params.push(`%${options.search}%`, `%${options.search}%`);
  }
  if (options?.status) {
    sql += " AND p.status = ?";
    params.push(options.status);
  }

  sql += " ORDER BY p.created_at DESC";

  if (options?.limit) {
    sql += " LIMIT ?";
    params.push(options.limit);
    if (options?.offset) {
      sql += " OFFSET ?";
      params.push(options.offset);
    }
  }

  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return rows;
}

export async function getProductById(id: number) {
  const pool = await getDb();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT p.*, u.business_name as umkm_name, us.wallet_address as umkm_wallet, us.id as umkm_user_id FROM products p LEFT JOIN umkm_profiles u ON p.umkm_profile_id = u.id LEFT JOIN users us ON u.user_id = us.id WHERE p.id = ?",
    [id]
  );
  return rows[0] || null;
}

export async function createProduct(data: {
  umkmProfileId: number;
  name: string;
  category: string;
  description: string;
  priceIdr: number;
  priceUsd: number;
  stock: number;
  unit: string;
  imageUrl?: string;
}) {
  const pool = await getDb();
  const hash = generateTxHash();
  const [result] = (await pool.query(
    `INSERT INTO products (umkm_profile_id, name, category, description, price_idr, price_usd, stock, unit, image_url, blockchain_hash, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [data.umkmProfileId, data.name, data.category, data.description, data.priceIdr, data.priceUsd, data.stock, data.unit, data.imageUrl || "", hash]
  )) as [ResultSetHeader, unknown];

  // Update product count
  await pool.query(
    "UPDATE umkm_profiles SET total_products = (SELECT COUNT(*) FROM products WHERE umkm_profile_id = ?) WHERE id = ?",
    [data.umkmProfileId, data.umkmProfileId]
  );

  return result.insertId;
}

export async function updateProduct(id: number, data: Record<string, unknown>) {
  const pool = await getDb();
  const allowedFields = ["name", "category", "description", "price_idr", "price_usd", "stock", "unit", "image_url", "status"];
  const filtered: Record<string, unknown> = {};
  for (const k of Object.keys(data)) {
    if (allowedFields.includes(k)) filtered[k] = data[k];
  }
  if (Object.keys(filtered).length === 0) return;
  const fields = Object.keys(filtered).map((k) => `${k} = ?`).join(", ");
  const values = Object.values(filtered);
  await pool.query(`UPDATE products SET ${fields} WHERE id = ?`, [...values, id]);
}

export async function deleteProduct(id: number) {
  const pool = await getDb();
  const [product] = await pool.query<RowDataPacket[]>("SELECT umkm_profile_id FROM products WHERE id = ?", [id]);
  // Soft delete: mark as deleted instead of removing, preserving referential data
  await pool.query("UPDATE products SET status = 'inactive' WHERE id = ?", [id]);
  if (product[0]) {
    await pool.query(
      "UPDATE umkm_profiles SET total_products = (SELECT COUNT(*) FROM products WHERE umkm_profile_id = ? AND status != 'inactive') WHERE id = ?",
      [product[0].umkm_profile_id, product[0].umkm_profile_id]
    );
  }
}

// =====================================================================
// MARKETPLACE (PURCHASE)
// =====================================================================
export async function purchaseProduct(buyerUserId: number, productId: number, quantity: number, currency: string, destinationCountry: string = "Indonesia") {
  const pool = await getDb();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [productRows] = await conn.query("SELECT p.*, u.business_name as umkm_name, us.wallet_address as umkm_wallet, us.id as umkm_user_id FROM products p LEFT JOIN umkm_profiles u ON p.umkm_profile_id = u.id LEFT JOIN users us ON u.user_id = us.id WHERE p.id = ?", [productId]);
    const product = (productRows as RowDataPacket[])[0];
    if (!product) throw new Error("Produk tidak ditemukan");
    if (product.stock < quantity) throw new Error("Stok tidak mencukupi");

    const price = currency === "USD" ? product.price_usd : product.price_idr;
    const subtotal = price * quantity;
    const taxRate = 0.11; // 11% PPN
    const taxAmount = subtotal * taxRate;
    const buyerPays = subtotal + taxAmount;

    const [buyerRows] = await conn.query("SELECT * FROM users WHERE id = ?", [buyerUserId]);
    const buyer = (buyerRows as RowDataPacket[])[0];
    if (!buyer) throw new Error("Buyer tidak ditemukan");

    const balanceField = currency === "USD" ? "balance_usd" : "balance_idr";
    if (buyer[balanceField] < buyerPays) throw new Error("Saldo tidak mencukupi");

    const sellerUserId = product.umkm_user_id;

    // Get Admin User
    const [adminRows] = await conn.query("SELECT id, wallet_address FROM users WHERE role = 'admin' LIMIT 1");
    const adminUser = (adminRows as RowDataPacket[])[0];
    if (!adminUser) throw new Error("Admin tidak ditemukan untuk penerimaan pajak");

    // Deduct buyer balance (subtotal + tax)
    await conn.query(`UPDATE users SET ${balanceField} = ${balanceField} - ? WHERE id = ?`, [buyerPays, buyerUserId]);
    // Credit seller balance (subtotal)
    await conn.query(`UPDATE users SET ${balanceField} = ${balanceField} + ? WHERE id = ?`, [subtotal, sellerUserId]);
    // Credit admin balance (tax)
    await conn.query(`UPDATE users SET ${balanceField} = ${balanceField} + ? WHERE id = ?`, [taxAmount, adminUser.id]);

    // Reduce stock
    await conn.query("UPDATE products SET stock = stock - ? WHERE id = ?", [quantity, productId]);

    // Record transaction
    const txHash = generateTxHash();
    const [insertRes] = await conn.query(
      `INSERT INTO transactions (tx_hash, from_address, to_address, from_user_id, to_user_id, product_id, amount, currency, type, status, description, block_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'purchase', 'confirmed', ?, ?)`,
      [txHash, buyer.wallet_address, product.umkm_wallet, buyerUserId, sellerUserId, productId, subtotal, currency, `Pembelian ${quantity}x ${product.name} (Tujuan: ${destinationCountry})`, Math.floor(Math.random() * 100000) + 200000]
    );

    const txId = (insertRes as ResultSetHeader).insertId;

    // Record tax transaction
    const taxTxHash = generateTxHash();
    await conn.query(
      `INSERT INTO transactions (tx_hash, from_address, to_address, from_user_id, to_user_id, product_id, amount, currency, type, status, description, block_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'tax', 'confirmed', ?, ?)`,
      [taxTxHash, buyer.wallet_address, adminUser.wallet_address, buyerUserId, adminUser.id, productId, taxAmount, currency, `PPN 11% untuk pembelian ${product.name}`, Math.floor(Math.random() * 100000) + 200000]
    );

    // Initial Tracking Event
    const trackTxHash = generateTxHash();
    await conn.query(
      "INSERT INTO supply_chain_tracking (transaction_id, status, location, tx_hash, updated_by_id) VALUES (?, ?, ?, ?, ?)",
      [txId, "Pesanan Dibuat", `Tujuan: ${destinationCountry}`, trackTxHash, buyerUserId]
    );

    // Notifications
    await conn.query(
      "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'success')",
      [sellerUserId, "Pesanan Baru", `Anda menerima pesanan ${quantity}x ${product.name} senilai ${currency} ${subtotal.toLocaleString()} (pendapatan bersih)`]
    );
    await conn.query(
      "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'success')",
      [buyerUserId, "Pembelian Berhasil", `Transaksi pembelian ${product.name} senilai ${currency} ${buyerPays.toLocaleString()} telah dikonfirmasi di blockchain`]
    );

    // Create order record for order management
    await conn.query(
      `INSERT INTO orders (transaction_id, buyer_user_id, seller_user_id, product_id, quantity, total_amount, currency, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [txId, buyerUserId, sellerUserId, productId, quantity, buyerPays, currency]
    );

    await conn.commit();

    // Trigger dynamic reliability score calculation in background
    if (product.umkm_profile_id) {
      calculateReliabilityScore(product.umkm_profile_id).catch(() => {});
    }

    return { txHash, totalAmount: buyerPays };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// =====================================================================
// UMKM PROFILE
// =====================================================================
export async function getUmkmProfileByUserId(userId: number) {
  const pool = await getDb();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT up.*, u.wallet_address, u.balance_idr, u.balance_usd FROM umkm_profiles up LEFT JOIN users u ON up.user_id = u.id WHERE up.user_id = ?",
    [userId]
  );
  return rows[0] || null;
}

export async function updateUmkmProfile(id: number, data: Record<string, unknown>, isAdmin: boolean = false) {
  const pool = await getDb();
  const allowedFields = ["business_name", "business_type", "province", "city", "category", "description", "nib_number", "alamat_lengkap", "tipe_industri", "certifications"];
  
  if (isAdmin) {
    allowedFields.push("reliability_score", "verification_status");
  }

  const filtered: Record<string, unknown> = {};
  for (const k of Object.keys(data)) {
    if (allowedFields.includes(k)) filtered[k] = data[k];
  }
  if (Object.keys(filtered).length === 0) return;
  const fields = Object.keys(filtered).map((k) => `${k} = ?`).join(", ");
  const values = Object.values(filtered);
  await pool.query(`UPDATE umkm_profiles SET ${fields} WHERE id = ?`, [...values, id]);
}

export async function getAllUmkmProfiles() {
  const pool = await getDb();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT up.*, u.name as user_name, u.email, u.wallet_address FROM umkm_profiles up LEFT JOIN users u ON up.user_id = u.id ORDER BY up.joined_at DESC"
  );
  return rows;
}

export async function verifyUmkm(profileId: number, status: string) {
  const pool = await getDb();
  await pool.query("UPDATE umkm_profiles SET verification_status = ? WHERE id = ?", [status, profileId]);
}

// =====================================================================
// BUYER PROFILE
// =====================================================================
export async function getBuyerProfileByUserId(userId: number) {
  const pool = await getDb();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT bp.*, u.wallet_address, u.balance_idr, u.balance_usd FROM buyer_profiles bp LEFT JOIN users u ON bp.user_id = u.id WHERE bp.user_id = ?",
    [userId]
  );
  return rows[0] || null;
}

// =====================================================================
// TRANSACTIONS
// =====================================================================
export async function getTransactions(options?: { userId?: number; limit?: number }) {
  const pool = await getDb();
  let sql = `
    SELECT 
      t.*,
      u1.name as from_name,
      u2.name as to_name,
      p.name as product_name,
      p.image_url as product_image,
      (SELECT status FROM supply_chain_tracking WHERE transaction_id = t.id ORDER BY created_at DESC LIMIT 1) as tracking_status
    FROM transactions t
    LEFT JOIN users u1 ON t.from_user_id = u1.id
    LEFT JOIN users u2 ON t.to_user_id = u2.id
    LEFT JOIN products p ON t.product_id = p.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (options?.userId) {
    sql += " AND (t.from_user_id = ? OR t.to_user_id = ?)";
    params.push(options.userId, options.userId);
  }

  sql += " ORDER BY t.created_at DESC";

  if (options?.limit) {
    sql += " LIMIT ?";
    params.push(options.limit);
  }

  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return rows;
}

// =====================================================================
// STATS
// =====================================================================
export async function getStats() {
  const pool = await getDb();
  const [u] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) as cnt FROM users WHERE is_active = 1");
  const [umkm] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) as cnt FROM umkm_profiles");
  const [b] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) as cnt FROM users WHERE role = 'buyer'");
  const [vu] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) as cnt FROM umkm_profiles WHERE verification_status = 'verified'");
  const [p] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) as cnt FROM products");
  const [t] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) as cnt FROM transactions");
  const [totalVol] = await pool.query<RowDataPacket[]>("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE currency = 'IDR'");

  return {
    totalUsers: u[0].cnt,
    totalUMKM: umkm[0].cnt,
    totalBuyers: b[0].cnt,
    verifiedUmkm: vu[0].cnt,
    totalProducts: p[0].cnt,
    totalTransactions: t[0].cnt,
    totalVolume: totalVol[0].total,
  };
}

// =====================================================================
// NOTIFICATIONS
// =====================================================================
export async function getNotifications(userId: number) {
  const pool = await getDb();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
    [userId]
  );
  return rows;
}

export async function markNotificationRead(id: number) {
  const pool = await getDb();
  await pool.query("UPDATE notifications SET is_read = 1 WHERE id = ?", [id]);
}

// =====================================================================
// EXPORT DOCUMENTS
// =====================================================================
export async function getExportDocuments(umkmProfileId?: number) {
  const pool = await getDb();
  let sql = "SELECT e.*, u.name as umkm_name FROM export_documents e JOIN umkm_profiles p ON e.umkm_profile_id = p.id JOIN users u ON p.user_id = u.id";
  const params: unknown[] = [];
  
  if (umkmProfileId) {
    sql += " WHERE e.umkm_profile_id = ?";
    params.push(umkmProfileId);
  }
  
  sql += " ORDER BY e.created_at DESC";
  
  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return rows;
}

export async function createExportDocument(data: { umkm_profile_id: number, document_type: string, file_url: string }) {
  const pool = await getDb();
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO export_documents (umkm_profile_id, document_type, file_url) VALUES (?, ?, ?)",
    [data.umkm_profile_id, data.document_type, data.file_url]
  );
  return result.insertId;
}

export async function verifyExportDocument(id: number, status: "approved" | "rejected") {
  const pool = await getDb();
  await pool.query("UPDATE export_documents SET status = ? WHERE id = ?", [status, id]);
  return true;
}

// =====================================================================
// SUPPLY CHAIN TRACKING
// =====================================================================
export async function getTrackingEvents(transactionId?: number) {
  const pool = await getDb();
  let query = `
    SELECT s.*, t.product_id, p.name as product_name, u.name as updated_by_name
    FROM supply_chain_tracking s
    JOIN transactions t ON s.transaction_id = t.id
    LEFT JOIN products p ON t.product_id = p.id
    LEFT JOIN users u ON s.updated_by_id = u.id
  `;
  const params: unknown[] = [];
  if (transactionId) {
    query += " WHERE s.transaction_id = ?";
    params.push(transactionId);
  }
  query += " ORDER BY s.created_at ASC";
  
  const [rows] = await pool.query(query, params);
  return rows;
}

export async function addTrackingEvent(transactionId: number, status: string, location: string, updatedById: number | null) {
  const pool = await getDb();
  const tx_hash = generateTxHash();
  const [result] = await pool.query(
    "INSERT INTO supply_chain_tracking (transaction_id, status, location, tx_hash, updated_by_id) VALUES (?, ?, ?, ?, ?)",
    [transactionId, status, location, tx_hash, updatedById]
  );
  return { id: (result as ResultSetHeader).insertId, tx_hash };
}

export async function deleteExportDocument(id: number) {
  const pool = await getDb();
  await pool.query("DELETE FROM export_documents WHERE id = ? AND status = 'pending'", [id]);
  return true;
}

// =====================================================================
// FORMAT HELPERS
// =====================================================================
export function formatCurrency(value: number, currency: string = "IDR"): string {
  if (currency === "IDR") {
    if (value >= 1000000000000) return `Rp ${(value / 1000000000000).toFixed(1)} T`;
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)} M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)} jt`;
    return `Rp ${value.toLocaleString("id-ID")}`;
  }
  if (currency === "USD") return `$ ${value.toLocaleString("en-US")}`;
  return `${value} ${currency}`;
}

// =====================================================================
// DYNAMIC RELIABILITY SCORE
// =====================================================================
export async function calculateReliabilityScore(umkmProfileId: number): Promise<number> {
  const pool = await getDb();

  // 1. Successful transactions (30% weight)
  const [txRows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as cnt FROM transactions t JOIN umkm_profiles up ON t.to_user_id = up.user_id WHERE up.id = ? AND t.status = 'confirmed' AND t.type = 'purchase'",
    [umkmProfileId]
  );
  const txCount = txRows[0]?.cnt || 0;
  const txScore = Math.min(100, txCount * 10); // 10 per tx, max 100

  // 2. Supply chain tracking completeness (25% weight)
  const [trackRows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as cnt FROM supply_chain_tracking s JOIN transactions t ON s.transaction_id = t.id JOIN umkm_profiles up ON t.to_user_id = up.user_id WHERE up.id = ?",
    [umkmProfileId]
  );
  const trackCount = trackRows[0]?.cnt || 0;
  const trackScore = Math.min(100, trackCount * 5); // 5 per event, max 100

  // 3. Certifications (20% weight)
  const [certRows] = await pool.query<RowDataPacket[]>(
    "SELECT certifications FROM umkm_profiles WHERE id = ?",
    [umkmProfileId]
  );
  let certCount = 0;
  try {
    const certs = JSON.parse(certRows[0]?.certifications || "[]");
    certCount = Array.isArray(certs) ? certs.length : 0;
  } catch { certCount = 0; }
  const certScore = Math.min(100, certCount * 25); // 25 per cert, max 100

  // 4. Account age (10% weight)
  const [ageRows] = await pool.query<RowDataPacket[]>(
    "SELECT DATEDIFF(NOW(), joined_at) as days FROM umkm_profiles WHERE id = ?",
    [umkmProfileId]
  );
  const ageDays = ageRows[0]?.days || 0;
  const ageScore = Math.min(100, ageDays * 2); // 2 per day, max 100

  // 5. Product activity (15% weight)
  const [prodRows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as cnt FROM products WHERE umkm_profile_id = ? AND status = 'active'",
    [umkmProfileId]
  );
  const prodCount = prodRows[0]?.cnt || 0;
  const prodScore = Math.min(100, prodCount * 20); // 20 per product, max 100

  // Weighted average
  const score = Math.round(
    txScore * 0.30 + trackScore * 0.25 + certScore * 0.20 + ageScore * 0.10 + prodScore * 0.15
  );

  // Update in database
  await pool.query("UPDATE umkm_profiles SET reliability_score = ? WHERE id = ?", [score, umkmProfileId]);

  return score;
}

// =====================================================================
// TRANSACTION LOOKUP BY HASH (for public verification)
// =====================================================================
export async function getTransactionByHash(txHash: string) {
  const pool = await getDb();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 
      t.*,
      u1.name as from_name, u1.wallet_address as from_wallet,
      u2.name as to_name, u2.wallet_address as to_wallet,
      p.name as product_name, p.category as product_category, p.image_url as product_image,
      p.certifications as product_certifications,
      up.business_name as umkm_name, up.verification_status as umkm_status,
      up.certifications as umkm_certifications
    FROM transactions t
    LEFT JOIN users u1 ON t.from_user_id = u1.id
    LEFT JOIN users u2 ON t.to_user_id = u2.id
    LEFT JOIN products p ON t.product_id = p.id
    LEFT JOIN umkm_profiles up ON p.umkm_profile_id = up.id
    WHERE t.tx_hash = ?`,
    [txHash]
  );
  if (rows[0]) return rows[0];

  // If not found directly on transactions.tx_hash, check if it's a tracking event tx_hash from supply_chain_tracking
  const [trackingRows] = await pool.query<RowDataPacket[]>(
    `SELECT transaction_id FROM supply_chain_tracking WHERE tx_hash = ?`,
    [txHash]
  );
  if (trackingRows.length > 0 && trackingRows[0].transaction_id) {
    const [txRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        t.*,
        u1.name as from_name, u1.wallet_address as from_wallet,
        u2.name as to_name, u2.wallet_address as to_wallet,
        p.name as product_name, p.category as product_category, p.image_url as product_image,
        p.certifications as product_certifications,
        up.business_name as umkm_name, up.verification_status as umkm_status,
        up.certifications as umkm_certifications
      FROM transactions t
      LEFT JOIN users u1 ON t.from_user_id = u1.id
      LEFT JOIN users u2 ON t.to_user_id = u2.id
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN umkm_profiles up ON p.umkm_profile_id = up.id
      WHERE t.id = ?`,
      [trackingRows[0].transaction_id]
    );
    if (txRows[0]) return txRows[0];
  }

  // Also check if passed a product blockchain_hash directly or numeric ID
  const [prodRows] = await pool.query<RowDataPacket[]>(
    `SELECT id FROM products WHERE blockchain_hash = ?`,
    [txHash]
  );
  if (prodRows.length > 0 && prodRows[0].id) {
    const [txRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        t.*,
        u1.name as from_name, u1.wallet_address as from_wallet,
        u2.name as to_name, u2.wallet_address as to_wallet,
        p.name as product_name, p.category as product_category, p.image_url as product_image,
        p.certifications as product_certifications,
        up.business_name as umkm_name, up.verification_status as umkm_status,
        up.certifications as umkm_certifications
      FROM transactions t
      LEFT JOIN users u1 ON t.from_user_id = u1.id
      LEFT JOIN users u2 ON t.to_user_id = u2.id
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN umkm_profiles up ON p.umkm_profile_id = up.id
      WHERE t.product_id = ? ORDER BY t.id DESC LIMIT 1`,
      [prodRows[0].id]
    );
    if (txRows[0]) return txRows[0];
  }

  return null;
}

// =====================================================================
// CHAT & MESSAGING CRUD HELPERS
// =====================================================================
export async function getOrCreateChatRoom(user1Id: number, user2Id: number, productId?: number) {
  const pool = await getDb();
  if (user1Id === 999 || user2Id === 999) {
    await pool.query("INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES (999, 'Pengunjung Web (Guest)', 'guest@trustchain.id', '', 'guest')");
  }
  const [u1, u2] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

  const [existing] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM chat_rooms WHERE user1_id = ? AND user2_id = ?",
    [u1, u2]
  );

  if (existing.length > 0) {
    if (productId && !existing[0].product_id) {
      await pool.query("UPDATE chat_rooms SET product_id = ? WHERE id = ?", [productId, existing[0].id]);
      existing[0].product_id = productId;
    }
    return existing[0];
  }

  const [res] = await pool.query<ResultSetHeader>(
    "INSERT INTO chat_rooms (user1_id, user2_id, product_id, last_message, last_message_at) VALUES (?, ?, ?, ?, NOW())",
    [u1, u2, productId || null, "Percakapan dimulai"]
  );

  const [newRoom] = await pool.query<RowDataPacket[]>("SELECT * FROM chat_rooms WHERE id = ?", [res.insertId]);
  return newRoom[0];
}

export async function getChatRooms(userId: number) {
  const pool = await getDb();
  if (userId === 999) {
    await pool.query("INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES (999, 'Pengunjung Web (Guest)', 'guest@trustchain.id', '', 'guest')");
  }
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 
      cr.*,
      CASE WHEN cr.user1_id = ? THEN u2.id ELSE u1.id END as partner_id,
      COALESCE(CASE WHEN cr.user1_id = ? THEN u2.name ELSE u1.name END, 'Pengunjung Web (Guest)') as partner_name,
      COALESCE(CASE WHEN cr.user1_id = ? THEN u2.role ELSE u1.role END, 'guest') as partner_role,
      CASE WHEN cr.user1_id = ? THEN u2.avatar ELSE u1.avatar END as partner_avatar,
      p.name as product_name,
      (SELECT COUNT(*) FROM chat_messages cm WHERE cm.room_id = cr.id AND cm.sender_id != ? AND cm.is_read = FALSE) as unread_count
    FROM chat_rooms cr
    LEFT JOIN users u1 ON cr.user1_id = u1.id
    LEFT JOIN users u2 ON cr.user2_id = u2.id
    LEFT JOIN products p ON cr.product_id = p.id
    WHERE cr.user1_id = ? OR cr.user2_id = ?
    ORDER BY cr.last_message_at DESC, cr.created_at DESC`,
    [userId, userId, userId, userId, userId, userId, userId]
  );
  return rows;
}

export async function getChatMessages(roomId: number, userId?: number) {
  const pool = await getDb();
  if (userId) {
    await pool.query("UPDATE chat_messages SET is_read = TRUE WHERE room_id = ? AND sender_id != ?", [roomId, userId]);
  }
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT cm.*, u.name as sender_name, u.role as sender_role
     FROM chat_messages cm
     LEFT JOIN users u ON cm.sender_id = u.id
     WHERE cm.room_id = ?
     ORDER BY cm.created_at ASC`,
    [roomId]
  );
  return rows;
}

export async function sendChatMessage(roomId: number, senderId: number, message: string, messageType: string = 'text', attachmentUrl: string | null = null) {
  const pool = await getDb();
  const [res] = await pool.query<ResultSetHeader>(
    "INSERT INTO chat_messages (room_id, sender_id, message, message_type, attachment_url) VALUES (?, ?, ?, ?, ?)",
    [roomId, senderId, message, messageType, attachmentUrl || null]
  );
  await pool.query("UPDATE chat_rooms SET last_message = ?, last_message_at = NOW() WHERE id = ?", [message, roomId]);
  
  const [newMsg] = await pool.query<RowDataPacket[]>("SELECT * FROM chat_messages WHERE id = ?", [res.insertId]);
  return newMsg[0];
}

export async function getUnreadChatCount(userId: number) {
  const pool = await getDb();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as cnt FROM chat_messages cm
     JOIN chat_rooms cr ON cm.room_id = cr.id
     WHERE (cr.user1_id = ? OR cr.user2_id = ?) AND cm.sender_id != ? AND cm.is_read = FALSE`,
    [userId, userId, userId]
  );
  return rows[0]?.cnt || 0;
}

// =====================================================================
// PASSWORD RESET
// =====================================================================
export async function createPasswordResetToken(userId: number): Promise<string> {
  const pool = await getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Invalidate old tokens
  await pool.query("UPDATE password_reset_tokens SET used = TRUE WHERE user_id = ? AND used = FALSE", [userId]);

  await pool.query(
    "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
    [userId, token, expiresAt]
  );

  return token;
}

export async function validateResetToken(token: string) {
  const pool = await getDb();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT prt.*, u.email FROM password_reset_tokens prt JOIN users u ON prt.user_id = u.id WHERE prt.token = ? AND prt.used = FALSE AND prt.expires_at > NOW()",
    [token]
  );
  return rows[0] || null;
}

export async function resetPassword(token: string, newPasswordHash: string) {
  const pool = await getDb();
  const tokenRecord = await validateResetToken(token);
  if (!tokenRecord) throw new Error("Token tidak valid atau sudah kedaluwarsa");

  await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [newPasswordHash, tokenRecord.user_id]);
  await pool.query("UPDATE password_reset_tokens SET used = TRUE WHERE token = ?", [token]);
  return true;
}

// =====================================================================
// REVIEWS
// =====================================================================
export async function getProductReviews(productId: number) {
  const pool = await getDb();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT r.*, u.name as user_name, u.avatar as user_avatar
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.product_id = ?
     ORDER BY r.created_at DESC`,
    [productId]
  );
  return rows;
}

export async function createReview(userId: number, productId: number, rating: number, comment: string) {
  const pool = await getDb();

  // Check if user has purchased this product
  const [purchases] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM transactions WHERE from_user_id = ? AND product_id = ? AND type = 'purchase' AND status = 'confirmed' LIMIT 1",
    [userId, productId]
  );
  if (purchases.length === 0) throw new Error("Anda harus membeli produk ini terlebih dahulu sebelum memberikan review");

  // Check if already reviewed
  const [existing] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM reviews WHERE user_id = ? AND product_id = ?",
    [userId, productId]
  );
  if (existing.length > 0) throw new Error("Anda sudah memberikan review untuk produk ini");

  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)",
    [userId, productId, rating, comment]
  );
  return result.insertId;
}

export async function getProductAverageRating(productId: number) {
  const pool = await getDb();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE product_id = ?",
    [productId]
  );
  return {
    avgRating: rows[0]?.avg_rating ? Math.round(rows[0].avg_rating * 10) / 10 : 0,
    reviewCount: rows[0]?.review_count || 0,
  };
}

// =====================================================================
// ORDERS
// =====================================================================
export async function createOrder(data: {
  transactionId: number;
  buyerUserId: number;
  sellerUserId: number;
  productId: number;
  quantity: number;
  totalAmount: number;
  currency: string;
  shippingAddress?: string;
}) {
  const pool = await getDb();
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO orders (transaction_id, buyer_user_id, seller_user_id, product_id, quantity, total_amount, currency, shipping_address, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [data.transactionId, data.buyerUserId, data.sellerUserId, data.productId, data.quantity, data.totalAmount, data.currency, data.shippingAddress || ""]
  );
  return result.insertId;
}

export async function getOrders(options?: { buyerUserId?: number; sellerUserId?: number; status?: string; limit?: number }) {
  const pool = await getDb();
  let sql = `
    SELECT o.*, p.name as product_name, p.image_url as product_image, p.category as product_category,
      u1.name as buyer_name, u2.name as seller_name,
      t.tx_hash, up.business_name as umkm_name
    FROM orders o
    JOIN products p ON o.product_id = p.id
    JOIN users u1 ON o.buyer_user_id = u1.id
    JOIN users u2 ON o.seller_user_id = u2.id
    JOIN transactions t ON o.transaction_id = t.id
    LEFT JOIN umkm_profiles up ON t.to_user_id = up.user_id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (options?.buyerUserId) { sql += " AND o.buyer_user_id = ?"; params.push(options.buyerUserId); }
  if (options?.sellerUserId) { sql += " AND o.seller_user_id = ?"; params.push(options.sellerUserId); }
  if (options?.status) { sql += " AND o.status = ?"; params.push(options.status); }

  sql += " ORDER BY o.created_at DESC";
  if (options?.limit) { sql += " LIMIT ?"; params.push(options.limit); }

  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return rows;
}

export async function updateOrderStatus(orderId: number, status: string, updatedByUserId: number) {
  const pool = await getDb();
  const validStatuses = ["pending", "processing", "shipped", "delivered", "completed", "cancelled"];
  if (!validStatuses.includes(status)) throw new Error("Status tidak valid");

  await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);

  // Get order details for notification
  const [orders] = await pool.query<RowDataPacket[]>("SELECT * FROM orders WHERE id = ?", [orderId]);
  const order = orders[0];
  if (order) {
    const notifyUserId = updatedByUserId === order.seller_user_id ? order.buyer_user_id : order.seller_user_id;
    const statusLabels: Record<string, string> = {
      processing: "sedang diproses", shipped: "sedang dikirim",
      delivered: "sudah diterima", completed: "selesai", cancelled: "dibatalkan",
    };
    await pool.query(
      "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
      [notifyUserId, "Update Pesanan", `Pesanan #${orderId} ${statusLabels[status] || status}`, status === "cancelled" ? "warning" : "info"]
    );
  }

  return true;
}

// =====================================================================
// PROFILE UPDATE
// =====================================================================
export async function updateUserProfile(userId: number, data: Record<string, unknown>) {
  const pool = await getDb();
  const userFields = ["name", "phone", "address"];
  const userUpdates: Record<string, unknown> = {};
  const profileData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (userFields.includes(key)) {
      userUpdates[key] = value;
    } else {
      profileData[key] = value;
    }
  }

  // Update user table
  if (Object.keys(userUpdates).length > 0) {
    const fields = Object.keys(userUpdates).map(k => `${k} = ?`).join(", ");
    const values = Object.values(userUpdates);
    await pool.query(`UPDATE users SET ${fields} WHERE id = ?`, [...values, userId]);
  }

  // Get user role to determine which profile to update
  const user = await getUserById(userId);
  if (!user) throw new Error("User tidak ditemukan");

  if (user.role === "umkm" && Object.keys(profileData).length > 0) {
    const profile = await getUmkmProfileByUserId(userId);
    if (profile) {
      const fieldMap: Record<string, string> = {
        businessName: "business_name", businessType: "business_type",
        province: "province", city: "city", category: "category",
        description: "description", nibNumber: "nib_number",
        alamatLengkap: "alamat_lengkap", tipeIndustri: "tipe_industri",
      };
      const mappedData: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(profileData)) {
        mappedData[fieldMap[k] || k] = v;
      }
      await updateUmkmProfile(profile.id, mappedData);
    }
  }

  if (user.role === "buyer" && Object.keys(profileData).length > 0) {
    const [profiles] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM buyer_profiles WHERE user_id = ?", [userId]
    );
    if (profiles[0]) {
      const allowed = ["company_name", "company_type", "country"];
      const fieldMap: Record<string, string> = {
        companyName: "company_name", companyType: "company_type", country: "country",
      };
      const filtered: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(profileData)) {
        const dbField = fieldMap[k] || k;
        if (allowed.includes(dbField)) filtered[dbField] = v;
      }
      if (Object.keys(filtered).length > 0) {
        const fields = Object.keys(filtered).map(k => `${k} = ?`).join(", ");
        const values = Object.values(filtered);
        await pool.query(`UPDATE buyer_profiles SET ${fields} WHERE user_id = ?`, [...values, userId]);
      }
    }
  }

  return true;
}

// =====================================================================
// EXPORT DATA
// =====================================================================
export async function getExportData(type: string, options?: { startDate?: string; endDate?: string }) {
  const pool = await getDb();

  if (type === "transactions") {
    let sql = `
      SELECT t.id, t.tx_hash, t.amount, t.currency, t.type, t.status, t.description, t.created_at,
        u1.name as from_name, u2.name as to_name, p.name as product_name
      FROM transactions t
      LEFT JOIN users u1 ON t.from_user_id = u1.id
      LEFT JOIN users u2 ON t.to_user_id = u2.id
      LEFT JOIN products p ON t.product_id = p.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    if (options?.startDate) { sql += " AND t.created_at >= ?"; params.push(options.startDate); }
    if (options?.endDate) { sql += " AND t.created_at <= ?"; params.push(options.endDate); }
    sql += " ORDER BY t.created_at DESC";
    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    return rows;
  }

  if (type === "products") {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.id, p.name, p.category, p.price_idr, p.price_usd, p.stock, p.unit, p.status, p.created_at,
        up.business_name as umkm_name
       FROM products p LEFT JOIN umkm_profiles up ON p.umkm_profile_id = up.id
       ORDER BY p.created_at DESC`
    );
    return rows;
  }

  if (type === "umkm") {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT up.id, up.business_name, up.business_type, up.province, up.city, up.category,
        up.reliability_score, up.verification_status, up.credit_score, up.annual_revenue,
        up.employees, up.export_ready, up.total_products, up.joined_at,
        u.name as owner_name, u.email
       FROM umkm_profiles up LEFT JOIN users u ON up.user_id = u.id
       ORDER BY up.joined_at DESC`
    );
    return rows;
  }

  return [];
}
