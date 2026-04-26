import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../src/models/User';
import { Artisan } from '../src/models/Artisan';
import { Product } from '../src/models/Product';
import { Collection } from '../src/models/Collection';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/terra-form-studio';

const DEFAULT_PASSWORD = '12345678';

const ceramicImages = [
  'https://images.unsplash.com/photo-1581044777550-4cfa60707c33?q=80&w=800',
  'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800',
  'https://images.unsplash.com/photo-1578749553858-20ad25624374?q=80&w=800',
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=800',
  'https://images.unsplash.com/photo-1595351298020-0597229c5a2c?q=80&w=800',
  'https://images.unsplash.com/photo-1605152276897-4f618f831968?q=80&w=800',
  'https://images.unsplash.com/photo-1520408222757-6f9f95d87d5d?q=80&w=800',
  'https://images.unsplash.com/photo-1493106641515-6b563ad3d091?q=80&w=800',
  'https://images.unsplash.com/photo-1504192010706-96796e62615b?q=80&w=800',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800',
  'https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?q=80&w=800',
  'https://images.unsplash.com/photo-1563245339-612e52e50529?q=80&w=800'
];

const artisanHeroImages = [
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=800',
  'https://images.unsplash.com/photo-1595351298020-0597229c5a2c?q=80&w=800',
  'https://images.unsplash.com/photo-1605152276897-4f618f831968?q=80&w=800'
];

const materials = ['Stoneware', 'Porcelain', 'Terracotta', 'Black Clay', 'Paper Clay'];
const techniques = ['Wheel-thrown', 'Hand-built', 'Slab-built', 'Coiled'];
const glazes = ['Ash Glaze', 'Matte White', 'Celadon', 'Tenmoku', 'Shino', 'Salt Glaze'];

