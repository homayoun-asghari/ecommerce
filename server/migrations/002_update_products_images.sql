-- Update product images with high-quality grocery photos
-- All images are from Unsplash (free to use)

-- Fresh Fruits
UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE name ILIKE '%apple%';

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
WHERE name ILIKE '%chips%' OR name ILIKE '%snack%';

-- Default image for any remaining products
UPDATE products SET 
    image_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    updated_at = NOW()
WHERE image_url IS NULL OR image_url = '';
