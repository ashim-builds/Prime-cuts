const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../services/.env') });

const dbConfig = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQL_PORT || '3307', 10),
  user: process.env.MYSQL_USER || 'primeuser',
  password: process.env.MYSQL_PASSWORD || 'primepassword',
  database: process.env.MYSQL_DATABASE || 'primecuts',
};

const categories = [
  {
    id: "cat_goat",
    name: "Goat & Mutton",
    slug: "goat-mutton",
    description: "Fresh castrated goat (Khasi), Boka meat, head, bhutan, and trotters.",
    image: "/images/cat_goat.jpg",
  },
  {
    id: "cat_chicken",
    name: "Fresh Chicken",
    slug: "chicken",
    description: "Broiler chicken, Giriraj heritage chicken, curry cuts, feet, liver, and gizzard.",
    image: "/images/cat_chicken.jpg",
  },
  {
    id: "cat_sausages",
    name: "Sausages & Frozen Items",
    slug: "sausages-frozen",
    description: "Artisanal sausages, frozen momos, and ready-to-cook snacks.",
    image: "/images/cat_sausages.jpg",
  },
  {
    id: "cat_eggs",
    name: "Eggs & Essentials",
    slug: "eggs",
    description: "Daily farm fresh chicken eggs in crates and dozens.",
    image: "/images/snack_bowl.jpg",
  },
];

