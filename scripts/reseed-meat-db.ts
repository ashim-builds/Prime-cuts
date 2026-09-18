import { getPool } from '../src/server/db';

async function reseed() {
  const p = getPool();
  console.log('[Reseed] Starting full English meat database reseed...');

  // Categories in English
  const categories = [
    {
      id: 'cat_chicken',
      name: 'Fresh Chicken',
      slug: 'chicken',
      description: 'Daily fresh cut, antibiotic-free, and healthy farm-raised chicken.',
      image: '/images/cat_chicken.jpg',
      active: true,
    },
    {
      id: 'cat_goat',
      name: 'Goat & Mutton',
      slug: 'mutton-goat',
      description: 'Locally raised, tender, and flavorful goat and mutton cuts.',
      image: '/images/cat_goat.jpg',
      active: true,
    },
    {
      id: 'cat_buff',
      name: 'Buff & Beef',
      slug: 'buff-beef',
      description: 'Certified fresh water buffalo cuts, minced keema, and lean stewing cuts.',
      image: '/images/cat_buff.jpg',
      active: true,
    },
    {
      id: 'cat_pork',
      name: 'Fresh Pork',
      slug: 'pork',
      description: 'Hygienically prepared, tender pork belly, rib chops, and cuts.',
      image: '/images/cat_pork.jpg',
      active: true,
    },
    {
      id: 'cat_sausages',
      name: 'Sausages & Bacon',
      slug: 'sausages-bacon',
      description: 'Artisanal hardwood-smoked sausages, crispy bacon strips, and deli cold cuts.',
      image: '/images/cat_sausages.jpg',
      active: true,
    },
    {
      id: 'cat_steaks',
      name: 'Prime Steaks & BBQ',
      slug: 'steaks-bbq',
      description: 'Prime Ribeye, T-Bone, and marbled specialty barbecue cuts.',
      image: '/images/cat_steaks.jpg',
      active: true,
    },
  ];

  // Products in English
  const products = [
    {
      id: 'prod_goat_bone',
      name: 'Fresh Goat Meat (Curry Cut Bone-in)',
      slug: 'goat-meat-curry-cut',
      description: 'Farm-fresh, tender, and juicy goat meat cut into balanced bone-in pieces ideal for traditional rich curries, stews, and gravies.',
      image: '/images/meat_goat_bone.jpg',
      images: JSON.stringify(['/images/meat_goat_bone.jpg', '/images/meat_goat_boneless.jpg']),
      category: 'Goat & Mutton',
      price_type: 'weight',
      price_per_kg: 680.00,
      weight_options: JSON.stringify([
        { value: 250, unit: 'g' },
        { value: 500, unit: 'g' },
        { value: 1, unit: 'kg' },
        { value: 2, unit: 'kg' }
      ]),
      allow_custom_weight: true,
      variants: '[]',
      available: true,
      featured: true,
    },
    {
      id: 'prod_chicken_boneless',
      name: 'Boneless Chicken Breast',
      slug: 'chicken-boneless-breast',
      description: 'Skinless, boneless chicken breast cut fresh daily. High protein, lean, and tender — perfect for grilling, meal prep, salads, and curries.',
      image: '/images/meat_chicken_boneless.jpg',
      images: JSON.stringify(['/images/meat_chicken_boneless.jpg', '/images/meat_chicken_drumstick.jpg']),
      category: 'Fresh Chicken',
      price_type: 'weight',
      price_per_kg: 450.00,
      weight_options: JSON.stringify([
        { value: 250, unit: 'g' },
        { value: 500, unit: 'g' },
        { value: 1, unit: 'kg' }
      ]),
      allow_custom_weight: true,
      variants: '[]',
      available: true,
      featured: true,
    },
    {
      id: 'prod_chicken_drumstick',
      name: 'Fresh Chicken Drumsticks',
      slug: 'chicken-drumsticks',
      description: 'Juicy and succulent chicken drumsticks with bone. Perfect for roasting, barbecue, pan frying, or slow-cooked chicken curries.',
      image: '/images/meat_chicken_drumstick.jpg',
      images: JSON.stringify(['/images/meat_chicken_drumstick.jpg']),
      category: 'Fresh Chicken',
      price_type: 'weight',
      price_per_kg: 480.00,
      weight_options: JSON.stringify([
        { value: 500, unit: 'g' },
        { value: 1, unit: 'kg' }
      ]),
      allow_custom_weight: true,
      variants: '[]',
      available: true,
      featured: true,
    },
    {
      id: 'prod_whole_chicken',
      name: 'Farm-Fresh Whole Chicken (Curry Cut)',
      slug: 'local-chicken-whole-cut',
      description: 'Whole healthy chicken cleaned, dressed, and chopped into standard curry-sized pieces with bone. Rich flavor and tender texture.',
      image: '/images/meat_whole_chicken.jpg',
      images: JSON.stringify(['/images/meat_whole_chicken.jpg']),
      category: 'Fresh Chicken',
      price_type: 'weight',
      price_per_kg: 650.00,
      weight_options: JSON.stringify([
        { value: 1, unit: 'kg' },
        { value: 1.5, unit: 'kg' },
        { value: 2, unit: 'kg' }
      ]),
      allow_custom_weight: true,
      variants: '[]',
      available: true,
      featured: true,
    },
    {
      id: 'prod_mutton_chops',
      name: 'Premium Mutton Rib Chops',
      slug: 'mutton-rib-chops',
      description: 'Hand-trimmed tender goat rib chops. Perfect for grilling, pan-searing with herbs, or roasting for dinner centerpieces.',
      image: '/images/meat_mutton_chops.jpg',
      images: JSON.stringify(['/images/meat_mutton_chops.jpg', '/images/meat_goat_bone.jpg']),
      category: 'Goat & Mutton',
      price_type: 'weight',
      price_per_kg: 850.00,
      weight_options: JSON.stringify([
        { value: 500, unit: 'g' },
        { value: 1, unit: 'kg' }
      ]),
      allow_custom_weight: true,
      variants: '[]',
      available: true,
      featured: true,
    },
    {
      id: 'prod_goat_boneless',
      name: 'Tender Boneless Goat Meat',
      slug: 'boneless-mutton',
      description: '100% pure lean boneless goat meat. No bone, no excess fat. Ideal for kebabs, biryani, chili, or gourmet curries.',
      image: '/images/meat_goat_boneless.jpg',
      images: JSON.stringify(['/images/meat_goat_boneless.jpg']),
      category: 'Goat & Mutton',
      price_type: 'weight',
      price_per_kg: 950.00,
      weight_options: JSON.stringify([
        { value: 250, unit: 'g' },
        { value: 500, unit: 'g' },
        { value: 1, unit: 'kg' }
      ]),
      allow_custom_weight: true,
      variants: '[]',
      available: true,
      featured: true,
    },
    {
      id: 'prod_buff_bone',
      name: 'Fresh Buff Curry Cut (Bone-in)',
      slug: 'buff-curry-cut-bone',
      description: 'Lean and rich water buffalo meat cut with bone for authentic flavor and hearty meat broths and spicy curries.',
      image: '/images/meat_buff_bone.jpg',
      images: JSON.stringify(['/images/meat_buff_bone.jpg', '/images/meat_buff_keema.jpg']),
      category: 'Buff & Beef',
      price_type: 'weight',
      price_per_kg: 480.00,
      weight_options: JSON.stringify([
        { value: 500, unit: 'g' },
        { value: 1, unit: 'kg' },
        { value: 2, unit: 'kg' }
      ]),
      allow_custom_weight: true,
      variants: '[]',
      available: true,
      featured: true,
    },
    {
      id: 'prod_buff_keema',
      name: 'Fresh Minced Buff (Keema)',
      slug: 'fresh-buff-keema',
      description: 'Finely ground fresh buff meat with low fat. Exceptional for juicy momos, meat patties, kebabs, and keema noodles.',
      image: '/images/meat_buff_keema.jpg',
      images: JSON.stringify(['/images/meat_buff_keema.jpg']),
      category: 'Buff & Beef',
      price_type: 'weight',
      price_per_kg: 550.00,
      weight_options: JSON.stringify([
        { value: 250, unit: 'g' },
        { value: 500, unit: 'g' },
        { value: 1, unit: 'kg' }
      ]),
      allow_custom_weight: true,
      variants: '[]',
      available: true,
      featured: true,
    },
    {
      id: 'prod_ribeye_steak',
      name: 'Prime Ribeye Steak',
      slug: 'prime-ribeye-steak',
      description: 'Generously marbled premium ribeye cut for superior tenderness and rich savory flavor. Best pan-seared in butter and garlic.',
      image: '/images/meat_ribeye_steak.jpg',
      images: JSON.stringify(['/images/meat_ribeye_steak.jpg', '/images/meat_tbone_steak.jpg']),
      category: 'Prime Steaks & BBQ',
      price_type: 'weight',
      price_per_kg: 1200.00,
      weight_options: JSON.stringify([
        { value: 300, unit: 'g' },
        { value: 500, unit: 'g' },
        { value: 1, unit: 'kg' }
      ]),
      allow_custom_weight: true,
      variants: '[]',
      available: true,
      featured: true,
    },
    {
      id: 'prod_tbone_steak',
      name: 'Classic T-Bone Steak',
      slug: 'classic-tbone-steak',
      description: 'Iconic T-bone cut containing both strip and tenderloin on the bone. Deep umami flavor and tenderness in every bite.',
      image: '/images/meat_tbone_steak.jpg',
      images: JSON.stringify(['/images/meat_tbone_steak.jpg']),
      category: 'Prime Steaks & BBQ',
      price_type: 'weight',
      price_per_kg: 1100.00,
      weight_options: JSON.stringify([
        { value: 400, unit: 'g' },
        { value: 800, unit: 'g' },
        { value: 1, unit: 'kg' }
      ]),
      allow_custom_weight: true,
      variants: '[]',
      available: true,
      featured: true,
    },
    {
      id: 'prod_pork_belly',
      name: 'Fresh Pork Belly Slices',
      slug: 'pork-belly-slices',
      description: 'Succulent layers of tender meat and flavorful fat cut into clean slices. Ideal for crispy pork belly, Korean BBQ, and roasting.',
      image: '/images/meat_pork_belly.jpg',
      images: JSON.stringify(['/images/meat_pork_belly.jpg', '/images/meat_pork_chops.jpg']),
      category: 'Fresh Pork',
      price_type: 'weight',
      price_per_kg: 580.00,
      weight_options: JSON.stringify([
        { value: 250, unit: 'g' },
        { value: 500, unit: 'g' },
        { value: 1, unit: 'kg' }
      ]),
      allow_custom_weight: true,
      variants: '[]',
      available: true,
      featured: true,
    },
    {
      id: 'prod_pork_chops',
      name: 'Tender Bone-in Pork Chops',
      slug: 'tender-pork-chops',
      description: 'Juicy bone-in center cut pork chops. Outstanding when pan-seared with rosemary garlic butter or glazed on the grill.',
      image: '/images/meat_pork_chops.jpg',
      images: JSON.stringify(['/images/meat_pork_chops.jpg']),
      category: 'Fresh Pork',
      price_type: 'weight',
      price_per_kg: 620.00,
      weight_options: JSON.stringify([
        { value: 500, unit: 'g' },
        { value: 1, unit: 'kg' }
      ]),
      allow_custom_weight: true,
      variants: '[]',
      available: true,
      featured: true,
    },
    {
      id: 'prod_sausages',
      name: 'Artisan Smoked Sausages',
      slug: 'artisan-smoked-sausages',
      description: 'Slow-smoked handcrafted butcher sausages infused with crushed garlic and spices. Perfect for breakfast grills and barbecues.',
      image: '/images/meat_sausages.jpg',
      images: JSON.stringify(['/images/meat_sausages.jpg']),
      category: 'Sausages & Bacon',
      price_type: 'weight',
      price_per_kg: 650.00,
      weight_options: JSON.stringify([
        { value: 250, unit: 'g' },
        { value: 500, unit: 'g' },
        { value: 1, unit: 'kg' }
      ]),
      allow_custom_weight: true,
      variants: '[]',
      available: true,
      featured: true,
    },
    {
      id: 'prod_bacon',
      name: 'Crispy Smoked Bacon Strips',
      slug: 'smoked-crispy-bacon-strips',
      description: 'Hardwood smoked butcher bacon cut into classic strips. Fries up crisp with rich smoky aroma for burgers and breakfasts.',
      image: '/images/meat_bacon.jpg',
      images: JSON.stringify(['/images/meat_bacon.jpg']),
      category: 'Sausages & Bacon',
      price_type: 'weight',
      price_per_kg: 850.00,
      weight_options: JSON.stringify([
        { value: 250, unit: 'g' },
        { value: 500, unit: 'g' },
        { value: 1, unit: 'kg' }
      ]),
      allow_custom_weight: true,
      variants: '[]',
      available: true,
      featured: true,
    },
    {
      id: 'prod_chicken_wings',
      name: 'Fresh Chicken Wings',
      slug: 'fresh-chicken-wings',
      description: 'Plump and meaty fresh chicken wings. Ideal for crispy buffalo wings, barbecue platters, or deep-fried snacks.',
      image: '/images/meat_chicken_wings.jpg',
      images: JSON.stringify(['/images/meat_chicken_wings.jpg']),
      category: 'Fresh Chicken',
      price_type: 'weight',
      price_per_kg: 440.00,
      weight_options: JSON.stringify([
        { value: 500, unit: 'g' },
        { value: 1, unit: 'kg' }
      ]),
      allow_custom_weight: true,
      variants: '[]',
      available: true,
      featured: false,
    },
    {
      id: 'prod_salami',
      name: 'Premium Deli Salami',
      slug: 'premium-deli-salami',
      description: 'Naturally cured and finely seasoned butcher deli salami slices. Ready to eat for artisan sandwiches and charcuterie boards.',
      image: '/images/meat_salami.jpg',
      images: JSON.stringify(['/images/meat_salami.jpg']),
      category: 'Sausages & Bacon',
      price_type: 'weight',
      price_per_kg: 900.00,
      weight_options: JSON.stringify([
        { value: 200, unit: 'g' },
        { value: 400, unit: 'g' },
        { value: 1, unit: 'kg' }
      ]),
      allow_custom_weight: true,
      variants: '[]',
      available: true,
      featured: false,
    },
  ];

  await p.query('DELETE FROM products');
  await p.query('DELETE FROM categories');

  // Insert Categories
  for (const cat of categories) {
    await p.query(
      `INSERT INTO categories (id, name, slug, description, image, active) VALUES (?, ?, ?, ?, ?, ?)`,
      [cat.id, cat.name, cat.slug, cat.description, cat.image, cat.active]
    );
  }
  console.log(`[Reseed] Inserted ${categories.length} English meat categories.`);

  // Insert Products
  for (const prod of products) {
    await p.query(
      `INSERT INTO products (id, name, slug, description, image, images, category, price_type, price_per_kg, weight_options, allow_custom_weight, variants, available, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        prod.id,
        prod.name,
        prod.slug,
        prod.description,
        prod.image,
        prod.images,
        prod.category,
        prod.price_type,
        prod.price_per_kg,
        prod.weight_options,
        prod.allow_custom_weight,
        prod.variants,
        prod.available,
        prod.featured,
      ]
    );
  }
  console.log(`[Reseed] Inserted ${products.length} English meat products successfully!`);
  process.exit(0);
}

reseed().catch((err) => {
  console.error('[Reseed] Error:', err);
  process.exit(1);
});
