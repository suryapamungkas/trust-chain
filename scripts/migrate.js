try { require('dotenv').config({ path: '.env.local' }); } catch (e) {}
const mysql = require('mysql2/promise');
async function run() {
  const pool = mysql.createPool({ 
    host: process.env.DB_HOST || 'localhost', 
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || 'root', 
    database: process.env.DB_NAME || 'trustchain_umkm' 
  });
  await pool.query("ALTER TABLE transactions MODIFY COLUMN type ENUM('purchase', 'top_up', 'transfer', 'certification', 'escrow', 'withdrawal', 'tax') DEFAULT 'transfer'");
  console.log('ALTER TABLE SUCCESS');
  pool.end();
}
run();
