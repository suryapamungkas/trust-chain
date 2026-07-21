"""
TrustChain UMKM — Seed Database from Real Dataset
Reads the UMKM Obat Tradisional Excel, enriches it, and inserts into SQLite.
"""

import sqlite3
import random
import hashlib
import os
import sys

# Try to import openpyxl
try:
    import openpyxl
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'openpyxl', '-q'])
    import openpyxl

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'trustchain.db')
EXCEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
    'Dataset Usaha Mikro Kecil dan Menengah (UMKM) Obat Tradisionals 2026-05-26.xlsx')

random.seed(42)  # Reproducible results

# =====================================================================
# Configuration
# =====================================================================

KATEGORI_PRODUK = ['Obat Tradisional', 'Jamu', 'Suplemen Herbal', 'Kosmetik Herbal', 'Minyak Atsiri', 'Ekstrak Herbal']
KATEGORI_WEIGHTS = [30, 25, 15, 12, 10, 8]

SERTIFIKASI_MAP = {
    'PT': ['BPOM', 'SNI', 'Halal', 'CPOTB', 'ISO 9001'],
    'CV': ['BPOM', 'SNI', 'Halal', 'CPOTB'],
    'UD': ['BPOM', 'Halal'],
    'PJ': ['BPOM'],
    'FA': ['BPOM', 'SNI'],
    'PD': ['BPOM'],
}

REVENUE_RANGE = {
    'PT': (2_000_000_000, 50_000_000_000),
    'CV': (500_000_000, 5_000_000_000),
    'UD': (50_000_000, 500_000_000),
    'PJ': (20_000_000, 200_000_000),
    'FA': (100_000_000, 1_000_000_000),
    'PD': (50_000_000, 300_000_000),
}

EMPLOYEE_RANGE = {
    'PT': (20, 500),
    'CV': (5, 50),
    'UD': (2, 15),
    'PJ': (1, 5),
    'FA': (3, 20),
    'PD': (2, 10),
}

PRODUCT_RANGE = {
    'PT': (5, 80),
    'CV': (3, 30),
    'UD': (1, 10),
    'PJ': (1, 5),
    'FA': (2, 15),
    'PD': (1, 8),
}

PRODUCT_NAMES_BY_CATEGORY = {
    'Obat Tradisional': ['Kapsul Herbal Premium', 'Tablet Jamu Tradisional', 'Sirup Herbal Alami', 'Pil Herba Sehat', 'Obat Batuk Herbal'],
    'Jamu': ['Jamu Kunyit Asam', 'Jamu Beras Kencur', 'Jamu Temulawak', 'Jamu Sinom Segar', 'Jamu Galian Singset', 'Jamu Cabe Puyang', 'Jamu Pahitan'],
    'Suplemen Herbal': ['Suplemen Curcumin', 'Vitamin Herbal C', 'Omega Herbal Plus', 'Suplemen Imun Booster', 'Propolis Herbal'],
    'Kosmetik Herbal': ['Sabun Herbal Wajah', 'Masker Kunyit', 'Lulur Tradisional', 'Minyak Rambut Herbal', 'Serum Herbal Anti-Aging'],
    'Minyak Atsiri': ['Minyak Kayu Putih', 'Minyak Sereh Wangi', 'Minyak Cengkeh', 'Minyak Nilam', 'Minyak Pala', 'Minyak Gosok Tradisional'],
    'Ekstrak Herbal': ['Ekstrak Jahe Merah', 'Ekstrak Temulawak', 'Ekstrak Sambiloto', 'Ekstrak Meniran', 'Ekstrak Pasak Bumi'],
}

CERT_ISSUERS = {
    'BPOM': 'Badan Pengawas Obat dan Makanan',
    'SNI': 'Badan Standardisasi Nasional',
    'Halal': 'Badan Penyelenggara Jaminan Produk Halal',
    'CPOTB': 'Direktorat Pengawasan Obat Tradisional BPOM',
    'ISO 9001': 'International Organization for Standardization',
}

