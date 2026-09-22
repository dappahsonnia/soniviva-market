/* =========================================
   SONIVIVA — Product Data & Rendering
   Vendors · Perishable Pricing · Provisions · Hampers
   ========================================= */

// ─── Category gradients ───
const categoryGradients = {
  'Grains & Cereals':    'linear-gradient(135deg, #F5E6CA, #DEB887)',
  'Fresh Produce':       'linear-gradient(135deg, #C8E6C9, #81C784)',
  'Spices & Seasonings': 'linear-gradient(135deg, #FFCCBC, #FF8A65)',
  'Dairy & Eggs':        'linear-gradient(135deg, #E3F2FD, #90CAF9)',
  'Oils & Condiments':   'linear-gradient(135deg, #FFF9C4, #FFF176)',
  'Beverages':           'linear-gradient(135deg, #F3E5F5, #CE93D8)',
  'Provisions':          'linear-gradient(135deg, #FFE0B2, #FFB74D)',
  'Hampers':             'linear-gradient(135deg, #FFCDD2, #EF9A9A)'
};

const categoryImages = {
  'Grains & Cereals':    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&auto=format&q=80',
  'Fresh Produce':       'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop&auto=format&q=80',
  'Spices & Seasonings': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop&auto=format&q=80',
  'Dairy & Eggs':        'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format&q=80',
  'Oils & Condiments':   'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop&auto=format&q=80',
  'Beverages':           'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop&auto=format&q=80',
  'Provisions':          'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop&auto=format&q=80',
  'Hampers':             'https://images.unsplash.com/photo-1513558161293-cdaf765ed514?w=400&h=300&fit=crop&auto=format&q=80'
};

// ─── Vendors ───
const vendors = {
  soniviva:     { name: 'SONIVIVA',         badge: '⭐', color: '#1B5E20' },
  farmDirect:   { name: 'Farm Direct GH',   badge: '🌱', color: '#2E7D32' },
  goldenHarvest:{ name: 'Golden Harvest',    badge: '🌾', color: '#B8860B' },
  spiceMasters: { name: 'Spice Masters',     badge: '🌶️', color: '#E65100' },
  dairyBest:    { name: 'Dairy Best',        badge: '🥛', color: '#1565C0' },
  goldCoastOils:{ name: 'Gold Coast Oils',   badge: '🫒', color: '#827717' },
  tasteGhana:   { name: 'Taste Ghana',       badge: '🍵', color: '#6A1B9A' },
  quickMart:    { name: 'Quick Mart',        badge: '🏪', color: '#D84315' }
};