const products = [
  {
    id: "prod_khasi_masu",
    name: "Fresh Castrated Goat (खसीको मासु)",
    slug: "fresh-castrated-goat-khasi",
    description: "Daily butchered tender and fresh castrated goat (Khasi) meat. Cleanly cut and packed.",
    image: "/images/meat_goat_bone.jpg",
    images: ["/images/meat_goat_bone.jpg", "/images/meat_goat_boneless.jpg"],
    category: "Goat & Mutton",
    price_type: "weight",
    price_per_kg: 1300,
    weight_options: [500, 1000, 1500, 2000],
    allow_custom_weight: true,
    variants: [],
    available: true,
    featured: true,
  },
  {
    id: "prod_boka_masu",
    name: "Fresh Boka Meat (बोकाको मासु)",
    slug: "fresh-boka-goat-meat",
    description: "Fresh, healthy uncastrated goat (Boka) meat prepared cleanly to order.",
    image: "/images/meat_goat_bone.jpg",
    images: ["/images/meat_goat_bone.jpg"],
    category: "Goat & Mutton",
    price_type: "weight",
    price_per_kg: 1200,
    weight_options: [500, 1000, 1500, 2000],
    allow_custom_weight: true,
    variants: [],
    available: true,
    featured: true,
  },
  {
    id: "prod_broiler_kukhura",
    name: "Broiler Chicken Meat (ब्रोइलर कुखुराको मासु)",
    slug: "broiler-chicken-meat",
    description: "Fresh broiler chicken cut cleanly into curry cuts, skin-on or skinless according to your preference.",
    image: "/images/meat_whole_chicken.jpg",
    images: ["/images/meat_whole_chicken.jpg", "/images/meat_chicken_boneless.jpg"],
    category: "Fresh Chicken",
    price_type: "weight",
    price_per_kg: 420,
    weight_options: [500, 1000, 1500, 2000],
    allow_custom_weight: true,
    variants: [],
    available: true,
    featured: true,
  },
  {
    id: "prod_giriraj_kukhura",
    name: "Giriraj Chicken Meat (गिरी राज कुखुराको मासु)",
    slug: "giriraj-local-chicken-meat",
    description: "Organically fed free-range Giriraj local chicken meat known for rich taste and firm texture.",
    image: "/images/meat_local_chicken.jpg",
    images: ["/images/meat_local_chicken.jpg"],
    category: "Fresh Chicken",
    price_type: "weight",
    price_per_kg: 729,
    weight_options: [500, 1000, 1500, 2000],
    allow_custom_weight: true,
    variants: [],
    available: true,
    featured: true,
  },
  {
    id: "prod_khasi_tauko",
    name: "Khasi Head (खसीको टाउको)",
    slug: "khasi-goat-head-tauko",
    description: "Cleaned and singed Khasi goat head, chopped to size for curry or soup.",
    image: "/images/meat_mixed_cuts.jpg",
    images: ["/images/meat_mixed_cuts.jpg"],
    category: "Goat & Mutton",
    price_type: "variant",
    price_per_kg: null,
    weight_options: [],
    allow_custom_weight: false,
    variants: [
      { id: "v_head_1", name: "1 Full Head (१ वटा टाउको)", price: 600, available: true }
    ],
    available: true,
    featured: false,
  },
  {
    id: "prod_khasi_bhutan",
    name: "Khasi Bhutan / Tripe (खसीको भुटन)",
    slug: "khasi-goat-bhutan-tripe",
    description: "Freshly cleaned Khasi goat intestines, tripe, and liver mix, ready for spicy fry.",
    image: "/images/meat_mutton_chops.jpg",
    images: ["/images/meat_mutton_chops.jpg"],
    category: "Goat & Mutton",
    price_type: "weight",
    price_per_kg: 700,
    weight_options: [500, 1000, 1500],
    allow_custom_weight: true,
    variants: [],
    available: true,
    featured: true,
  },
  {
    id: "prod_boka_khutta",
    name: "Boka Trotters (बोकाको खुट्टा - ३ वटा)",
    slug: "boka-goat-trotters-legs",
    description: "Thoroughly cleaned and singed Boka goat legs / trotters (3 pcs per set).",
    image: "/images/meat_goat_bone.jpg",
    images: ["/images/meat_goat_bone.jpg"],
    category: "Goat & Mutton",
    price_type: "variant",
    price_per_kg: null,
    weight_options: [],
    allow_custom_weight: false,
    variants: [
      { id: "v_boka_leg_3", name: "Set of 3 Pcs (३ वटा खुट्टा)", price: 500, available: true }
    ],
    available: true,
    featured: false,
  },
  {
    id: "prod_khasi_khutta",
    name: "Khasi Trotters (खसीको खुट्टा - ४ वटा)",
    slug: "khasi-goat-trotters-legs-4pcs",
    description: "Cleaned and singed Khasi goat trotters / legs (4 pcs full set) rich in collagen.",
    image: "/images/meat_goat_bone.jpg",
    images: ["/images/meat_goat_bone.jpg"],
    category: "Goat & Mutton",
    price_type: "variant",
    price_per_kg: null,
    weight_options: [],
    allow_custom_weight: false,
    variants: [
      { id: "v_khasi_leg_4", name: "Set of 4 Pcs (४ वटा खुट्टा)", price: 600, available: true }
    ],
    available: true,
    featured: false,
  },
  {
    id: "prod_kukhura_cut_piece",
    name: "Chicken Cut Piece (कुखुराको कट पिस / Curry Cut)",
    slug: "chicken-curry-cut-piece",
    description: "Pre-cut fresh chicken pieces suitable for home curry, stew or barbecue.",
    image: "/images/meat_chicken_wings.jpg",
    images: ["/images/meat_chicken_wings.jpg"],
    category: "Fresh Chicken",
    price_type: "weight",
    price_per_kg: 420,
    weight_options: [500, 1000],
    allow_custom_weight: true,
    variants: [
      { id: "v_cut_half", name: "500g Pack", price: 210, available: true },
      { id: "v_cut_1kg", name: "1 Kg Pack", price: 420, available: true }
    ],
    available: true,
    featured: false,
  },
  {
    id: "prod_kukhura_khutta",
    name: "Chicken Feet (कुखुराको खुट्टा)",
    slug: "chicken-feet-khutta",
    description: "Fresh and cleaned chicken feet, rich in collagen and great for soups.",
    image: "/images/meat_chicken_drumstick.jpg",
    images: ["/images/meat_chicken_drumstick.jpg"],
    category: "Fresh Chicken",
    price_type: "variant",
    price_per_kg: null,
    weight_options: [],
    allow_custom_weight: false,
    variants: [
      { id: "v_feet_portion", name: "Standard Pack (१ प्याक)", price: 100, available: true }
    ],
    available: true,
    featured: false,
  },
  {
    id: "prod_kukhura_tauko",
    name: "Chicken Head (कुखुराको टाउको)",
    slug: "chicken-head-tauko",
    description: "Cleaned chicken heads ready for preparation.",
    image: "/images/meat_whole_chicken.jpg",
    images: ["/images/meat_whole_chicken.jpg"],
    category: "Fresh Chicken",
    price_type: "variant",
    price_per_kg: null,
    weight_options: [],
    allow_custom_weight: false,
    variants: [
      { id: "v_head_portion", name: "Standard Pack (१ प्याक)", price: 100, available: true }
    ],
    available: true,
    featured: false,
  },
  {
    id: "prod_kukhura_kalejo",
    name: "Chicken Liver (कुखुराको कलेजो)",
    slug: "fresh-chicken-liver-kalejo",
    description: "Fresh, iron-rich chicken liver, cleaned and packed.",
    image: "/images/meat_chicken_boneless.jpg",
    images: ["/images/meat_chicken_boneless.jpg"],
    category: "Fresh Chicken",
    price_type: "variant",
    price_per_kg: null,
    weight_options: [],
    allow_custom_weight: false,
    variants: [
      { id: "v_liver_500g", name: "500g Portion", price: 250, available: true }
    ],
    available: true,
    featured: false,
  },
  {
    id: "prod_kukhura_pangra",
    name: "Chicken Gizzard (कुखुराको पाङ्ग्रा)",
    slug: "fresh-chicken-gizzard-pangra",
    description: "Thoroughly cleaned crunchy chicken gizzard (pangra).",
    image: "/images/meat_chicken_boneless.jpg",
    images: ["/images/meat_chicken_boneless.jpg"],
    category: "Fresh Chicken",
    price_type: "variant",
    price_per_kg: null,
    weight_options: [],
    allow_custom_weight: false,
    variants: [
      { id: "v_pangra_500g", name: "500g Portion", price: 250, available: true }
    ],
    available: true,
    featured: false,
  },
  {
    id: "prod_sausage_artisanal",
    name: "Artisanal Sausages (फ्रोजन ससेज)",
    slug: "artisanal-frozen-sausages",
    description: "Juicy, seasoned artisanal pork & chicken sausages for grilling, boiling, air frying or pan fry.",
    image: "/images/meat_sausages.jpg",
    images: ["/images/meat_sausages.jpg"],
    category: "Sausages & Frozen Items",
    price_type: "variant",
    price_per_kg: null,
    weight_options: [],
    allow_custom_weight: false,
    variants: [
      { id: "v_saus_500g", name: "500g Pack", price: 450, available: true },
      { id: "v_saus_1kg", name: "1 Kg Pack", price: 850, available: true }
    ],
    available: true,
    featured: true,
  },
  {
    id: "prod_frozen_momo",
    name: "Fresh Frozen Momos (फ्रोजन ममोज)",
    slug: "fresh-frozen-meat-momos",
    description: "Handcrafted juicy frozen meat dumplings made with fresh minced cuts. Ready to steam.",
    image: "/images/cat_ready.jpg",
    images: ["/images/cat_ready.jpg"],
    category: "Sausages & Frozen Items",
    price_type: "variant",
    price_per_kg: null,
    weight_options: [],
    allow_custom_weight: false,
    variants: [
      { id: "v_momo_plate", name: "1 Packet (20 Pcs)", price: 350, available: true }
    ],
    available: true,
    featured: true,
  },
  {
    id: "prod_fresh_eggs",
    name: "Farm Fresh Eggs (कुखुराको अण्डा)",
    slug: "farm-fresh-chicken-eggs",
    description: "Nutritious, grade-A farm fresh chicken eggs available in crates and dozens.",
    image: "/images/snack_bowl.jpg",
    images: ["/images/snack_bowl.jpg"],
    category: "Eggs & Essentials",
    price_type: "variant",
    price_per_kg: null,
    weight_options: [],
    allow_custom_weight: false,
    variants: [
      { id: "v_egg_dozen", name: "1 Dozen (१२ वटा)", price: 200, available: true },
      { id: "v_egg_crate", name: "1 Full Crate (३० वटा / 1 Crate)", price: 480, available: true }
    ],
    available: true,
    featured: true,
  }
];