SUPPLY_CHAIN_STEPS = [
    {'name': 'Pengumpulan Bahan Baku', 'location': 'Kebun/Petani Mitra'},
    {'name': 'Quality Control Bahan', 'location': 'Lab QC'},
    {'name': 'Proses Produksi', 'location': 'Pabrik Produksi'},
    {'name': 'Quality Assurance', 'location': 'Lab QA'},
    {'name': 'Pengemasan', 'location': 'Unit Pengemasan'},
    {'name': 'Distribusi', 'location': 'Gudang Distribusi'},
]

RAW_MATERIALS = [
    {'name': 'Kunyit', 'origin': 'Jawa Tengah'},
    {'name': 'Jahe Merah', 'origin': 'Jawa Barat'},
    {'name': 'Temulawak', 'origin': 'Jawa Timur'},
    {'name': 'Sambiloto', 'origin': 'Bali'},
    {'name': 'Kencur', 'origin': 'Jawa Tengah'},
    {'name': 'Sirih', 'origin': 'Sumatera'},
    {'name': 'Kayu Putih', 'origin': 'Maluku'},
    {'name': 'Cengkeh', 'origin': 'Maluku'},
    {'name': 'Sereh', 'origin': 'Jawa Barat'},
    {'name': 'Meniran', 'origin': 'Jawa Tengah'},
    {'name': 'Pasak Bumi', 'origin': 'Kalimantan'},
    {'name': 'Pegagan', 'origin': 'Sumatera'},
]


def generate_wallet():
    return '0x' + hashlib.sha256(str(random.random()).encode()).hexdigest()[:40]

def generate_nib():
    return ''.join([str(random.randint(0, 9)) for _ in range(16)])

def generate_npwp():
    parts = [
        ''.join([str(random.randint(0, 9)) for _ in range(2)]),
        ''.join([str(random.randint(0, 9)) for _ in range(3)]),
        ''.join([str(random.randint(0, 9)) for _ in range(3)]),
        str(random.randint(1, 9)),
        ''.join([str(random.randint(0, 9)) for _ in range(3)]),
        '000',
    ]
    return '.'.join(parts[:3]) + '.' + parts[3] + '-' + parts[4] + '.' + parts[5]

def generate_tx_hash():
    return '0x' + hashlib.sha256(str(random.random()).encode()).hexdigest()

