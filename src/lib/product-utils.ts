/**
 * TrustChain UMKM — Shared Product Utilities & Constants
 */

export const FALLBACK_PRODUCT_IMAGE = "/images/products/kunyit_asam_keraton.png";

export const PRODUCT_CATEGORIES = [
  "Jamu Tradisional",
  "Ekstrak Herbal",
  "Minyak Atsiri",
  "Teh & Seduhan",
  "Perawatan Tubuh",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface CuratedProductItem {
  id: number;
  umkm_profile_id: number;
  name: string;
  category: string;
  description: string;
  price_idr: number;
  price_usd: number;
  stock: number;
  unit: string;
  image_url: string;
  blockchain_hash: string;
  certifications: string;
  status: string;
  umkm_name: string;
  umkm_wallet: string;
}

export const CURATED_DEMO_PRODUCTS: CuratedProductItem[] = [
  {
    id: 1,
    umkm_profile_id: 1,
    name: "Jamu Kunyit Asam Sirih Keraton",
    category: "Jamu Tradisional",
    description: "Ramuan jamu kunyit asam warisan keraton Jawa dengan perpaduan sirih merah, kunyit induk organik, dan asam jawa matang pohon. Diproses cold-pressed tanpa pengawet untuk merawat pencernaan dan detoksifikasi tubuh.",
    price_idr: 65000,
    price_usd: 4.2,
    stock: 850,
    unit: "botol (350ml)",
    image_url: "/images/products/kunyit_asam_keraton.png",
    blockchain_hash: "0x594ed1729d3f520a47706c5aa93540fe0f625e47c2a790e26185c0874f11127b",
    certifications: '["BPOM TR213645011","Halal MUI","CPOTB Grade A"]',
    status: "active",
    umkm_name: "HERBALINDO FARMA",
    umkm_wallet: "0xa5A45358992FC926e89603D69042402667998B66",
  },
  {
    id: 2,
    umkm_profile_id: 2,
    name: "Beras Kencur Wangi Solo Imperial",
    category: "Jamu Tradisional",
    description: "Racikan beras kencur premium khas Solo dengan kencur wangi lereng Gunung Lawu, beras ketan pilihan, jahe merah, kayu manis, dan madu hutan. Memulihkan stamina, meredakan lelah, dan menghangatkan tubuh.",
    price_idr: 58000,
    price_usd: 3.8,
    stock: 620,
    unit: "botol (250ml)",
    image_url: "/images/products/beras_kencur_imperial.png",
    blockchain_hash: "0xa4b0e026d5a42e0af2abc2686295f85293588ce927cab023b93e79f3a4a43bb6",
    certifications: '["BPOM TR203639881","Halal MUI","HACCP"]',
    status: "active",
    umkm_name: "JAMU GAYO SEHAT",
    umkm_wallet: "0xB355A66F07966987d363e9E2b7cf8Acb9E88ED71",
  },
  {
    id: 3,
    umkm_profile_id: 1,
    name: "Temulawak Curcumin Gold Signature",
    category: "Ekstrak Herbal",
    description: "Kapsul ekstrak temulawak murni standar farmasi dengan konsentrasi kurkuminoid 95%. Dirancang khusus untuk memelihara fungsi hati (liver), mengoptimalkan metabolisme, dan meningkatkan imunitas.",
    price_idr: 145000,
    price_usd: 9.5,
    stock: 430,
    unit: "botol (60 kapsul)",
    image_url: "/images/products/temulawak_curcumin.png",
    blockchain_hash: "0xe81b040da061a073c769017f49a1324dae0bf23e60b1134e3c5920977d522e02",
    certifications: '["BPOM TR193331521","Halal MUI","ISO 9001","CPOTB"]',
    status: "active",
    umkm_name: "HERBALINDO FARMA",
    umkm_wallet: "0xa5A45358992FC926e89603D69042402667998B66",
  },
  {
    id: 4,
    umkm_profile_id: 1,
    name: "Minyak Balur 69 Rempah Heritage",
    category: "Minyak Atsiri",
    description: "Minyak balur terapi holistik warisan nusantara yang diramu dari 69 jenis rempah-rempah berkhasiat termasuk adas, cengkeh, gaharu, dan VCO. Meredakan pegal linu, rematik, serta melancarkan energi tubuh.",
    price_idr: 185000,
    price_usd: 12.0,
    stock: 510,
    unit: "botol (100ml)",
    image_url: "/images/products/minyak_balur_69.png",
    blockchain_hash: "0xad23635a0a24378a24e49470e23806cc667e45ad4c3e54b2920ba273b716c4b9",
    certifications: '["BPOM QD183616611","Halal MUI","Cruelty-Free"]',
    status: "active",
    umkm_name: "HERBALINDO FARMA",
    umkm_wallet: "0xa5A45358992FC926e89603D69042402667998B66",
  },
  {
    id: 5,
    umkm_profile_id: 2,
    name: "Kapsul Ekstrak Purwoceng Dieng Reserve",
    category: "Ekstrak Herbal",
    description: "Ekstrak akar Purwoceng endemik Dataran Tinggi Dieng 2000 mdpl. Dikenal sebagai ginseng Jawa legendaris untuk vitalitas pria, daya tahan tubuh prima, dan sirkulasi darah mikro.",
    price_idr: 225000,
    price_usd: 14.5,
    stock: 340,
    unit: "canister (60 kapsul)",
    image_url: "/images/products/purwoceng_dieng.png",
    blockchain_hash: "0x898536c70e67dea8f9bf2fe5146e8a15d5677ee40fcb0a03f1c99173ca2e75c9",
    certifications: '["BPOM TR213388711","Halal MUI","Organik Indonesia"]',
    status: "active",
    umkm_name: "JAMU GAYO SEHAT",
    umkm_wallet: "0xB355A66F07966987d363e9E2b7cf8Acb9E88ED71",
  },
  {
    id: 6,
    umkm_profile_id: 1,
    name: "Elixir Galian Singset Ratu Madura",
    category: "Jamu Tradisional",
    description: "Formula jamu galian singset ningrat Madura berbasis majakani, kayu rapet, daun sirih, dan kunci pepet. Merawat kesehatan kewanitaan, mengencangkan otot tubuh, dan menjaga kebugaran alami.",
    price_idr: 95000,
    price_usd: 6.2,
    stock: 480,
    unit: "botol (250ml)",
    image_url: "/images/products/galian_singset_madura.png",
    blockchain_hash: "0x479141a00d7edbd1f206503d1203cdcbbf5e1b800616e880673ac46ca9b413db",
    certifications: '["BPOM TR203641291","Halal MUI","CPOTB"]',
    status: "active",
    umkm_name: "HERBALINDO FARMA",
    umkm_wallet: "0xa5A45358992FC926e89603D69042402667998B66",
  },
  {
    id: 7,
    umkm_profile_id: 2,
    name: "Kapsul Habbatussauda & Propolis Trigona",
    category: "Ekstrak Herbal",
    description: "Sinergi habbatussauda cold-pressed murni dan ekstrak propolis lebah tanpa sengat Trigona. Kaya antioksidan thymoquinone untuk perlindungan imunitas seluler dan daya tahan tubuh maksimal.",
    price_idr: 115000,
    price_usd: 7.5,
    stock: 650,
    unit: "botol (60 kapsul)",
    image_url: "/images/products/habbatussauda.png",
    blockchain_hash: "0xa7f503367fb9b45c7c9a06d9bf682adc820e2da21791ae2263b3e90b26511fc7",
    certifications: '["BPOM TR193325601","Halal MUI","GMP Certified"]',
    status: "active",
    umkm_name: "JAMU GAYO SEHAT",
    umkm_wallet: "0xB355A66F07966987d363e9E2b7cf8Acb9E88ED71",
  },
  {
    id: 8,
    umkm_profile_id: 1,
    name: "Teh Herbal Bunga Telang & Serai Wangi",
    category: "Teh & Seduhan",
    description: "Teh celup piramida bunga telang organik dipadu serai wangi dan daun pandan tropis. Menghasilkan seduhan biru safir alami kaya antosianin untuk relaksasi mendalam dan kesehatan mata.",
    price_idr: 75000,
    price_usd: 4.9,
    stock: 520,
    unit: "pouch (20 sachet)",
    image_url: "/images/products/teh.png",
    blockchain_hash: "0xa123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    certifications: '["BPOM RI MD 267911001","Halal MUI","Rainforest Certified"]',
    status: "active",
    umkm_name: "HERBALINDO FARMA",
    umkm_wallet: "0xa5A45358992FC926e89603D69042402667998B66",
  },
  {
    id: 9,
    umkm_profile_id: 2,
    name: "Lulur Rempah Mangir Kuning Kasultanan",
    category: "Perawatan Tubuh",
    description: "Lulur mandi tradisional putri keraton berbahan rimpang temu giring, kunyit kasturi, cendana wangi, dan serbuk beras. Mencerahkan kulit, mengangkat sel mati, dan mengharumkan tubuh semerbak rempah.",
    price_idr: 88000,
    price_usd: 5.7,
    stock: 390,
    unit: "jar (200g)",
    image_url: "/images/products/salep_kencur.png",
    blockchain_hash: "0xb123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    certifications: '["BPOM NA18210700542","Halal MUI","CPKB"]',
    status: "active",
    umkm_name: "JAMU GAYO SEHAT",
    umkm_wallet: "0xB355A66F07966987d363e9E2b7cf8Acb9E88ED71",
  },
  {
    id: 10,
    umkm_profile_id: 1,
    name: "Minyak Kayu Putih Asli Ambon Grade A",
    category: "Minyak Atsiri",
    description: "Minyak kayu putih murni hasil penyulingan tradisional daun kayu putih Pulau Buru, Ambon. Memiliki kadar sineol tinggi dengan kehangatan tahan lama untuk melegakan pernapasan dan kembung.",
    price_idr: 125000,
    price_usd: 8.1,
    stock: 410,
    unit: "botol (100ml)",
    image_url: "/images/products/minyak.png",
    blockchain_hash: "0xc123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    certifications: '["BPOM TR185612341","Halal MUI","Indikasi Geografis"]',
    status: "active",
    umkm_name: "HERBALINDO FARMA",
    umkm_wallet: "0xa5A45358992FC926e89603D69042402667998B66",
  },
  {
    id: 11,
    umkm_profile_id: 1,
    name: "Ekstrak Sambiloto King of Bitters Ultra",
    category: "Ekstrak Herbal",
    description: "Ekstrak daun sambiloto terstandarisasi andrographolide murni. Terkenal sebagai King of Bitters untuk meredakan radang tenggorokan, menurunkan demam, dan detoksifikasi alami tubuh.",
    price_idr: 105000,
    price_usd: 6.8,
    stock: 580,
    unit: "botol (60 kapsul)",
    image_url: "/images/products/kapsul.png",
    blockchain_hash: "0xd123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    certifications: '["BPOM TR213354921","Halal MUI","CPOTB"]',
    status: "active",
    umkm_name: "HERBALINDO FARMA",
    umkm_wallet: "0xa5A45358992FC926e89603D69042402667998B66",
  },
  {
    id: 12,
    umkm_profile_id: 2,
    name: "Sirup Herbal Daun Pegagan Brahmi Jawa",
    category: "Jamu Tradisional",
    description: "Sirup pekat ekstrak daun pegagan liar berkhasiat nootropik alami yang diperkaya madu randu dan lemon. Membantu daya konsentrasi, sirkulasi otak, serta meredakan kecemasan pikiran.",
    price_idr: 98000,
    price_usd: 6.4,
    stock: 370,
    unit: "botol (250ml)",
    image_url: "/images/products/minuman.png",
    blockchain_hash: "0xe123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    certifications: '["BPOM TR213658931","Halal MUI","SNI Organik"]',
    status: "active",
    umkm_name: "JAMU GAYO SEHAT",
    umkm_wallet: "0xB355A66F07966987d363e9E2b7cf8Acb9E88ED71",
  },
];

/**
 * Safely parse certification strings from JSON, comma-separated, or undefined
 */
export function parseCertifications(certStr?: string): string[] {
  if (!certStr) return ["BPOM TR", "Halal MUI", "CPOTB"];
  try {
    const parsed = JSON.parse(certStr);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    return certStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return ["BPOM TR", "Halal MUI", "CPOTB"];
}
