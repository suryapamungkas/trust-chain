const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'trustchain_umkm',
  });

  await pool.query('UPDATE products SET image_url = ? WHERE name LIKE ?', ['/images/products/habbatussauda.png', '%Habbatussauda%']);
  await pool.query('UPDATE products SET image_url = ? WHERE name LIKE ?', ['/images/products/salep_kencur.png', '%Salep Herbal Kencur%']);
  
  console.log('Updated the 2 missing image URLs in the database.');
  pool.end();
}

main().catch(console.error);