def extract_province(wilayah):
    """Extract province from wilayah string."""
    if not wilayah or wilayah == 'NULL':
        return 'Lainnya'
    
    province_mapping = {
        'Jakarta': 'DKI Jakarta',
        'Jawa Barat': 'Jawa Barat',
        'Jawa Timur': 'Jawa Timur',
        'Jawa Tengah': 'Jawa Tengah',
        'Banten': 'Banten',
        'Sumatera Utara': 'Sumatera Utara',
        'Sumatera Barat': 'Sumatera Barat',
        'Sumatera Selatan': 'Sumatera Selatan',
        'Bali': 'Bali',
        'Yogyakarta': 'DI Yogyakarta',
        'Sulawesi Selatan': 'Sulawesi Selatan',
        'Kalimantan': 'Kalimantan',
        'Lampung': 'Lampung',
        'Riau': 'Riau',
        'Aceh': 'Aceh',
    }
    
    w = str(wilayah)
    
    # Direct match
    for key, province in province_mapping.items():
        if key.lower() in w.lower():
            return province
    
    # City-based mapping
    city_province = {
        'Surabaya': 'Jawa Timur', 'Malang': 'Jawa Timur', 'Kediri': 'Jawa Timur', 'Sidoarjo': 'Jawa Timur',
        'Bandung': 'Jawa Barat', 'Bogor': 'Jawa Barat', 'Bekasi': 'Jawa Barat', 'Depok': 'Jawa Barat', 'Cirebon': 'Jawa Barat', 'Karawang': 'Jawa Barat', 'Sukabumi': 'Jawa Barat', 'Cianjur': 'Jawa Barat',
        'Semarang': 'Jawa Tengah', 'Solo': 'Jawa Tengah', 'Surakarta': 'Jawa Tengah', 'Klaten': 'Jawa Tengah', 'Pekalongan': 'Jawa Tengah', 'Purwokerto': 'Jawa Tengah', 'Tegal': 'Jawa Tengah',
        'Tangerang': 'Banten', 'Serang': 'Banten', 'Cilegon': 'Banten',
        'Medan': 'Sumatera Utara', 'Deli Serdang': 'Sumatera Utara',
        'Palembang': 'Sumatera Selatan',
        'Padang': 'Sumatera Barat',
        'Denpasar': 'Bali', 'Gianyar': 'Bali', 'Badung': 'Bali',
        'Makassar': 'Sulawesi Selatan',
        'Balikpapan': 'Kalimantan Timur', 'Samarinda': 'Kalimantan Timur',
        'Banjarmasin': 'Kalimantan Selatan', 'Pontianak': 'Kalimantan Barat',
        'Yogyakarta': 'DI Yogyakarta', 'Sleman': 'DI Yogyakarta', 'Bantul': 'DI Yogyakarta',
        'Pekanbaru': 'Riau', 'Batam': 'Kepulauan Riau',
        'Manado': 'Sulawesi Utara',
        'Mataram': 'Nusa Tenggara Barat',
        'Kupang': 'Nusa Tenggara Timur',
        'Jayapura': 'Papua',
        'Ambon': 'Maluku',
        'Ternate': 'Maluku Utara',
        'Kendari': 'Sulawesi Tenggara',
        'Palu': 'Sulawesi Tengah',
        'Gorontalo': 'Gorontalo',
        'Jambi': 'Jambi',
        'Bengkulu': 'Bengkulu',
        'Pangkal Pinang': 'Bangka Belitung',
    }
    
    for city, province in city_province.items():
        if city.lower() in w.lower():
            return province
    
    # If contains "Kab." or "Kota" try to identify
    if 'DKI' in w or 'Jakarta' in w:
        return 'DKI Jakarta'
    
    return w  # Return as-is if no mapping found


