-- ============================================================
-- RNR Webstore - Supabase PostgreSQL Schema
-- ============================================================
-- Jalankan SQL ini di Supabase SQL Editor (supabase.com)
-- Dashboard → SQL Editor → New Query → Paste & Run
-- ============================================================

-- 1. Tabel User
CREATE TABLE IF NOT EXISTS "user" (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    address VARCHAR(200),
    phone VARCHAR(20),
    first_name VARCHAR(80) DEFAULT ' ',
    last_name VARCHAR(80) DEFAULT ' ',
    role VARCHAR(50) DEFAULT 'User',
    date_added TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Shoe Category
CREATE TABLE IF NOT EXISTS shoe_category (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    date_added TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Shoe Detail
CREATE TABLE IF NOT EXISTS shoe_detail (
    shoe_detail_id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES shoe_category(category_id) ON DELETE CASCADE,
    shoe_name VARCHAR(100) NOT NULL,
    shoe_price DOUBLE PRECISION NOT NULL,
    shoe_size VARCHAR(10) NOT NULL,
    stock INTEGER NOT NULL,
    date_added TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Order
CREATE TABLE IF NOT EXISTS "order" (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    shoe_detail_id INTEGER NOT NULL REFERENCES shoe_detail(shoe_detail_id) ON DELETE CASCADE,
    order_date DATE NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    order_status VARCHAR(50) NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Payment
CREATE TABLE IF NOT EXISTS payment (
    payment_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES "order"(order_id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    payment_date DATE NOT NULL
);

-- 6. Tabel Cart
CREATE TABLE IF NOT EXISTS cart (
    id_cart SERIAL PRIMARY KEY,
    shoe_detail_id INTEGER NOT NULL REFERENCES shoe_detail(shoe_detail_id) ON DELETE CASCADE,
    id_user INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    date_added TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabel Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
    id_wishlist SERIAL PRIMARY KEY,
    shoe_detail_id INTEGER NOT NULL REFERENCES shoe_detail(shoe_detail_id) ON DELETE CASCADE,
    id_user INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    date_added TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabel User Interaction
CREATE TABLE IF NOT EXISTS user_interaction (
    interaction_id SERIAL PRIMARY KEY,
    id_user INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    shoe_detail_id INTEGER NOT NULL REFERENCES shoe_detail(shoe_detail_id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('view', 'wishlist', 'cart', 'order')),
    interaction_date TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabel Shoe Recommendation For Users
CREATE TABLE IF NOT EXISTS shoe_recomendation_for_users (
    id_shoe_recomendation SERIAL PRIMARY KEY,
    id_user INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    shoe_detail_id INTEGER NOT NULL REFERENCES shoe_detail(shoe_detail_id) ON DELETE CASCADE
);

-- ============================================================
-- INDEXES (untuk performa query)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_shoe_detail_category ON shoe_detail(category_id);
CREATE INDEX IF NOT EXISTS idx_order_user ON "order"(user_id);
CREATE INDEX IF NOT EXISTS idx_order_shoe ON "order"(shoe_detail_id);
CREATE INDEX IF NOT EXISTS idx_payment_order ON payment(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(id_user);
CREATE INDEX IF NOT EXISTS idx_cart_shoe ON cart(shoe_detail_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(id_user);
CREATE INDEX IF NOT EXISTS idx_wishlist_shoe ON wishlist(shoe_detail_id);
CREATE INDEX IF NOT EXISTS idx_interaction_user ON user_interaction(id_user);
CREATE INDEX IF NOT EXISTS idx_interaction_shoe ON user_interaction(shoe_detail_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_user ON shoe_recomendation_for_users(id_user);
CREATE INDEX IF NOT EXISTS idx_recommendation_shoe ON shoe_recomendation_for_users(shoe_detail_id);

-- ============================================================
-- AUTO-UPDATE last_updated (trigger)
-- ============================================================

CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-update last_updated
CREATE TRIGGER trg_user_updated BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION update_last_updated();

CREATE TRIGGER trg_shoe_category_updated BEFORE UPDATE ON shoe_category
    FOR EACH ROW EXECUTE FUNCTION update_last_updated();

CREATE TRIGGER trg_shoe_detail_updated BEFORE UPDATE ON shoe_detail
    FOR EACH ROW EXECUTE FUNCTION update_last_updated();

CREATE TRIGGER trg_order_updated BEFORE UPDATE ON "order"
    FOR EACH ROW EXECUTE FUNCTION update_last_updated();

CREATE TRIGGER trg_cart_updated BEFORE UPDATE ON cart
    FOR EACH ROW EXECUTE FUNCTION update_last_updated();

-- ============================================================
-- DONE! Database siap digunakan.
-- ============================================================
