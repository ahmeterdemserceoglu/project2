-- HDTicaret.com Sample Data
-- This file contains SQL statements to populate the database with sample data

-- Insert Categories
INSERT INTO categories (id, name, slug, description, image_url, parent_id, is_active)
VALUES
  ('d0fb2f7c-5f9a-4c28-9b3e-b7e94f9ee6a7', 'Elektronik', 'elektronik', 'Elektronik ürünler', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500', NULL, TRUE),
  ('c0cc56f3-5abb-4cd3-9c7f-29a362c21a21', 'Telefonlar', 'telefonlar', 'Akıllı telefonlar', 'https://images.unsplash.com/photo-1511707171634-5f897ff02ff9?w=500', 'd0fb2f7c-5f9a-4c28-9b3e-b7e94f9ee6a7', TRUE),
  ('75bf1f63-9c2c-4c00-9e84-58dfbe994dce', 'Bilgisayarlar', 'bilgisayarlar', 'Laptop ve masaüstü bilgisayarlar', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500', 'd0fb2f7c-5f9a-4c28-9b3e-b7e94f9ee6a7', TRUE),
  ('45f57723-8555-4b3e-a0b8-20e210205b69', 'Giyim', 'giyim', 'Giyim ürünleri', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500', NULL, TRUE),
  ('3e7b8189-4d40-4843-9db0-9e89376e1f6d', 'Erkek', 'erkek', 'Erkek giyim', 'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=500', '45f57723-8555-4b3e-a0b8-20e210205b69', TRUE),
  ('c6347d50-84d5-4e21-a1e8-89c68d5aaa81', 'Kadın', 'kadin', 'Kadın giyim', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500', '45f57723-8555-4b3e-a0b8-20e210205b69', TRUE),
  ('b6a02c8f-2040-4f9e-a7fb-53a5d9c645b8', 'Ev & Yaşam', 'ev-yasam', 'Ev ve yaşam ürünleri', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500', NULL, TRUE),
  ('ed3739ec-a3fd-49f9-a25a-c62b63ff7ab1', 'Kozmetik', 'kozmetik', 'Kozmetik ürünleri', 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500', NULL, TRUE),
  ('f2c2eb9c-3a25-4261-9b65-c0408bb579e0', 'Spor', 'spor', 'Spor ürünleri', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500', NULL, TRUE);

-- Insert Products
INSERT INTO products (id, name, slug, sku, description, base_price, sale_price, stock_quantity, category_id, is_featured, is_active, primary_image_url)
VALUES
  ('1f02d097-6685-4265-abd0-2ae3c05f487a', 'iPhone 13 Pro Max', 'iphone-13-pro-max', 'APPL-13PM-01', 'Apple iPhone 13 Pro Max, A15 Bionic çip, Pro kamera sistemi, 6.7 inç ekran, 128GB depolama.', 29999.90, 27999.90, 45, 'c0cc56f3-5abb-4cd3-9c7f-29a362c21a21', TRUE, TRUE, 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500'),
  
  ('a42a4df5-8dee-49f3-9d1c-87ac1a2537d4', 'Samsung Galaxy S21', 'samsung-galaxy-s21', 'SMSG-S21-01', 'Samsung Galaxy S21, Exynos 2100 işlemci, 8GB RAM, 128GB depolama, 6.2 inç Dynamic AMOLED ekran.', 16999.90, NULL, 32, 'c0cc56f3-5abb-4cd3-9c7f-29a362c21a21', TRUE, TRUE, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500'),
  
  ('7c61e4c2-d2a3-4e9c-83bd-a9ea8f3ec4c0', 'MacBook Pro 16"', 'macbook-pro-16', 'APPL-MBP16-01', 'Apple MacBook Pro 16 inç, M1 Pro çip, 16GB RAM, 512GB SSD, 16 inç Liquid Retina XDR ekran.', 39999.90, 38999.90, 15, '75bf1f63-9c2c-4c00-9e84-58dfbe994dce', TRUE, TRUE, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'),
  
  ('6c0f61e4-1180-45e2-8c3a-80c3d4c3b2d3', 'HP Pavilion Gaming', 'hp-pavilion-gaming', 'HP-PAV-G15-01', 'HP Pavilion Gaming Laptop, Intel Core i7, 16GB RAM, 512GB SSD, NVIDIA GeForce RTX 3050.', 18999.90, 17499.90, 8, '75bf1f63-9c2c-4c00-9e84-58dfbe994dce', FALSE, TRUE, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500'),
  
  ('d85c1c1e-a3f9-427a-ac0e-6b4f14d71106', 'Erkek Deri Ceket', 'erkek-deri-ceket', 'GYM-EDC-01', 'Klasik siyah deri ceket, %100 hakiki deri, fermuarlı cepler, şık tasarım.', 1299.90, NULL, 12, '3e7b8189-4d40-4843-9db0-9e89376e1f6d', FALSE, TRUE, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'),
  
  ('c6c3cd4e-3e5c-4b3f-91e2-8aa43ffa05d2', 'Erkek Spor Ayakkabı', 'erkek-spor-ayakkabi', 'GYM-ESA-01', 'Hafif, nefes alabilen, konforlu yürüyüş ayakkabısı, kaydırmaz taban.', 899.90, 799.90, 110, '3e7b8189-4d40-4843-9db0-9e89376e1f6d', TRUE, TRUE, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'),
  
  ('98f2232b-64ff-4edd-842d-1d3c8d351a3c', 'Kadın Deri Çanta', 'kadin-deri-canta', 'GYM-KDC-01', 'Zarif deri çanta, iç cepler, ayarlanabilir askı, geniş iç hacim.', 1299.90, NULL, 28, 'c6347d50-84d5-4e21-a1e8-89c68d5aaa81', FALSE, TRUE, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500'),
  
  ('4f7a7852-8ee1-46e5-a290-ad85bb2c5814', 'Kahve Makinesi', 'kahve-makinesi', 'EV-KM-01', 'Otomatik kahve makinesi, 15 bar basınç, öğütücü dahil, LCD ekran.', 3499.90, 3299.90, 15, 'b6a02c8f-2040-4f9e-a7fb-53a5d9c645b8', FALSE, TRUE, 'https://images.unsplash.com/photo-1570286424717-86d8a0082d60?w=500'),
  
  ('e9a3f6e6-c134-4b43-bcb3-5fc7e10908e2', 'Akıllı TV 55"', 'akilli-tv-55', 'ELK-TV55-01', '55" 4K Ultra HD Smart TV, HDR, Android TV, Wi-Fi, Bluetooth.', 7999.90, 7599.90, 0, 'd0fb2f7c-5f9a-4c28-9b3e-b7e94f9ee6a7', TRUE, TRUE, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500'),
  
  ('2e41e12c-93e9-4c04-9a3f-49b61a3a7e1e', 'Bluetooth Kulaklık', 'bluetooth-kulaklik', 'ELK-BK-01', 'Kablosuz Bluetooth kulaklık, gürültü önleme, uzun pil ömrü, konforlu tasarım.', 299.90, 249.90, 72, 'd0fb2f7c-5f9a-4c28-9b3e-b7e94f9ee6a7', FALSE, TRUE, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500'),
  
  ('1d2e8f9a-3b4c-5d6e-7f8g-9h0i1j2k3l4m', 'El Blender Seti', 'el-blender-seti', 'EV-EBS-01', 'Güçlü motor, çoklu başlık, kolay temizleme, paslanmaz çelik malzeme.', 599.90, NULL, 0, 'b6a02c8f-2040-4f9e-a7fb-53a5d9c645b8', FALSE, TRUE, 'https://images.unsplash.com/photo-1578020190125-f4a82bf8b688?w=500');

-- Insert Product Images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
VALUES
  ('1f02d097-6685-4265-abd0-2ae3c05f487a', 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500', 'iPhone 13 Pro Max', TRUE, 0),
  ('1f02d097-6685-4265-abd0-2ae3c05f487a', 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=500', 'iPhone 13 Pro Max side view', FALSE, 1),
  ('1f02d097-6685-4265-abd0-2ae3c05f487a', 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500', 'iPhone 13 Pro Max back view', FALSE, 2),
  
  ('a42a4df5-8dee-49f3-9d1c-87ac1a2537d4', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500', 'Samsung Galaxy S21', TRUE, 0),
  ('a42a4df5-8dee-49f3-9d1c-87ac1a2537d4', 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=500', 'Samsung Galaxy S21 back view', FALSE, 1),
  
  ('7c61e4c2-d2a3-4e9c-83bd-a9ea8f3ec4c0', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', 'MacBook Pro 16"', TRUE, 0),
  ('7c61e4c2-d2a3-4e9c-83bd-a9ea8f3ec4c0', 'https://images.unsplash.com/photo-1569770218135-bea267ed7e84?w=500', 'MacBook Pro side view', FALSE, 1);

-- Insert Product Attributes
INSERT INTO product_attributes (product_id, attribute_name, attribute_value)
VALUES
  ('1f02d097-6685-4265-abd0-2ae3c05f487a', 'Color', 'Graphite'),
  ('1f02d097-6685-4265-abd0-2ae3c05f487a', 'Color', 'Gold'),
  ('1f02d097-6685-4265-abd0-2ae3c05f487a', 'Color', 'Silver'),
  ('1f02d097-6685-4265-abd0-2ae3c05f487a', 'Storage', '128GB'),
  ('1f02d097-6685-4265-abd0-2ae3c05f487a', 'Storage', '256GB'),
  ('1f02d097-6685-4265-abd0-2ae3c05f487a', 'Storage', '512GB'),
  ('1f02d097-6685-4265-abd0-2ae3c05f487a', 'Storage', '1TB'),
  
  ('a42a4df5-8dee-49f3-9d1c-87ac1a2537d4', 'Color', 'Phantom Black'),
  ('a42a4df5-8dee-49f3-9d1c-87ac1a2537d4', 'Color', 'Phantom Gray'),
  ('a42a4df5-8dee-49f3-9d1c-87ac1a2537d4', 'Color', 'Phantom White'),
  ('a42a4df5-8dee-49f3-9d1c-87ac1a2537d4', 'Storage', '128GB'),
  ('a42a4df5-8dee-49f3-9d1c-87ac1a2537d4', 'Storage', '256GB'),
  
  ('c6c3cd4e-3e5c-4b3f-91e2-8aa43ffa05d2', 'Size', '40'),
  ('c6c3cd4e-3e5c-4b3f-91e2-8aa43ffa05d2', 'Size', '41'),
  ('c6c3cd4e-3e5c-4b3f-91e2-8aa43ffa05d2', 'Size', '42'),
  ('c6c3cd4e-3e5c-4b3f-91e2-8aa43ffa05d2', 'Size', '43'),
  ('c6c3cd4e-3e5c-4b3f-91e2-8aa43ffa05d2', 'Size', '44'),
  ('c6c3cd4e-3e5c-4b3f-91e2-8aa43ffa05d2', 'Color', 'Black'),
  ('c6c3cd4e-3e5c-4b3f-91e2-8aa43ffa05d2', 'Color', 'White'),
  ('c6c3cd4e-3e5c-4b3f-91e2-8aa43ffa05d2', 'Color', 'Red');

-- Insert Discounts
INSERT INTO discounts (id, code, description, discount_type, discount_value, minimum_purchase_amount, starts_at, expires_at, is_active)
VALUES
  ('1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', 'HOSGELDIN10', 'İlk siparişe özel %10 indirim', 'percentage', 10, 100, NOW(), NOW() + INTERVAL '30 days', TRUE),
  ('2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', 'YENISEZON25', 'Yeni sezon ürünlerinde %25 indirim', 'percentage', 25, 250, NOW(), NOW() + INTERVAL '15 days', TRUE),
  ('3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r', 'KARGO0', 'Ücretsiz kargo', 'fixed_amount', 29.9, 300, NOW(), NOW() + INTERVAL '7 days', TRUE);

-- Insert Settings
INSERT INTO settings (id, value)
VALUES
  ('site_info', '{"site_name": "HDTicaret.com", "site_description": "Premium alışveriş deneyimi", "contact_email": "info@hdticaret.com", "contact_phone": "+90 212 123 4567", "address": "Levent, Istanbul, Turkey"}'),
  ('payment_methods', '{"methods": ["credit_card", "bank_transfer", "cash_on_delivery"], "default": "credit_card"}'),
  ('shipping_methods', '{"methods": [{"id": "standard", "name": "Standart Kargo", "price": 29.9, "delivery_time": "2-4 gün"}, {"id": "express", "name": "Ekspres Kargo", "price": 49.9, "delivery_time": "1-2 gün"}], "free_shipping_threshold": 500}'),
  ('tax_rates', '{"default_rate": 18, "special_rates": [{"category": "food", "rate": 8}, {"category": "books", "rate": 8}]}');

-- Insert sample profiles (would be linked to real auth.users in production)
-- In a real implementation, users would be created through Supabase Auth
-- These are just here for testing/demonstration purposes
INSERT INTO profiles (id, first_name, last_name, phone, email, is_admin)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Admin', 'User', '+90 555 123 4567', 'admin@hdticaret.com', TRUE),
  ('00000000-0000-0000-0000-000000000002', 'Test', 'Customer', '+90 555 765 4321', 'test@example.com', FALSE),
  ('00000000-0000-0000-0000-000000000003', 'Ahmet', 'Yılmaz', '+90 555 111 2222', 'ahmet@example.com', FALSE),
  ('00000000-0000-0000-0000-000000000004', 'Ayşe', 'Demir', '+90 555 333 4444', 'ayse@example.com', FALSE);

-- Insert sample addresses
INSERT INTO addresses (id, user_id, address_line1, city, postal_code, country, is_default, address_type)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Örnek Mahallesi, Atatürk Cad. No: 123', 'İstanbul', '34000', 'Türkiye', TRUE, 'both'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Bahçelievler Mah. İnönü Cad. No: 45', 'Ankara', '06000', 'Türkiye', TRUE, 'shipping'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Kurtuluş Mah. Esen Sok. No: 78', 'Ankara', '06100', 'Türkiye', FALSE, 'billing'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Karşıyaka Mah. Deniz Cad. No: 56', 'İzmir', '35000', 'Türkiye', TRUE, 'both');

-- Insert sample orders and order items
INSERT INTO orders (id, user_id, order_number, status, total_amount, shipping_amount, tax_amount, discount_amount, shipping_address_id, billing_address_id, payment_method, payment_status, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'HD-1001', 'delivered', 38000.00, 0.00, 5800.00, 0.00, '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'credit_card', 'paid', NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'HD-1002', 'shipped', 1349.80, 29.90, 205.90, 0.00, '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'bank_transfer', 'paid', NOW() - INTERVAL '7 days'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'HD-1003', 'processing', 28249.80, 0.00, 4305.84, 2799.99, '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'credit_card', 'paid', NOW() - INTERVAL '2 days');

INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, attributes)
VALUES
  ('00000000-0000-0000-0000-000000000001', '7c61e4c2-d2a3-4e9c-83bd-a9ea8f3ec4c0', 'MacBook Pro 16"', 1, 38000.00, '{"color": "Silver", "storage": "512GB"}'),
  ('00000000-0000-0000-0000-000000000002', 'c6c3cd4e-3e5c-4b3f-91e2-8aa43ffa05d2', 'Erkek Spor Ayakkabı', 1, 899.90, '{"color": "Black", "size": "42"}'),
  ('00000000-0000-0000-0000-000000000002', '2e41e12c-93e9-4c04-9a3f-49b61a3a7e1e', 'Bluetooth Kulaklık', 1, 249.90, '{"color": "Black"}'),
  ('00000000-0000-0000-0000-000000000003', '1f02d097-6685-4265-abd0-2ae3c05f487a', 'iPhone 13 Pro Max', 1, 27999.90, '{"color": "Graphite", "storage": "256GB"}'),
  ('00000000-0000-0000-0000-000000000003', '2e41e12c-93e9-4c04-9a3f-49b61a3a7e1e', 'Bluetooth Kulaklık', 1, 249.90, '{"color": "White"}');

INSERT INTO order_history (order_id, status, comment, created_by, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'pending', 'Sipariş alındı', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0000-000000000001', 'processing', 'Ödeme onaylandı', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '29 days 12 hours'),
  ('00000000-0000-0000-0000-000000000001', 'shipped', 'Kargoya verildi', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '28 days'),
  ('00000000-0000-0000-0000-000000000001', 'delivered', 'Teslim edildi', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '26 days'),
  
  ('00000000-0000-0000-0000-000000000002', 'pending', 'Sipariş alındı', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '7 days'),
  ('00000000-0000-0000-0000-000000000002', 'processing', 'Ödeme onaylandı', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '6 days 18 hours'),
  ('00000000-0000-0000-0000-000000000002', 'shipped', 'Kargoya verildi', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '6 days 2 hours'),
  
  ('00000000-0000-0000-0000-000000000003', 'pending', 'Sipariş alındı', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000003', 'processing', 'Ödeme onaylandı', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day 12 hours');

-- Insert product reviews
INSERT INTO product_reviews (product_id, user_id, rating, comment, is_verified, is_approved, created_at)
VALUES
  ('1f02d097-6685-4265-abd0-2ae3c05f487a', '00000000-0000-0000-0000-000000000003', 5, 'Harika bir telefon, kamera kalitesi olağanüstü!', TRUE, TRUE, NOW() - INTERVAL '15 days'),
  ('1f02d097-6685-4265-abd0-2ae3c05f487a', '00000000-0000-0000-0000-000000000004', 4, 'İyi bir telefon ama fiyatı biraz yüksek.', TRUE, TRUE, NOW() - INTERVAL '10 days'),
  ('7c61e4c2-d2a3-4e9c-83bd-a9ea8f3ec4c0', '00000000-0000-0000-0000-000000000003', 5, 'MacBook Pro performansıyla etkileyici, pil ömrü uzun.', TRUE, TRUE, NOW() - INTERVAL '20 days'),
  ('c6c3cd4e-3e5c-4b3f-91e2-8aa43ffa05d2', '00000000-0000-0000-0000-000000000004', 4, 'Rahat ve şık ayakkabılar, tavsiye ederim.', TRUE, TRUE, NOW() - INTERVAL '5 days'); 