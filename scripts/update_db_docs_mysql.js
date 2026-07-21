const mysql = require("mysql2/promise");

async function main() {
  const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "trustchain_umkm",
  };

  const connection = await mysql.createConnection(dbConfig);
  
  await connection.query(`
    CREATE TABLE IF NOT EXISTS export_documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      umkm_profile_id INT NOT NULL,
      document_type VARCHAR(100) NOT NULL,
      file_url VARCHAR(255) NOT NULL,
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (umkm_profile_id) REFERENCES umkm_profiles(id) ON DELETE CASCADE
    )
  `);

  console.log("Table export_documents created successfully.");
  await connection.end();
}

main().catch(console.error);
