-- Update product images with high-quality grocery photos
-- All images are from Unsplash (free to use)

-- Fresh Fruits
UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%apple%';

UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1550259063-6fdb16d6ec7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%strawberry%' OR name ILIKE '%berries%';

UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%grape%' OR name ILIKE '%grapes%';

UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1587731556938-38755b4803a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%mango%' OR name ILIKE '%mangoes%';

UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1550259829-1f12ddfc4e66?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%pineapple%';

UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%banana%';

UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%orange%' OR name ILIKE '%tangerine%';

-- Fresh Vegetables
UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%tomato%';

UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%cucumber%' OR name ILIKE '%cucumbers%';

UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1570637575618-15acfbe20d5c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%bell pepper%' OR name ILIKE '%capsicum%';

UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1603048719536-1a7b7c76ae62?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%broccoli%' OR name ILIKE '%broccolis%';

UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%potato%' OR name ILIKE '%potatoes%';

UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%carrot%';

UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1570135464948-9d6d4e05a3c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%lettuce%' OR name ILIKE '%salad%';

-- Dairy & Eggs
UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1568408836783-00b386381b94?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%milk%' OR name ILIKE '%dairy%';

UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%egg%';

-- Bakery
UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%bread%' OR name ILIKE '%baguette%';

UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%croissant%' OR name ILIKE '%pastry%';

UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1571115177090-0b036ca95e9b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%muffin%' OR name ILIKE '%cupcake%';

UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%bagel%' OR name ILIKE '%donut%';

-- Meat & Poultry
UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%chicken%' OR name ILIKE '%poultry%';

-- Seafood
UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%salmon%' OR name ILIKE '%fish%';

-- Beverages
UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%juice%' OR name ILIKE '%beverage%';

-- Snacks
UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1550256103-f161568ec33d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%chips%' OR name ILIKE '%crisps%';

UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1581235850646-bb90d9f1aa2e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%chocolate%' OR name ILIKE '%candy%';

UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1572802419224-aa6e585133bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%cookies%' OR name ILIKE '%biscuits%';

UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1600002414336-4144cda31f9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%nuts%' OR name ILIKE '%trail mix%';

-- Dairy Alternatives
UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1610694955379-35dba5d7dbfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%almond milk%' OR name ILIKE '%soy milk%' OR name ILIKE '%oat milk%';

-- Frozen Foods
UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%frozen%' AND (name ILIKE '%vegetable%' OR name ILIKE '%fruit%');

-- Canned Goods
UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%canned%' AND (name ILIKE '%beans%' OR name ILIKE '%soup%' OR name ILIKE '%vegetable%');

-- Spices & Herbs
UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%spice%' OR name ILIKE '%herb%' OR name ILIKE '%seasoning%';

-- Default image for any remaining products
UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE image_url IS NULL OR image_url = '';
