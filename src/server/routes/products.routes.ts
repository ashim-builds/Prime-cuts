import { Router, Request, Response } from "express";
import { query } from "../db";
import { RowDataPacket } from "mysql2";

const router = Router();

// Map DB row to Product object
function mapProduct(p: RowDataPacket) {
  return {
    id: p.id,
    _id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    image: p.image || "/images/hero_prime_meat.jpg",
    images: typeof p.images === "string" ? JSON.parse(p.images) : (p.images || []),
    category: p.category,
    priceType: p.price_type,
    pricePerKg: p.price_per_kg ? parseFloat(p.price_per_kg) : undefined,
    weightOptions: typeof p.weight_options === "string" ? JSON.parse(p.weight_options) : (p.weight_options || []),
    allowCustomWeight: Boolean(p.allow_custom_weight),
    variants: typeof p.variants === "string" ? JSON.parse(p.variants) : (p.variants || []),
    isAvailable: Boolean(p.available),
    available: Boolean(p.available),
    isFeatured: Boolean(p.featured),
    featured: Boolean(p.featured),
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

// Get all products (with optional ?category= & ?q= & ?sort=)
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, q, sort } = req.query;

    let sql = "SELECT * FROM products WHERE 1=1";
    const params: any[] = [];

    if (category && typeof category === "string" && category.trim()) {
      sql += " AND category = ?";
      params.push(category.trim());
    }

    if (q && typeof q === "string" && q.trim()) {
      sql += " AND (name LIKE ? OR description LIKE ?)";
      const term = `%${q.trim()}%`;
      params.push(term, term);
    }

    if (sort === "price-asc") {
      sql += " ORDER BY price_per_kg ASC";
    } else if (sort === "price-desc") {
      sql += " ORDER BY price_per_kg DESC";
    } else if (sort === "name-asc") {
      sql += " ORDER BY name ASC";
    } else {
      sql += " ORDER BY featured DESC, created_at DESC";
    }

    const products = await query<RowDataPacket[]>(sql, params);
    res.json({ success: true, products: products.map(mapProduct) });
  } catch (error) {
    console.error("[Get Products Error]", error);
    res.status(500).json({ success: false, error: "Failed to fetch products." });
  }
});

// Get featured products
router.get("/featured", async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await query<RowDataPacket[]>(
      "SELECT * FROM products WHERE featured = TRUE AND available = TRUE ORDER BY created_at DESC LIMIT 8"
    );
    res.json({ success: true, products: products.map(mapProduct) });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch featured products." });
  }
});

// Get dynamic categories with available products count (only admin-created active categories)
router.get("/categories", async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await query<RowDataPacket[]>(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.image,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON LOWER(p.category) = LOWER(c.name) AND p.available = TRUE
      WHERE c.active = TRUE
      GROUP BY c.id, c.name, c.slug, c.description, c.image
      ORDER BY c.name ASC
    `);

    const categories = rows.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      image: r.image || "/images/hero_prime_meat.jpg",
      productCount: Number(r.product_count) || 0,
      product_count: Number(r.product_count) || 0,
    }));

    res.json({ success: true, categories });
  } catch (error) {
    console.error("[Get Categories Error]", error);
    res.status(500).json({ success: false, categories: [] });
  }
});

// Get product by slug
router.get("/:slug", async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const products = await query<RowDataPacket[]>("SELECT * FROM products WHERE slug = ?", [slug]);

    if (products.length === 0) {
      res.status(404).json({ success: false, error: "Product not found." });
      return;
    }

    res.json({ success: true, product: mapProduct(products[0]) });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch product." });
  }
});

export default router;
