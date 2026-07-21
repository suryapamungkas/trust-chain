import json
import os
import shutil
import mysql.connector
import bcrypt
import hashlib
import random

def generate_wallet():
    return '0x' + hashlib.sha256(str(random.random()).encode()).hexdigest()[:40]

def generate_tx_hash():
    return '0x' + hashlib.sha256(str(random.random()).encode()).hexdigest()

def extract_province(wilayah):
    if not wilayah or wilayah == 'NULL':
        return 'DKI Jakarta'
    province_mapping = {
        'Jakarta': 'DKI Jakarta', 'Jawa Barat': 'Jawa Barat', 'Jawa Timur': 'Jawa Timur',
        'Jawa Tengah': 'Jawa Tengah', 'Banten': 'Banten', 'Sumatera Utara': 'Sumatera Utara',
        'Bali': 'Bali', 'Sulawesi Selatan': 'Sulawesi Selatan',
    }
    w = str(wilayah)
    for key, province in province_mapping.items():
        if key.lower() in w.lower(): return province
    return w

# 1. Setup Images Directory
images_dir = "public/products"
os.makedirs(images_dir, exist_ok=True)
brain_dir = r"C:\Users\ASUS\.gemini\antigravity\brain\96ed6433-fd37-4454-b139-7c3cd53ae5c9"

# Copy images
img_map = {
    'minyak': os.path.join(brain_dir, "minyak_gosok_1779978075477.png"),
    'kapsul': os.path.join(brain_dir, "kapsul_herbal_1779978093550.png"),
    'minuman': os.path.join(brain_dir, "minuman_herbal_1779978109651.png"),
    'salep': os.path.join(brain_dir, "salep_herbal_1779978128790.png"),
    'teh': os.path.join(brain_dir, "teh_herbal_1779978150121.png"),
}

for name, src in img_map.items():
    dest = os.path.join(images_dir, f"{name}.png")
    if os.path.exists(src):
        shutil.copy(src, dest)
    else:
        print(f"Warning: {src} not found")

# 2. Connect to DB
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="trustchain_umkm"
)
cursor = conn.cursor(dictionary=True)

# 3. Read JSON
with open('dataset_35.json', 'r') as f:
    dataset = json.load(f)

print(f"Loaded {len(dataset)} items from JSON")

default_password = bcrypt.hashpw(b"umkm123", bcrypt.gensalt()).decode('utf-8')

# Clear old products (keep 1-7 from seed)
cursor.execute("DELETE FROM products WHERE id > 7")
conn.commit()

# Insert the 35 UMKM and 1 product for each
for i, item in enumerate(dataset):
    nama_industri = item.get('nama_industri', f'UMKM {i}')
    alamat = item.get('alamat', '')
    wilayah = item.get('wilayah', '')
    tipe = item.get('tipe_industri', 'UD')
    if not tipe: tipe = 'UD'
    
    province = extract_province(wilayah)
    
    email = f"umkm{i+100}@trustchain.id"
    wallet = generate_wallet()
    
    # Insert User
    cursor.execute("""
        INSERT INTO users (name, email, password_hash, role, address, wallet_address, balance_idr, balance_usd)
        VALUES (%s, %s, %s, 'umkm', %s, %s, %s, %s)
    """, (nama_industri, email, default_password, alamat, wallet, random.randint(10000000, 100000000), random.randint(1000, 5000)))
    user_id = cursor.lastrowid
    
    # Insert UMKM Profile
    cursor.execute("""
        INSERT INTO umkm_profiles (user_id, business_name, business_type, province, city, category, description, verification_status)
        VALUES (%s, %s, %s, %s, %s, 'Obat Tradisional', %s, 'verified')
    """, (user_id, nama_industri, tipe, province, wilayah, f"Toko {nama_industri} menjual berbagai produk herbal dan obat tradisional berkualitas tinggi."))
    profile_id = cursor.lastrowid
    
    # Assign a product category
    cats = [
        ("Minyak Gosok Tradisional", "Minyak", 35000, 2.5, "/products/minyak.png"),
        ("Kapsul Ekstrak Herbal", "Suplemen", 85000, 5.5, "/products/kapsul.png"),
        ("Sirup Jamu Herbal", "Jamu Cair", 45000, 3.0, "/products/minuman.png"),
        ("Salep Kulit Alami", "Kosmetik", 30000, 2.0, "/products/salep.png"),
        ("Teh Seduh Organik", "Minuman", 55000, 3.8, "/products/teh.png")
    ]
    
    # Pick a category based on index to distribute evenly
    prod_name, prod_cat, price, usd, img = cats[i % 5]
    
    # Insert Product
    cursor.execute("""
        INSERT INTO products (umkm_profile_id, name, category, description, price_idr, price_usd, stock, unit, image_url, blockchain_hash, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, 'pcs', %s, %s, 'active')
    """, (profile_id, f"{prod_name} {nama_industri[:10]}", prod_cat, f"Produk unggulan dari {nama_industri}.", price, usd, random.randint(50, 500), img, generate_tx_hash()))
    
conn.commit()
print("Successfully seeded 35 UMKM profiles and 35 products!")

# Now update the existing 5 herbalindo farma products to have images
herbal_images = [
    ("/products/minuman.png", 1), # Jamu Kunyit Asam
    ("/products/kapsul.png", 2), # Ekstrak Temulawak
    ("/products/teh.png", 3), # Teh Herbal Jahe Merah
    ("/products/minyak.png", 4), # Minyak Angin
]

for img, p_id in herbal_images:
    cursor.execute("UPDATE products SET image_url = %s WHERE id = %s", (img, p_id))

conn.commit()
print("Updated Herbalindo images!")

cursor.close()
conn.close()