// ─── Products ───
const products = [
  // ═══ GRAINS & CEREALS ═══
  { id: 1, name: 'Premium Basmati Rice', price: 89.99, category: 'Grains & Cereals', unit: '5kg bag', emoji: '🍚', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&auto=format&q=80', description: 'Extra-long grain basmati rice, aged for superior aroma and fluffy texture. Perfect for jollof, fried rice, and everyday meals.', featured: true, rating: 4.8, vendor: 'goldenHarvest' },
  { id: 2, name: 'Local Brown Rice', price: 35.00, category: 'Grains & Cereals', unit: '2kg bag', emoji: '🌾', image: 'https://images.unsplash.com/photo-1536304993881-460e4c8bc7c3?w=400&h=300&fit=crop&auto=format&q=80', description: 'Nutritious whole-grain brown rice grown locally in the Volta Region. Rich in fiber and natural goodness.', featured: false, rating: 4.5, vendor: 'farmDirect' },
  { id: 3, name: 'Jasmine Rice', price: 79.99, category: 'Grains & Cereals', unit: '5kg bag', emoji: '🍚', image: 'https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?w=400&h=300&fit=crop&auto=format&q=80', description: 'Fragrant Thai jasmine rice with a soft, slightly sticky texture. Ideal for Asian-inspired dishes.', featured: false, rating: 4.6, vendor: 'goldenHarvest' },
  { id: 4, name: 'Corn Flour (Ablemamu)', price: 18.50, category: 'Grains & Cereals', unit: '1kg pack', emoji: '🌽', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&auto=format&q=80', description: 'Finely milled corn flour for making banku, kenkey, and traditional Ghanaian staples.', featured: false, rating: 4.3, vendor: 'goldenHarvest' },
  { id: 5, name: 'Wheat Flour', price: 28.00, category: 'Grains & Cereals', unit: '2kg pack', emoji: '🌾', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&auto=format&q=80', description: 'All-purpose wheat flour for baking bread, pastries, and frying. High quality and finely sifted.', featured: false, rating: 4.4, vendor: 'goldenHarvest' },
  { id: 6, name: 'Rolled Oats', price: 22.00, category: 'Grains & Cereals', unit: '500g pack', emoji: '🥣', image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=300&fit=crop&auto=format&q=80', description: 'Whole grain rolled oats for a healthy breakfast. Quick-cooking and packed with fiber.', featured: true, rating: 4.7, vendor: 'soniviva' },

  // ═══ FRESH PRODUCE (Perishable — price per kg/unit) ═══
  { id: 7, name: 'Fresh Tomatoes', price: 15.00, category: 'Fresh Produce', unit: 'per kg', emoji: '🍅', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=300&fit=crop&auto=format&q=80', description: 'Vine-ripened, juicy tomatoes sourced from local farms. Essential for stews, soups, and sauces.', featured: true, rating: 4.6, vendor: 'farmDirect', isPerishable: true, pricePerUnit: 15.00, unitLabel: 'kg', unitOptions: [{ value: 0.5, label: '500g' }, { value: 1, label: '1kg' }, { value: 2, label: '2kg' }, { value: 3, label: '3kg' }, { value: 5, label: '5kg' }] },
  { id: 8, name: 'Garden Eggs', price: 12.00, category: 'Fresh Produce', unit: 'per kg', emoji: '🍆', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=300&fit=crop&auto=format&q=80', description: 'Fresh garden eggs (African eggplant), perfect for garden egg stew or as a side dish with groundnut paste.', featured: false, rating: 4.4, vendor: 'farmDirect', isPerishable: true, pricePerUnit: 12.00, unitLabel: 'kg', unitOptions: [{ value: 0.5, label: '500g' }, { value: 1, label: '1kg' }, { value: 2, label: '2kg' }, { value: 3, label: '3kg' }] },
  { id: 9, name: 'Fresh Pepper Mix', price: 18.00, category: 'Fresh Produce', unit: 'per kg', emoji: '🌶️', image: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400&h=300&fit=crop&auto=format&q=80', description: 'A mix of scotch bonnet, shito peppers, and green chili. Pre-washed and ready to blend.', featured: false, rating: 4.5, vendor: 'farmDirect', isPerishable: true, pricePerUnit: 18.00, unitLabel: 'kg', unitOptions: [{ value: 0.25, label: '250g' }, { value: 0.5, label: '500g' }, { value: 1, label: '1kg' }, { value: 2, label: '2kg' }] },
  { id: 10, name: 'Ripe Plantain', price: 5.00, category: 'Fresh Produce', unit: 'per finger', emoji: '🍌', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop&auto=format&q=80', description: 'Sweet, ripe plantains perfect for frying (kelewele), roasting, or making tatale.', featured: true, rating: 4.8, vendor: 'farmDirect', isPerishable: true, pricePerUnit: 5.00, unitLabel: 'finger', unitOptions: [{ value: 3, label: '3 fingers' }, { value: 5, label: '5 fingers' }, { value: 7, label: '7 fingers' }, { value: 10, label: '10 fingers' }, { value: 15, label: '15 fingers' }] },
  { id: 11, name: 'Sweet Potatoes', price: 14.00, category: 'Fresh Produce', unit: 'per kg', emoji: '🍠', image: 'https://images.unsplash.com/photo-1596097635121-14b63a7e0c75?w=400&h=300&fit=crop&auto=format&q=80', description: 'Locally grown sweet potatoes with a creamy orange flesh. Great boiled, fried, or baked.', featured: false, rating: 4.3, vendor: 'farmDirect', isPerishable: true, pricePerUnit: 14.00, unitLabel: 'kg', unitOptions: [{ value: 0.5, label: '500g' }, { value: 1, label: '1kg' }, { value: 2, label: '2kg' }, { value: 3, label: '3kg' }, { value: 5, label: '5kg' }] },
  { id: 12, name: 'Fresh Onions', price: 18.00, category: 'Fresh Produce', unit: 'per kg', emoji: '🧅', image: 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=400&h=300&fit=crop&auto=format&q=80', description: 'Premium red onions, firm and full of flavor. A kitchen essential for every Ghanaian household.', featured: false, rating: 4.5, vendor: 'farmDirect', isPerishable: true, pricePerUnit: 18.00, unitLabel: 'kg', unitOptions: [{ value: 0.5, label: '500g' }, { value: 1, label: '1kg' }, { value: 2, label: '2kg' }, { value: 5, label: '5kg' }] },

  // ═══ SPICES & SEASONINGS ═══
  { id: 13, name: 'Dried Shrimp', price: 45.00, category: 'Spices & Seasonings', unit: '200g pack', emoji: '🦐', image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop&auto=format&q=80', description: 'Sun-dried shrimp for adding rich umami flavor to soups, stews, and ground pepper mixes.', featured: true, rating: 4.9, vendor: 'spiceMasters' },
  { id: 14, name: 'Ground Crayfish', price: 30.00, category: 'Spices & Seasonings', unit: '150g pack', emoji: '🦀', image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&h=300&fit=crop&auto=format&q=80', description: 'Finely ground crayfish, a staple seasoning for light soup, groundnut soup, and palm nut soup.', featured: false, rating: 4.7, vendor: 'spiceMasters' },
  { id: 15, name: 'Dawadawa', price: 15.00, category: 'Spices & Seasonings', unit: '100g pack', emoji: '🫘', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop&auto=format&q=80', description: 'Fermented African locust beans for intense, savory depth in traditional soups and stews.', featured: false, rating: 4.4, vendor: 'spiceMasters' },
  { id: 16, name: 'Curry Powder', price: 12.00, category: 'Spices & Seasonings', unit: '100g tin', emoji: '🟡', image: 'https://images.unsplash.com/photo-1607672632458-9eb56696346f?w=400&h=300&fit=crop&auto=format&q=80', description: 'Aromatic curry powder blend for seasoning rice, chicken, and curry dishes.', featured: false, rating: 4.3, vendor: 'spiceMasters' },
  { id: 17, name: 'Ground Ginger', price: 10.00, category: 'Spices & Seasonings', unit: '100g pack', emoji: '🫚', image: 'https://images.unsplash.com/photo-1615485500834-bc10c6da38e2?w=400&h=300&fit=crop&auto=format&q=80', description: 'Dried and finely ground ginger root for cooking, teas, and traditional remedies.', featured: false, rating: 4.5, vendor: 'spiceMasters' },
  { id: 18, name: 'SONIVIVA Spice Blend', price: 22.00, category: 'Spices & Seasonings', unit: '150g jar', emoji: '✨', image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&h=300&fit=crop&auto=format&q=80', description: 'Our signature spice blend — a curated mix of paprika, garlic, onion, thyme, and secret spices. Elevates any dish.', featured: true, rating: 4.9, vendor: 'soniviva' },

  // ═══ DAIRY & EGGS ═══
  { id: 19, name: 'Fresh Milk', price: 24.00, category: 'Dairy & Eggs', unit: '1 litre', emoji: '🥛', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop&auto=format&q=80', description: 'Fresh pasteurized whole milk, locally sourced from accredited dairy farms.', featured: false, rating: 4.5, vendor: 'dairyBest' },
  { id: 20, name: 'Farm Eggs (Crate)', price: 55.00, category: 'Dairy & Eggs', unit: 'Crate of 30', emoji: '🥚', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop&auto=format&q=80', description: 'Farm-fresh eggs from free-range hens. Rich yolks and superior taste for all your cooking needs.', featured: true, rating: 4.8, vendor: 'dairyBest' },
  { id: 21, name: 'Butter', price: 32.00, category: 'Dairy & Eggs', unit: '250g block', emoji: '🧈', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=300&fit=crop&auto=format&q=80', description: 'Premium unsalted butter for baking, cooking, and spreading. Smooth and creamy.', featured: false, rating: 4.6, vendor: 'dairyBest' },
  { id: 22, name: 'Natural Yoghurt', price: 18.00, category: 'Dairy & Eggs', unit: '500ml tub', emoji: '🥛', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&auto=format&q=80', description: 'Thick, creamy natural yoghurt with live cultures. No added sugar — just pure goodness.', featured: false, rating: 4.4, vendor: 'dairyBest' },

  // ═══ OILS & CONDIMENTS ═══
  { id: 23, name: 'Palm Oil (Zomi)', price: 35.00, category: 'Oils & Condiments', unit: '1 litre bottle', emoji: '🟠', image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=400&h=300&fit=crop&auto=format&q=80', description: 'Pure, unrefined red palm oil for authentic Ghanaian palm nut soup, stews, and frying.', featured: true, rating: 4.7, vendor: 'goldCoastOils' },
  { id: 24, name: 'Coconut Oil', price: 42.00, category: 'Oils & Condiments', unit: '500ml bottle', emoji: '🥥', image: 'https://images.unsplash.com/photo-1526346698789-22fd84314424?w=400&h=300&fit=crop&auto=format&q=80', description: 'Cold-pressed virgin coconut oil for cooking, baking, and health. Adds a delicate tropical flavor.', featured: false, rating: 4.6, vendor: 'goldCoastOils' },
  { id: 25, name: 'Groundnut Oil', price: 38.00, category: 'Oils & Condiments', unit: '1 litre bottle', emoji: '🥜', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop&auto=format&q=80', description: 'High-quality groundnut (peanut) oil with a high smoke point. Perfect for frying and sautéing.', featured: false, rating: 4.5, vendor: 'goldCoastOils' },
  { id: 26, name: 'Shea Butter', price: 30.00, category: 'Oils & Condiments', unit: '500g tub', emoji: '🫘', image: 'https://images.unsplash.com/photo-1547592166-23ef7c870df0?w=400&h=300&fit=crop&auto=format&q=80', description: 'Organic shea butter for cooking traditional northern Ghanaian dishes. Rich and aromatic.', featured: false, rating: 4.4, vendor: 'goldCoastOils' },
  { id: 27, name: 'Tomato Paste', price: 16.00, category: 'Oils & Condiments', unit: '400g tin', emoji: '🍅', image: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&h=300&fit=crop&auto=format&q=80', description: 'Concentrated tomato paste for rich, flavorful stews and jollof rice. Triple concentrated.', featured: false, rating: 4.3, vendor: 'quickMart' },
  { id: 28, name: 'Soy Sauce', price: 14.00, category: 'Oils & Condiments', unit: '300ml bottle', emoji: '🫗', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop&auto=format&q=80', description: 'Naturally brewed soy sauce for stir-fries, marinades, and noodle dishes.', featured: false, rating: 4.2, vendor: 'quickMart' },

  // ═══ BEVERAGES ═══
  { id: 29, name: 'Sobolo Mix', price: 20.00, category: 'Beverages', unit: '200g pack', emoji: '🌺', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop&auto=format&q=80', description: 'Dried hibiscus petals with ginger and spices for making refreshing sobolo (bissap). A Ghanaian favorite.', featured: true, rating: 4.8, vendor: 'tasteGhana' },
  { id: 30, name: 'Cocoa Powder', price: 28.00, category: 'Beverages', unit: '250g tin', emoji: '☕', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&auto=format&q=80', description: 'Premium Ghanaian cocoa powder — rich, dark, and full-bodied. Straight from the cocoa belt.', featured: true, rating: 4.9, vendor: 'tasteGhana' },
  { id: 31, name: 'Green Tea', price: 25.00, category: 'Beverages', unit: '50 tea bags', emoji: '🍵', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop&auto=format&q=80', description: 'Pure green tea bags for a calming and antioxidant-rich brew. Light and refreshing.', featured: false, rating: 4.5, vendor: 'tasteGhana' },
  { id: 32, name: 'Milo', price: 35.00, category: 'Beverages', unit: '400g tin', emoji: '🟤', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop&auto=format&q=80', description: 'The original chocolate malt energy drink. A breakfast staple loved by all ages.', featured: false, rating: 4.7, vendor: 'quickMart' },

  // ═══ PROVISIONS (NEW) ═══
  { id: 33, name: 'Indomie Instant Noodles', price: 120.00, category: 'Provisions', unit: 'Carton of 40', emoji: '🍜', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop&auto=format&q=80', description: 'The original instant noodles loved across Ghana. Chicken flavor. Quick meals in 3 minutes.', featured: true, rating: 4.7, vendor: 'quickMart' },
  { id: 34, name: 'Peak Milk (Evaporated)', price: 96.00, category: 'Provisions', unit: '12 tins', emoji: '🥫', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format&q=80', description: 'Rich, creamy evaporated milk for tea, coffee, cereals, and cooking. A household staple.', featured: false, rating: 4.6, vendor: 'quickMart' },
  { id: 35, name: 'Titus Sardines', price: 85.00, category: 'Provisions', unit: '10 tins', emoji: '🐟', image: 'https://images.unsplash.com/photo-1611171711912-e3f6b536f532?w=400&h=300&fit=crop&auto=format&q=80', description: 'Premium sardines in vegetable oil. High in protein and omega-3. Great with bread or rice.', featured: false, rating: 4.5, vendor: 'quickMart' },
  { id: 36, name: 'Exeter Corned Beef', price: 78.00, category: 'Provisions', unit: '6 tins', emoji: '🥩', image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&auto=format&q=80', description: 'Quality corned beef for sandwiches, stews, and quick meals. A pantry essential.', featured: false, rating: 4.4, vendor: 'quickMart' },
  { id: 37, name: 'Sugar', price: 25.00, category: 'Provisions', unit: '2kg bag', emoji: '🍬', image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&h=300&fit=crop&auto=format&q=80', description: 'Refined white granulated sugar for sweetening beverages, baking, and cooking.', featured: false, rating: 4.3, vendor: 'quickMart' },
  { id: 38, name: 'Iodated Salt', price: 8.00, category: 'Provisions', unit: '1kg pack', emoji: '🧂', image: 'https://images.unsplash.com/photo-1518110925495-5fe2c8f2be87?w=400&h=300&fit=crop&auto=format&q=80', description: 'Iodated table salt — essential for cooking and seasoning. Fine grain for even distribution.', featured: false, rating: 4.2, vendor: 'quickMart' },
  { id: 39, name: 'Cabin Biscuits', price: 42.00, category: 'Provisions', unit: '6 packs', emoji: '🍪', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop&auto=format&q=80', description: 'Classic cabin biscuits — crunchy, satisfying, and perfect with tea or as a snack.', featured: false, rating: 4.5, vendor: 'quickMart' },
  { id: 40, name: 'Gari', price: 45.00, category: 'Provisions', unit: '5kg bag', emoji: '🟡', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&auto=format&q=80', description: 'Premium cassava flakes (gari) for soaking, eba, and gari fortor. Staple carb for Ghanaian meals.', featured: true, rating: 4.6, vendor: 'goldenHarvest' },
  { id: 41, name: 'Bournvita', price: 38.00, category: 'Provisions', unit: '400g tin', emoji: '☕', image: 'https://images.unsplash.com/photo-1610611424854-5e07b2b5b5e0?w=400&h=300&fit=crop&auto=format&q=80', description: 'Chocolatey malt drink fortified with vitamins and minerals. Nutritious and delicious.', featured: false, rating: 4.6, vendor: 'quickMart' },
  { id: 42, name: 'Canned Baked Beans', price: 54.00, category: 'Provisions', unit: '6 tins (400g)', emoji: '🫘', image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&h=300&fit=crop&auto=format&q=80', description: 'Baked beans in rich tomato sauce. Quick, hearty meal or side dish.', featured: false, rating: 4.3, vendor: 'quickMart' },
  { id: 43, name: 'Maggi Cubes', price: 20.00, category: 'Provisions', unit: 'Box of 100', emoji: '🟫', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop&auto=format&q=80', description: 'Seasoning cubes for enhancing soups, stews, rice, and sauces. No kitchen is complete without Maggi.', featured: false, rating: 4.4, vendor: 'quickMart' },
  { id: 44, name: 'Ideal Milk', price: 84.00, category: 'Provisions', unit: '12 tins', emoji: '🥛', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop&auto=format&q=80', description: 'Evaporated filled milk for tea, porridge, and cooking. Smooth and affordable.', featured: false, rating: 4.3, vendor: 'quickMart' },

  // ═══ HAMPERS (Pre-made) ═══
  { id: 45, name: 'Essential Kitchen Hamper', price: 299.00, category: 'Hampers', unit: '1 hamper (10 items)', emoji: '🧺', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed514?w=400&h=300&fit=crop&auto=format&q=80', description: 'Essential kitchen starter containing: 5kg Royal Feast Basmati Rice, 1L Pure Zomi Palm Oil, 1kg Fresh Farm Tomatoes, 1kg Red Onions, Crate of 30 Farm Eggs, 400g Gino Tomato Paste, 100g Curry Powder, 2kg Granulated Sugar, 1kg Iodated Salt, and Box of 100 Maggi Cubes. You can easily add more provisions, spices, or fresh items to your order!', featured: true, rating: 4.9, vendor: 'soniviva', isHamper: true, hamperItems: [1, 7, 12, 20, 23, 16, 27, 37, 38, 43] },
  { id: 46, name: 'Family Care Package', price: 499.00, category: 'Hampers', unit: '1 hamper (15 items)', emoji: '👨‍👩‍👧‍👦', image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=300&fit=crop&auto=format&q=80', description: 'Comprehensive home pantry package: 5kg Basmati Rice, 2kg Wheat Flour, 1kg Fresh Tomatoes, 1kg Hot Pepper Mix, 5 fingers Sweet Plantains, 1kg Onions, 200g Sun-Dried Shrimp, Crate of 30 Eggs, 1L Palm Oil, 400g Tomato Paste, 250g Golden Tree Cocoa Powder, Carton of Indomie (40 packs), 12 tins Peak Evaporated Milk, 2kg Sugar, and 1kg Salt. Fully customizable with more food items!', featured: true, rating: 4.8, vendor: 'soniviva', isHamper: true, hamperItems: [1, 5, 7, 9, 10, 12, 13, 20, 23, 27, 30, 33, 34, 37, 38] },
  { id: 47, name: 'Festive Celebration Hamper', price: 799.00, category: 'Hampers', unit: '1 hamper (20 items)', emoji: '🎉', image: 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?w=400&h=300&fit=crop&auto=format&q=80', description: 'Luxury holiday & gift package: 5kg Basmati Rice, 5kg Jasmine Rice, 500g Rolled Oats, 1kg Fresh Tomatoes, 7 fingers Ripe Plantain, 200g Dried Shrimp, 150g SONIVIVA Signature Spice Blend, 1L Fresh Milk, Crate of 30 Eggs, 250g Butter, 1L Palm Oil, 500ml Virgin Coconut Oil, 200g Sobolo Mix, 250g Cocoa Powder, Carton of Indomie, 10 tins Titus Sardines, 6 tins Exeter Corned Beef, 6 packs Cabin Biscuits, 400g Bournvita, and 2kg Sugar. Need extra items or drinks? Add them freely!', featured: true, rating: 4.9, vendor: 'soniviva', isHamper: true, hamperItems: [1, 3, 6, 7, 10, 13, 18, 19, 20, 21, 23, 24, 29, 30, 33, 35, 36, 39, 41, 37] },
  { id: 48, name: 'Student Starter Hamper', price: 199.00, category: 'Hampers', unit: '1 hamper (8 items)', emoji: '🎓', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop&auto=format&q=80', description: 'Budget-friendly semester package: 2kg Volta Brown Rice, Carton of Indomie (40 packs), 10 tins Titus Sardines, 2kg Granulated Sugar, 1kg Iodated Salt, 50 bags Green Tea, 12 tins Peak Milk, and 1L Groundnut Cooking Oil. You can add extra gari, milo, or seasonings to your hamper anytime!', featured: false, rating: 4.7, vendor: 'soniviva', isHamper: true, hamperItems: [2, 33, 35, 37, 38, 31, 34, 25] }
];

// ─── Helpers ───
function getCategories() { return [...new Set(products.map(p => p.category))]; }
function getProductsByCategory(cat) { return products.filter(p => p.category === cat); }
function getFeaturedProducts() { return products.filter(p => p.featured); }
function getProductById(id) { return products.find(p => p.id === parseInt(id)); }
function getVendor(key) { return vendors[key] || vendors.soniviva; }
function getHamperProducts() { return products.filter(p => p.isHamper); }
function getNonHamperProducts() { return products.filter(p => !p.isHamper && p.category !== 'Hampers'); }

function searchProducts(query) {
  const q = query.toLowerCase().trim();
  return products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
}

function sortProducts(list, sortBy) {
  const s = [...list];
  switch (sortBy) {
    case 'price-low':  return s.sort((a, b) => a.price - b.price);
    case 'price-high': return s.sort((a, b) => b.price - a.price);
    case 'name-az':    return s.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-za':    return s.sort((a, b) => b.name.localeCompare(a.name));
    case 'rating':     return s.sort((a, b) => b.rating - a.rating);
    default:           return s;
  }
}

function filterProducts(list, filters) {
  let f = [...list];
  if (filters.categories?.length > 0) f = f.filter(p => filters.categories.includes(p.category));
  if (filters.minPrice !== undefined) f = f.filter(p => p.price >= filters.minPrice);
  if (filters.maxPrice !== undefined) f = f.filter(p => p.price <= filters.maxPrice);
  if (filters.vendor) f = f.filter(p => p.vendor === filters.vendor);
  return f;
}

// ─── Perishable price calculation ───
function getPerishablePrice(product, unitValue) {
  if (!product.isPerishable || !product.pricePerUnit) return product.price;
  return product.pricePerUnit * unitValue;
}

// ─── Image helper ───
function productImageHTML(product, size = 'card') {
  const gradient = categoryGradients[product.category] || 'linear-gradient(135deg, #E0E0E0, #BDBDBD)';
  const emojiSize = size === 'detail' ? '6rem' : (size === 'cart' ? '2rem' : '3rem');
  return `
    <img src="${product.image}" alt="${product.name}" loading="lazy"
         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
    <span class="emoji-fallback" style="display:none; align-items:center; justify-content:center; width:100%; height:100%; font-size:${emojiSize}; background:${gradient};">${product.emoji}</span>
  `;
}

// ─── Render product card ───
function renderProductCard(product) {
  const gradient = categoryGradients[product.category] || 'linear-gradient(135deg, #E0E0E0, #BDBDBD)';
  const v = getVendor(product.vendor);
  const priceLabel = product.isPerishable
    ? `from GH₵ ${(product.pricePerUnit * (product.unitOptions?.[0]?.value || 1)).toFixed(2)}`
    : `GH₵ ${product.price.toFixed(2)}`;

  const hamperBadge = product.isHamper ? '<span class="product-badge hamper-badge">Hamper</span>' : '';
  const featuredBadge = product.featured && !product.isHamper ? '<span class="product-badge">Featured</span>' : '';

  const detailPage = product.isHamper ? `hampers.html#hamper-${product.id}` : `product.html?id=${product.id}`;

  return `
    <div class="product-card" data-id="${product.id}" data-category="${product.category}">
      <a href="${detailPage}" style="text-decoration:none; color:inherit;">
        <div class="product-image" style="background: ${gradient}">
          ${productImageHTML(product, 'card')}
          ${featuredBadge}${hamperBadge}
        </div>
      </a>
      <div class="product-info">
        <div class="product-top-row">
          <span class="product-category-tag">${product.category}</span>
          <span class="vendor-tag" style="color:${v.color}" title="Sold by ${v.name}">${v.badge} ${v.name}</span>
        </div>
        <a href="${detailPage}" style="text-decoration:none; color:inherit;">
          <h3 class="product-name">${product.name}</h3>
        </a>
        <p class="product-unit">${product.unit}</p>
        ${product.isHamper ? `<p class="hamper-count">📦 ${product.hamperItems.length} items included</p>` : ''}
        <div class="product-bottom">
          <span class="product-price">${priceLabel}</span>
          <button class="add-to-cart-btn" onclick="addToCart(${product.id}); event.preventDefault();">
            <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
            Add
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderProducts(list, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (list.length === 0) {
    container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;"><div style="font-size:3rem;margin-bottom:16px;">🔍</div><h3 style="margin-bottom:8px;">No products found</h3><p style="color:var(--text-muted);">Try adjusting your search or filters.</p></div>';
    return;
  }
  container.innerHTML = list.map(renderProductCard).join('');
}

function renderCategories(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const cats = [
    { name: 'Grains & Cereals', emoji: '🌾' }, { name: 'Fresh Produce', emoji: '🥬' },
    { name: 'Spices & Seasonings', emoji: '🌶️' }, { name: 'Dairy & Eggs', emoji: '🥛' },
    { name: 'Oils & Condiments', emoji: '🫒' }, { name: 'Beverages', emoji: '🍵' },
    { name: 'Provisions', emoji: '🏪' }, { name: 'Hampers', emoji: '🧺' }
  ];
  container.innerHTML = cats.map(c => {
    const count = getProductsByCategory(c.name).length;
    const img = categoryImages[c.name] || '';
    const grad = categoryGradients[c.name] || '';
    const href = c.name === 'Hampers' ? 'hampers.html' : `shop.html?category=${encodeURIComponent(c.name)}`;
    return `<a href="${href}" class="category-card"><div class="category-img" style="background:${grad}"><img src="${img}" alt="${c.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><span class="emoji-fallback" style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:2.5rem;">${c.emoji}</span></div><h4>${c.name}</h4><p>${count} products</p></a>`;
  }).join('');
}

// ─── Product Detail (vendor + perishable pricing) ───
function renderProductDetail(product) {
  if (!product) return;
  const gradient = categoryGradients[product.category] || 'linear-gradient(135deg, #E0E0E0, #BDBDBD)';
  const v = getVendor(product.vendor);
  const dc = document.getElementById('product-detail');
  if (!dc) return;

  // Weight selector for perishables
  let weightSelector = '';
  if (product.isPerishable && product.unitOptions) {
    const options = product.unitOptions.map((o, i) =>
      `<button class="weight-option ${i === 0 ? 'active' : ''}" data-value="${o.value}" data-price="${(product.pricePerUnit * o.value).toFixed(2)}" onclick="selectWeight(this, ${product.id})">${o.label}<span class="weight-price">GH₵ ${(product.pricePerUnit * o.value).toFixed(2)}</span></button>`
    ).join('');
    weightSelector = `
      <div class="weight-selector-section">
        <label class="weight-label">Select Quantity / Weight:</label>
        <div class="weight-options">${options}</div>
        <p class="weight-note">💡 Price: GH₵ ${product.pricePerUnit.toFixed(2)} per ${product.unitLabel}</p>
      </div>
    `;
  }

  // Hamper contents
  let hamperContents = '';
  if (product.isHamper && product.hamperItems) {
    const items = product.hamperItems.map(id => getProductById(id)).filter(Boolean);
    hamperContents = `
      <div class="hamper-contents-section">
        <h4>🧺 Guaranteed Contents (${items.length} Essential Foodstuffs):</h4>
        <div class="hamper-items-list">
          ${items.map(item => `
            <div class="hamper-included-item">
              <span>${item.emoji} <strong>${item.name}</strong></span>
              <span class="item-unit">${item.unit}</span>
            </div>
          `).join('')}
        </div>
        <div class="hamper-customize-notice">
          <strong>💡 Want to add more items to this hamper?</strong><br>
          Every home and celebration is unique! You can freely add any extra provisions, fresh produce, oils, or spices from our <a href="shop.html">Shop</a> to your cart, or visit our <a href="hampers.html">Hamper Customizer</a> to tailor a package with your exact preferred items!
        </div>
      </div>
    `;
  }

  const displayPrice = product.isPerishable
    ? (product.pricePerUnit * (product.unitOptions?.[0]?.value || 1)).toFixed(2)
    : product.price.toFixed(2);

  dc.innerHTML = `
    <div class="product-detail-image" style="background:${gradient}">${productImageHTML(product, 'detail')}</div>
    <div class="product-detail-info">
      <div class="category-tag">${product.category}</div>
      <h1>${product.name}</h1>
      <div class="vendor-detail-tag" style="color:${v.color}">${v.badge} Sold by <strong>${v.name}</strong></div>
      <div class="product-detail-price" id="detail-price">GH₵ ${displayPrice}</div>
      <p class="product-detail-desc">${product.description}</p>
      ${hamperContents}
      ${weightSelector}
      <div class="product-meta">
        <div class="product-meta-item"><span class="label">Unit</span><span class="value">${product.unit}</span></div>
        <div class="product-meta-item"><span class="label">Category</span><span class="value">${product.category}</span></div>
        <div class="product-meta-item"><span class="label">Rating</span><span class="value">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))} (${product.rating})</span></div>
        <div class="product-meta-item"><span class="label">Vendor</span><span class="value">${v.name}</span></div>
        <div class="product-meta-item"><span class="label">Availability</span><span class="value" style="color:#2E7D32;font-weight:600;">In Stock</span></div>
      </div>
      <div class="quantity-selector">
        <button onclick="decrementQty()">−</button>
        <input type="number" id="product-qty" value="1" min="1" max="20" readonly>
        <button onclick="incrementQty()">+</button>
      </div>
      <div class="detail-actions">
        <button class="btn btn-primary btn-lg" onclick="addToCartWithQty(${product.id})">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
          Add to Cart
        </button>
        <a href="shop.html" class="btn btn-outline btn-lg">Continue Shopping</a>
      </div>
    </div>
  `;
  document.title = `${product.name} — SONIVIVA`;
  const bn = document.getElementById('breadcrumb-product-name');
  if (bn) bn.textContent = product.name;
}

// ─── Weight selector ───
function selectWeight(btn, productId) {
  btn.closest('.weight-options').querySelectorAll('.weight-option').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const price = btn.dataset.price;
  const priceEl = document.getElementById('detail-price');
  if (priceEl) priceEl.textContent = `GH₵ ${price}`;
}

// ─── Quantity ───
function incrementQty() { const i = document.getElementById('product-qty'); if (i && parseInt(i.value) < 20) i.value = parseInt(i.value) + 1; }
function decrementQty() { const i = document.getElementById('product-qty'); if (i && parseInt(i.value) > 1) i.value = parseInt(i.value) - 1; }
function addToCartWithQty(productId) {
  const qty = parseInt(document.getElementById('product-qty').value) || 1;
  const product = getProductById(productId);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + qty, 20);
  } else {
    cart.push({ id: productId, quantity: Math.min(qty, 20) });
  }

  saveCart(cart);
  showToast(`${product.name} x${qty} added to cart!`, 'success');

  // One notification only
  try {
    const user = typeof getUser === 'function' ? getUser() : null;
    fetch('/api/cart/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        productName: product.name,
        quantity: qty,
        price: product.price,
        userEmail: user ? user.email : '',
        userName: user ? user.name : ''
      })
    }).catch(() => {});
  } catch (e) {}
}

function renderRelatedProducts(product, containerId) {
  const container = document.getElementById(containerId);
  if (!container || !product) return;
  container.innerHTML = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4).map(renderProductCard).join('');
}