async function seed() {
  console.log('[Seed] Connecting to MySQL database...');
  const pool = mysql.createPool(dbConfig);

  try {
    // 1. Insert or update Categories
    for (const cat of categories) {
      await pool.query(
        `INSERT INTO categories (id, name, slug, description, image, active)
         VALUES (?, ?, ?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image=VALUES(image), active=TRUE`,
        [cat.id, cat.name, cat.slug, cat.description, cat.image]
      );
      console.log(`[Category] Seeded: ${cat.name}`);
    }

    // 2. Insert or update Products
    for (const p of products) {
      await pool.query(
        `INSERT INTO products (
           id, name, slug, description, image, images, category, price_type, price_per_kg,
           weight_options, allow_custom_weight, variants, available, featured
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name=VALUES(name),
           description=VALUES(description),
           image=VALUES(image),
           images=VALUES(images),
           category=VALUES(category),
           price_type=VALUES(price_type),
           price_per_kg=VALUES(price_per_kg),
           weight_options=VALUES(weight_options),
           allow_custom_weight=VALUES(allow_custom_weight),
           variants=VALUES(variants),
           available=VALUES(available),
           featured=VALUES(featured)`,
        [
          p.id,
          p.name,
          p.slug,
          p.description,
          p.image,
          JSON.stringify(p.images),
          p.category,
          p.price_type,
          p.price_per_kg,
          JSON.stringify(p.weight_options),
          p.allow_custom_weight,
          JSON.stringify(p.variants),
          p.available,
          p.featured
        ]
      );
      console.log(`[Product] Seeded: ${p.name} (Rs. ${p.price_per_kg || 'variant'})`);
    }

    console.log(`\n========================================`);
    console.log(`[SUCCESS] All ${products.length} products and ${categories.length} categories seeded successfully!`);
    console.log(`========================================`);
  } catch (err) {
    console.error('[Seed Error]:', err);
  } finally {
    await pool.end();
  }
}

seed();
