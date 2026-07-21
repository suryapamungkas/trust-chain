const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'trustchain_umkm',
  });

  const [products] = await pool.query('SELECT id, image_url FROM products WHERE image_url LIKE "/products/%"');
  
  let count = 0;
  for (const p of products) {
    const newUrl = p.image_url.replace('/products/', '/images/products/');
    await pool.query('UPDATE products SET image_url = ? WHERE id = ?', [newUrl, p.id]);
    count++;
  }
  
  console.log(`Updated ${count} image URLs in the database.`);
  pool.end();
}

main().catch(console.error);