def main():
    print("=" * 60)
    print("TrustChain UMKM — Seeding Database from Real Dataset")
    print("=" * 60)
    
    # Read Excel
    print(f"\n📖 Reading Excel file: {EXCEL_PATH}")
    if not os.path.exists(EXCEL_PATH):
        print(f"ERROR: Excel file not found at {EXCEL_PATH}")
        return
    
    wb = openpyxl.load_workbook(EXCEL_PATH, read_only=True)
    ws = wb['Sheet1']
    
    rows = []
    for row_idx, row in enumerate(ws.iter_rows(values_only=True)):
        if row_idx == 0:
            continue  # skip header
        nama, alamat, wilayah, tipe, id_val = row
        if not nama:
            continue
        rows.append({
            'nama_industri': str(nama).strip(),
            'alamat': str(alamat).strip() if alamat else '',
            'wilayah': str(wilayah).strip() if wilayah and str(wilayah) != 'NULL' else '',
            'tipe_industri': str(tipe).strip() if tipe and str(tipe) != 'NULL' else '',
            'id_asli': id_val,
        })
    
    print(f"   Total records read: {len(rows)}")
    
    # Clean tipe_industri
    for r in rows:
        if not r['tipe_industri'] or r['tipe_industri'] == 'NULL':
            r['tipe_industri'] = random.choice(['PT', 'CV', 'UD'])
    
    # Clean wilayah -> province
    for r in rows:
        r['province'] = extract_province(r['wilayah']) if r['wilayah'] else random.choice(['DKI Jakarta', 'Jawa Barat', 'Jawa Timur', 'Jawa Tengah'])
    
    print(f"   Records after cleaning: {len(rows)}")
    
    # Connect to database
    print(f"\n>> Connecting to database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    cur = conn.cursor()
    
    # Create tables if they don't exist
    print("   Creating tables...")
    cur.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'umkm', 'buyer')),
            avatar TEXT, phone TEXT, address TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            last_login TEXT, is_active INTEGER DEFAULT 1,
            theme_preference TEXT DEFAULT 'dark'
        );
        CREATE TABLE IF NOT EXISTS umkm_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            business_name TEXT NOT NULL, business_type TEXT,
            province TEXT, city TEXT, category TEXT, description TEXT,
            wallet_address TEXT, nib_number TEXT, npwp TEXT,
            reliability_score INTEGER DEFAULT 0,
            verification_status TEXT DEFAULT 'pending' CHECK(verification_status IN ('verified','pending','unverified','rejected')),
            credit_score INTEGER DEFAULT 0, annual_revenue REAL DEFAULT 0,
            employees INTEGER DEFAULT 0, export_ready INTEGER DEFAULT 0,
            total_products INTEGER DEFAULT 0, certifications TEXT DEFAULT '[]',
            alamat_lengkap TEXT, tipe_industri TEXT,
            joined_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS buyer_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            company_name TEXT, company_type TEXT CHECK(company_type IN ('investor','buyer','distributor','bank','government')),
            country TEXT, investment_range_min REAL DEFAULT 0, investment_range_max REAL DEFAULT 0,
            interests TEXT, total_investments INTEGER DEFAULT 0, total_invested REAL DEFAULT 0,
            verified INTEGER DEFAULT 0, joined_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL, message TEXT NOT NULL,
            type TEXT DEFAULT 'info' CHECK(type IN ('info','success','warning','error')),
            read INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS investments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            buyer_user_id INTEGER NOT NULL REFERENCES users(id),
            umkm_user_id INTEGER REFERENCES users(id),
            umkm_profile_id INTEGER REFERENCES umkm_profiles(id),
            amount REAL NOT NULL, currency TEXT DEFAULT 'IDR',
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending','active','completed','cancelled')),
            created_at TEXT DEFAULT (datetime('now')), notes TEXT
        );
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            umkm_profile_id INTEGER REFERENCES umkm_profiles(id),
            name TEXT NOT NULL, category TEXT, description TEXT,
            price REAL DEFAULT 0, unit TEXT DEFAULT 'pcs', quantity INTEGER DEFAULT 0,
            blockchain_hash TEXT, ipfs_hash TEXT, qr_code TEXT,
            ai_risk_score REAL DEFAULT 0, ai_demand_prediction TEXT DEFAULT 'stable',
            certifications TEXT DEFAULT '[]', supply_chain_steps TEXT DEFAULT '[]',
            raw_materials TEXT DEFAULT '[]', status TEXT DEFAULT 'active',
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS certifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            umkm_profile_id INTEGER REFERENCES umkm_profiles(id),
            product_id INTEGER REFERENCES products(id),
            type TEXT NOT NULL, name TEXT NOT NULL, issuer TEXT,
            issued_at TEXT, valid_until TEXT,
            status TEXT DEFAULT 'active' CHECK(status IN ('active','expired','pending','revoked')),
            tx_hash TEXT, created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tx_hash TEXT UNIQUE, from_address TEXT, to_address TEXT,
            amount REAL DEFAULT 0, currency TEXT DEFAULT 'IDR',
            type TEXT DEFAULT 'transfer' CHECK(type IN ('payment','certification','transfer','escrow','verification')),
            block_number INTEGER, gas_used INTEGER, status TEXT DEFAULT 'confirmed',
            umkm_profile_id INTEGER REFERENCES umkm_profiles(id),
            description TEXT, created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_umkm_province ON umkm_profiles(province);
        CREATE INDEX IF NOT EXISTS idx_umkm_category ON umkm_profiles(category);
        CREATE INDEX IF NOT EXISTS idx_umkm_verification ON umkm_profiles(verification_status);
        CREATE INDEX IF NOT EXISTS idx_umkm_business_name ON umkm_profiles(business_name);
        CREATE INDEX IF NOT EXISTS idx_products_umkm ON products(umkm_profile_id);
        CREATE INDEX IF NOT EXISTS idx_certifications_umkm ON certifications(umkm_profile_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_umkm ON transactions(umkm_profile_id);
    """)
    conn.commit()
    print("   Tables created.")
    
    # Check if data already seeded
    cur.execute("SELECT COUNT(*) FROM umkm_profiles WHERE user_id IS NULL")
    existing = cur.fetchone()[0]
    if existing > 100:
        print(f"   Database already has {existing} imported UMKM profiles. Skipping seed.")
        conn.close()
        return
    
    # =====================================================================
    # Insert UMKM Profiles
    # =====================================================================
    print(f"\n🏭 Inserting {len(rows)} UMKM profiles...")
    
    insert_umkm_sql = """
        INSERT INTO umkm_profiles (
            user_id, business_name, business_type, province, city, category,
            description, wallet_address, nib_number, npwp,
            reliability_score, verification_status, credit_score,
            annual_revenue, employees, export_ready, total_products,
            certifications, alamat_lengkap, tipe_industri
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    umkm_ids = []
    batch = []
    
    for i, r in enumerate(rows):
        tipe = r['tipe_industri']
        
        # Generate enriched data
        kategori = random.choices(KATEGORI_PRODUK, weights=KATEGORI_WEIGHTS, k=1)[0]
        rev_range = REVENUE_RANGE.get(tipe, (50_000_000, 500_000_000))
        emp_range = EMPLOYEE_RANGE.get(tipe, (1, 10))
        prod_range = PRODUCT_RANGE.get(tipe, (1, 5))
        
        revenue = random.randint(*rev_range)
        employees = random.randint(*emp_range)
        total_products = random.randint(*prod_range)
        
        # Score based on tipe and randomness
        base_score = {'PT': 75, 'CV': 65, 'UD': 55, 'PJ': 45, 'FA': 60, 'PD': 50}.get(tipe, 55)
        reliability = min(98, max(30, base_score + random.randint(-15, 20)))
        credit_score = min(850, max(350, base_score * 8 + random.randint(-100, 150)))
        
        # Verification status
        if reliability >= 80:
            verification = random.choices(['verified', 'pending'], weights=[85, 15], k=1)[0]
        elif reliability >= 60:
            verification = random.choices(['verified', 'pending', 'unverified'], weights=[40, 40, 20], k=1)[0]
        else:
            verification = random.choices(['pending', 'unverified'], weights=[50, 50], k=1)[0]
        
        # Export ready
        export_ready = 1 if (tipe in ('PT', 'CV') and reliability >= 80 and random.random() > 0.6) else 0
        
        # Certifications
        possible_certs = SERTIFIKASI_MAP.get(tipe, ['BPOM'])
        if reliability >= 80:
            num_certs = min(len(possible_certs), random.randint(2, len(possible_certs)))
        elif reliability >= 60:
            num_certs = min(len(possible_certs), random.randint(1, 3))
        else:
            num_certs = random.randint(0, 1)
        certs = random.sample(possible_certs, num_certs) if num_certs > 0 else []
        
        # Description
        desc = f"{r['nama_industri']} adalah usaha {kategori.lower()} yang berlokasi di {r['province']}. "
        desc += f"Bergerak di bidang industri {kategori.lower()} dengan tipe {tipe}. "
        if certs:
            desc += f"Telah tersertifikasi {', '.join(certs)}."
        
        city = r['wilayah'] if r['wilayah'] else r['province']
        
        batch.append((
            None,  # user_id (NULL for imported data)
            r['nama_industri'],
            'Obat Tradisional',
            r['province'],
            city,
            kategori,
            desc,
            generate_wallet(),
            generate_nib(),
            generate_npwp(),
            reliability,
            verification,
            credit_score,
            revenue,
            employees,
            export_ready,
            total_products,
            str(certs).replace("'", '"'),  # JSON array
            r['alamat'],
            tipe,
        ))
        
        if len(batch) >= 500:
            cur.executemany(insert_umkm_sql, batch)
            conn.commit()
            print(f"   Inserted {i+1}/{len(rows)} profiles...")
            batch = []
    
    if batch:
        cur.executemany(insert_umkm_sql, batch)
        conn.commit()
    
    print(f"   ✅ All {len(rows)} UMKM profiles inserted!")
    
    # Get all profile IDs
    cur.execute("SELECT id, business_name, category, tipe_industri, province, reliability_score FROM umkm_profiles WHERE user_id IS NULL")
    all_profiles = cur.fetchall()
    
    # =====================================================================
    # Generate Products (for top 2000 UMKM)
    # =====================================================================
    print(f"\n📦 Generating products for top UMKM...")
    
    insert_product_sql = """
        INSERT INTO products (
            umkm_profile_id, name, category, description, price, unit, quantity,
            blockchain_hash, ipfs_hash, qr_code,
            ai_risk_score, ai_demand_prediction,
            certifications, supply_chain_steps, raw_materials, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    product_batch = []
    product_count = 0
    
    # Generate 1-3 products for each of the first 2000 UMKM
    for profile in all_profiles[:2000]:
        profile_id, biz_name, category, tipe, province, score = profile
        if not category:
            category = random.choice(KATEGORI_PRODUK)
        
        product_names = PRODUCT_NAMES_BY_CATEGORY.get(category, PRODUCT_NAMES_BY_CATEGORY['Obat Tradisional'])
        num_products = random.randint(1, min(3, len(product_names)))
        chosen_products = random.sample(product_names, num_products)
        
        for pname in chosen_products:
            full_name = f"{pname} {biz_name[:20]}"
            price = random.randint(15000, 500000)
            quantity = random.randint(100, 10000)
            risk_score = max(5, min(95, 100 - score + random.randint(-10, 10)))
            demand = random.choice(['rising', 'stable', 'declining', 'rising', 'stable'])
            
            # Supply chain steps
            import json
            num_steps = random.randint(3, 6)
            steps = []
            for si, step_template in enumerate(SUPPLY_CHAIN_STEPS[:num_steps]):
                steps.append({
                    'step': si + 1,
                    'name': step_template['name'],
                    'location': step_template['location'],
                    'status': 'verified' if random.random() > 0.2 else 'pending',
                    'timestamp': f"2026-0{random.randint(1,5)}-{random.randint(1,28):02d}T{random.randint(8,18):02d}:00:00",
                    'actor': biz_name[:30],
                    'txHash': generate_tx_hash(),
                })
            
            # Raw materials
            num_materials = random.randint(2, 5)
            materials = random.sample(RAW_MATERIALS, num_materials)
            for m in materials:
                m['quantity'] = f"{random.randint(10, 500)} kg"
                m['certified'] = random.random() > 0.3
            
            product_batch.append((
                profile_id, full_name, category,
                f"Produk {category.lower()} berkualitas dari {biz_name}. Diproduksi dengan standar CPOTB.",
                price, 'pcs', quantity,
                generate_tx_hash(), f"Qm{hashlib.sha256(str(random.random()).encode()).hexdigest()[:44]}",
                f"TC-{profile_id}-{product_count+1}",
                risk_score, demand,
                '["BPOM"]', json.dumps(steps), json.dumps(materials), 'active'
            ))
            product_count += 1
    
    # Batch insert products
    for i in range(0, len(product_batch), 500):
        cur.executemany(insert_product_sql, product_batch[i:i+500])
        conn.commit()
        print(f"   Inserted {min(i+500, len(product_batch))}/{len(product_batch)} products...")
    
    print(f"   ✅ {product_count} products generated!")
    
    # =====================================================================
    # Generate Certifications
    # =====================================================================
    print(f"\n📜 Generating certifications...")
    
    insert_cert_sql = """
        INSERT INTO certifications (
            umkm_profile_id, product_id, type, name, issuer,
            issued_at, valid_until, status, tx_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    cert_batch = []
    for profile in all_profiles[:3000]:
        profile_id, biz_name, category, tipe, province, score = profile
        possible_certs = SERTIFIKASI_MAP.get(tipe if tipe else 'UD', ['BPOM'])
        
        num_certs = random.randint(1, min(3, len(possible_certs)))
        chosen = random.sample(possible_certs, num_certs)
        
        for cert_type in chosen:
            year = random.randint(2023, 2025)
            month = random.randint(1, 12)
            valid_years = random.randint(2, 5)
            status = 'active' if year + valid_years > 2026 else random.choice(['active', 'expired'])
            
            cert_batch.append((
                profile_id, None, cert_type,
                f"Sertifikasi {cert_type} - {biz_name[:40]}",
                CERT_ISSUERS.get(cert_type, 'Lembaga Sertifikasi'),
                f"{year}-{month:02d}-01",
                f"{year + valid_years}-{month:02d}-01",
                status,
                generate_tx_hash(),
            ))
    
    for i in range(0, len(cert_batch), 500):
        cur.executemany(insert_cert_sql, cert_batch[i:i+500])
        conn.commit()
    
    print(f"   ✅ {len(cert_batch)} certifications generated!")
    
    # =====================================================================
    # Generate Transactions
    # =====================================================================
    print(f"\n💰 Generating blockchain transactions...")
    
    insert_tx_sql = """
        INSERT INTO transactions (
            tx_hash, from_address, to_address, amount, currency,
            type, block_number, gas_used, status, umkm_profile_id, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    tx_types = ['payment', 'certification', 'verification', 'transfer', 'escrow']
    tx_batch = []
    
    for profile in all_profiles[:1500]:
        profile_id, biz_name, category, tipe, province, score = profile
        num_txs = random.randint(1, 5)
        
        for _ in range(num_txs):
            tx_type = random.choice(tx_types)
            amount = random.randint(100000, 50000000) if tx_type in ('payment', 'transfer', 'escrow') else 0
            
            tx_batch.append((
                generate_tx_hash(),
                generate_wallet(),
                generate_wallet(),
                amount, 'IDR',
                tx_type,
                random.randint(1000000, 9999999),
                random.randint(21000, 150000),
                'confirmed',
                profile_id,
                f"{tx_type.capitalize()} - {biz_name[:30]}",
            ))
    
    for i in range(0, len(tx_batch), 500):
        cur.executemany(insert_tx_sql, tx_batch[i:i+500])
        conn.commit()
    
    print(f"   ✅ {len(tx_batch)} transactions generated!")
    
    # =====================================================================
    # Summary
    # =====================================================================
    print("\n" + "=" * 60)
    print("📊 SEED SUMMARY")
    print("=" * 60)
    
    cur.execute("SELECT COUNT(*) FROM umkm_profiles")
    print(f"   UMKM Profiles: {cur.fetchone()[0]}")
    
    cur.execute("SELECT COUNT(*) FROM products")
    print(f"   Products: {cur.fetchone()[0]}")
    
    cur.execute("SELECT COUNT(*) FROM certifications")
    print(f"   Certifications: {cur.fetchone()[0]}")
    
    cur.execute("SELECT COUNT(*) FROM transactions")
    print(f"   Transactions: {cur.fetchone()[0]}")
    
    cur.execute("SELECT COUNT(DISTINCT province) FROM umkm_profiles")
    print(f"   Provinces: {cur.fetchone()[0]}")
    
    cur.execute("SELECT province, COUNT(*) as cnt FROM umkm_profiles GROUP BY province ORDER BY cnt DESC LIMIT 10")
    print("\n   Top 10 Provinces:")
    for row in cur.fetchall():
        print(f"     {row[0]}: {row[1]}")
    
    cur.execute("SELECT category, COUNT(*) as cnt FROM umkm_profiles GROUP BY category ORDER BY cnt DESC")
    print("\n   Category Distribution:")
    for row in cur.fetchall():
        print(f"     {row[0]}: {row[1]}")
    
    conn.close()
    print("\n✅ Database seeding complete!")


if __name__ == '__main__':
    main()
