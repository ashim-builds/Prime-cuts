-- Crispy Chips MySQL Initialization Schema

CREATE DATABASE IF NOT EXISTS crispychips;
USE crispychips;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  phone VARCHAR(50),
  password_hash VARCHAR(255),
  google_id VARCHAR(100),
  cart JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image VARCHAR(500),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image VARCHAR(500),
  images JSON,
  category VARCHAR(100) NOT NULL,
  price_type ENUM('weight', 'variant') DEFAULT 'weight',
  price_per_kg DECIMAL(10,2),
  weight_options JSON,
  allow_custom_weight BOOLEAN DEFAULT TRUE,
  variants JSON,
  available BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  user_id VARCHAR(36),
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(100),
  items JSON NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_charge DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  order_type ENUM('pickup', 'delivery') NOT NULL,
  payment_method ENUM('cod', 'qr') DEFAULT 'cod',
  payment_status ENUM('pending', 'paid') DEFAULT 'pending',
  address TEXT,
  notes TEXT,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  recipient_type ENUM('USER', 'ADMIN') NOT NULL,
  recipient_id VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  order_id VARCHAR(36),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- 6. Push Subscriptions Table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(50),
  type ENUM('customer', 'admin') NOT NULL,
  endpoint VARCHAR(750) NOT NULL UNIQUE,
  p256dh VARCHAR(255) NOT NULL,
  auth VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed Categories
INSERT IGNORE INTO categories (id, name, slug, description, image, active) VALUES
('cat_1', 'Chips', 'chips', 'Crispy, crunchy potato & snack chips made fresh daily.', '/images/snack_bowl.jpg', TRUE),
('cat_2', 'Chatpat', 'chatpat', 'Spicy and tangy authentic Nepalese street chatpat.', '/images/snack_bowl.jpg', TRUE),
('cat_3', 'Mixture', 'mixture', 'Traditional savoury snacks with mixed crunchy textures.', '/images/snack_bowl.jpg', TRUE),
('cat_4', 'Papad', 'papad', 'Crispy thin papad seasoned with local spices.', '/images/snack_bowl.jpg', TRUE),
('cat_5', 'Other', 'other', 'Special local treats and spicy snack creations.', '/images/snack_bowl.jpg', TRUE);

-- Seed Products
INSERT IGNORE INTO products (id, name, slug, description, image, images, category, price_type, price_per_kg, weight_options, allow_custom_weight, variants, available, featured) VALUES
('prod_1', 'Classic Aloo Chips', 'classic-aloo-chips', 'Thinly sliced golden potato chips lightly seasoned with Himalayan pink salt.', '/images/snack_bowl.jpg', '[]', 'Chips', 'weight', 500.00, '[{"value":250,"unit":"g"},{"value":500,"unit":"g"},{"value":750,"unit":"g"},{"value":1,"unit":"kg"}]', TRUE, '[]', TRUE, TRUE),
('prod_2', 'Spicy Masala Chips', 'spicy-masala-chips', 'Extra crunchy homemade chips dusted with authentic hot chilli & secret masala.', '/images/snack_bowl.jpg', '[]', 'Chips', 'weight', 550.00, '[{"value":250,"unit":"g"},{"value":500,"unit":"g"},{"value":750,"unit":"g"},{"value":1,"unit":"kg"}]', TRUE, '[]', TRUE, TRUE),
('prod_3', 'Special Kathmandu Chatpat', 'special-kathmandu-chatpat', 'Authentic spicy Nepalese street chatpat with puffed rice, fresh onions, chilli and tangy lemon.', '/images/snack_bowl.jpg', '[]', 'Chatpat', 'variant', NULL, '[]', FALSE, '[{"name":"Regular Bowl","price":60},{"name":"Large Bowl","price":100},{"name":"Family Pack","price":180}]', TRUE, TRUE),
('prod_4', 'Spicy Mixture Namkeen', 'spicy-mixture-namkeen', 'Crunchy sev, peanuts, lentils and spices blended for an irresistible tea-time companion.', '/images/snack_bowl.jpg', '[]', 'Mixture', 'weight', 480.00, '[{"value":250,"unit":"g"},{"value":500,"unit":"g"},{"value":1,"unit":"kg"}]', TRUE, '[]', TRUE, TRUE),
('prod_5', 'Crispy Masala Papad', 'crispy-masala-papad', 'Thin crunchy papad with fresh seasoning, great for starters and munching.', '/images/snack_bowl.jpg', '[]', 'Papad', 'weight', 400.00, '[{"value":250,"unit":"g"},{"value":500,"unit":"g"},{"value":1,"unit":"kg"}]', TRUE, '[]', TRUE, FALSE);