const cities = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah'];

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Artisan.deleteMany({});
    await Product.deleteMany({});
    await Collection.deleteMany({});
    console.log('Data cleared.');

    // 1. Create Users
    console.log('Creating users...');
    const users = [];

    // 2 Admins
    for (let i = 1; i <= 2; i++) {
      users.push(await User.create({
        email: `admin${i}@terra.com`,
        passwordHash: DEFAULT_PASSWORD,
        roles: ['admin'],
        profile: { firstName: 'Admin', lastName: `${i}` },
        status: 'active'
      }));
    }

    // 11 Artisans
    const artisanUsers = [];
    for (let i = 1; i <= 11; i++) {
      const u = await User.create({
        email: `artisan${i}@example.com`,
        passwordHash: DEFAULT_PASSWORD,
        roles: ['artisan'],
        profile: { 
          firstName: getRandom(['Mariam', 'Omar', 'Lina', 'Sami', 'Hana', 'Zaid']),
          lastName: getRandom(['Al-Haddad', 'Bakir', 'Saleh', 'Mansour', 'Said'])
        },
        status: 'active'
      });
      artisanUsers.push(u);
      users.push(u);
    }

    // Some customers
    for (let i = 1; i <= 5; i++) {
      users.push(await User.create({
        email: `customer${i}@example.com`,
        passwordHash: DEFAULT_PASSWORD,
        roles: ['customer'],
        profile: { 
          firstName: getRandom(['Alice', 'Bob', 'Charlie', 'David', 'Eve']),
          lastName: getRandom(['Smith', 'Jones', 'Brown', 'Davis'])
        },
        status: 'active'
      }));
    }
    console.log(`Created ${users.length} users.`);

    // 2. Create Artisans
    console.log('Creating artisans...');
    const artisans = [];
    for (let i = 0; i < artisanUsers.length; i++) {
      const u = artisanUsers[i];
      const artisan = await Artisan.create({
        userId: u._id,
        displayName: `${u.profile.firstName} ${u.profile.lastName} ${i + 1}`,
        brandName: `${u.profile.firstName} ${u.profile.lastName} Studio ${i + 1}`,
        bioShort: `Bespoke ${getRandom(materials).toLowerCase()} ceramics created in ${getRandom(cities)}.`,
        bioLong: `A deep dive into the philosophy of ${u.profile.firstName}, focusing on ${getRandom(techniques).toLowerCase()} methods and ${getRandom(glazes).toLowerCase()}.`,
        studioStory: {
          philosophy: 'Minimalist forms for daily use.',
          materials: [getRandom(materials), getRandom(materials)],
          techniques: [getRandom(techniques)]
        },
        heroImage: {
          url: getRandom(artisanHeroImages),
          alt: `${u.profile.firstName} in their studio`
        },
        location: {
          city: getRandom(cities),
          country: 'AE'
        },
        status: 'published'
      });
      artisans.push(artisan);
    }
    console.log(`Created ${artisans.length} artisans.`);

    // 3. Create Products
    console.log('Creating products...');
    const products = [];
    const productTitles = [
      'Ash Glaze Bowl', 'Cylindrical Vase', 'Textured Mug', 'Serving Platter', 
      'Espresso Cup', 'Minimalist Teapot', 'Sculptural Pitcher', 'Pinch Pot Set',
      'Rustic Plate', 'Modern Ikebana Vase', 'Organic Tea Bowl', 'Matte Pitcher'
    ];

    for (let i = 0; i < 44; i++) {
      const artisan = artisans[i % artisans.length];
      const product = await Product.create({
        artisanId: artisan._id,
        title: `${getRandom(productTitles)} ${i + 1}`,
        subtitle: `${getRandom(materials)} piece`,
        descriptionShort: 'Hand-crafted ceramic for the modern home.',
        descriptionLong: 'Detailed story about this unique piece of pottery.',
        price: {
          amount: Math.floor(Math.random() * 500) + 100,
          currency: 'AED'
        },
        media: [
          {
            url: getRandom(ceramicImages),
            alt: 'Product image',
            type: 'image',
            sortOrder: 1
          }
        ],
        specifications: {
          material: getRandom(materials),
          technique: getRandom(techniques),
          glaze: getRandom(glazes),
          dimensions: {
            widthCm: Math.floor(Math.random() * 20) + 5,
            heightCm: Math.floor(Math.random() * 30) + 5,
            weightGrams: Math.floor(Math.random() * 1000) + 200
          },
          care: 'Hand wash recommended.'
        },
        inventory: {
          mode: Math.random() > 0.3 ? 'unique' : 'regular',
          quantityAvailable: Math.floor(Math.random() * 5) + 1,
          status: 'available'
        },
        status: 'published'
      });
      products.push(product);
    }
    console.log(`Created ${products.length} products.`);

    // 4. Create Collections
    console.log('Creating collections...');
    const collections = [];
    const collectionTitles = [
      'Earth Tones', 'Coastal Forms', 'Midnight Series', 'Desert Sands', 
      'Minimalist Rituals', 'Tactile Surfaces', 'Ancient Techniques', 
      'Modern Table', 'Spring Bloom', 'Winter Solstice'
    ];

    for (let i = 0; i < 10; i++) {
      // Pick ~4 random products
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      const selectedProducts = shuffled.slice(0, 4);
      
      const collection = await Collection.create({
        title: collectionTitles[i],
        description: `A curated selection of ${collectionTitles[i].toLowerCase()}.`,
        heroImage: {
          url: getRandom(ceramicImages),
          alt: collectionTitles[i]
        },
        productIds: selectedProducts.map(p => p._id),
        status: 'published',
        sortOrder: i + 1
      });

      // Also update products to reference this collection
      for (const p of selectedProducts) {
        p.discovery.collectionIds.push(collection._id);
        await p.save();
      }

      collections.push(collection);
    }
    console.log(`Created ${collections.length} collections.`);

    // 5. Randomize Related Products
    console.log('Linking related products...');
    for (const p of products) {
      const shuffled = products.filter(item => item._id !== p._id).sort(() => 0.5 - Math.random());
      p.discovery.relatedProductIds = shuffled.slice(0, 3).map(item => item._id);
      await p.save();
    }
    console.log('Related products linked.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
