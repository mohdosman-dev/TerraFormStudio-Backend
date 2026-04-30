import mongoose from 'mongoose'
import { User } from '../src/models/User.ts'
import { Artisan } from '../src/models/Artisan.ts'
import { Product } from '../src/models/Product.ts'
import { Collection } from '../src/models/Collection.ts'
import { HomeSection } from '../src/models/HomeSection.ts'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/terra-form-studio'

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // 1. Clear existing data (optional, but good for consistent testing)
    await Promise.all([
      User.deleteMany({ email: 'admin@terraform.studio' }),
      Artisan.deleteMany({ brandName: 'Elena Rossi Studio' }),
      Product.deleteMany({ title: { $in: ['Ochre Ribbed Vase', 'Luna Mug', 'Sand Bowl'] } }),
      Collection.deleteMany({ title: 'The Terra Collection' }),
      HomeSection.deleteMany({})
    ])

    // 2. Create Admin User
    const admin = await User.create({
      email: 'admin@terraform.studio',
      passwordHash: 'password123',
      profile: {
        firstName: 'Chief',
        lastName: 'Curator'
      },
      roles: ['admin']
    })

    // 3. Create Artisan
    const elena = await Artisan.create({
      userId: admin._id,
      displayName: 'Elena Rossi',
      brandName: 'Elena Rossi Studio',
      bioShort: 'Master artisan crafting Tuscan-inspired ceramics.',
      studioStory: {
        philosophy: 'Dialogue between raw earth and disciplined hands.',
        materials: ['Local Tuscan stoneware', 'Mineral oxides'],
        techniques: ['Wheel-throwing', 'Oxidation firing']
      },
      heroImage: {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnBiFuAbjgnAXFKkIi5Uqi28vxZ-9f7iSnQ5aKZUxlW0eiCOfGFcXDG8puLofQGkaAgH7z5CFFAKtlIAluy2-uPrngFIplTHYwOlg4EX7sgnBJrcvoKGpozvDvgPM5urGEyM8Xahb_rhiNJZBSwagVvI2xOk6mMli4ldjIKEHEyEgNMRkSdvMQhKvEufmHinz8z2QDN6klQZqFjvrpVA3qn6e3WtulUWtmvC7FEwV4QFSD3neCl4dkazGrsUDjQRM1OE1msE_XA7A',
        alt: 'Elena Rossi in her studio'
      },
      location: { city: 'Tuscany', country: 'Italy' },
      status: 'published'
    })

    // 4. Create Products
    const products = await Product.create([
      {
        artisanId: elena._id,
        title: 'Ochre Ribbed Vase',
        subtitle: 'Tactile stoneware',
        price: { amount: 120, currency: 'USD' },
        media: [{ url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzy89Q5GCkgZqpWu6p5IluC0pZo51jeo5I-fQ1MLAHqvR9wXlqbYy7iY7g6noF_gtowbi-PRVqKtwWixCxZ2HwvkJVcJJ27ZET1VbnVgCCSG7WkAJvGYHtOYufh82WK-IyU2B3R8Eun6kDOc1C1h2d6bLnw-M04CllmvEI6qYs1wElwtbj3ogI-oeUvhDLMpj4vGt43fKNXkerMkDrTGDA6G4DHfX6IHAMCvT9P-NTtUomNHHoL75-6-NdDMNQE11dKUUd_QCz5eg', alt: 'Ochre Vase', type: 'image', sortOrder: 0 }],
        status: 'published'
      },
      {
        artisanId: elena._id,
        title: 'Luna Mug',
        subtitle: 'Minimalist vessel',
        price: { amount: 42, currency: 'USD' },
        media: [{ url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbnjuJ3ukmjY7udfqsQgN_Y3zsJ__DLMGBOWcZtQwNwrJuFsrCIj0Vff40gWuAl3DUxtKCdTlPAor3Sb0_tNIQjL9Esxffk_sUHZBRa8B1AWyUD_85gJHF1ST4z4JULRAV-z61UauI0Lz6KxTNBlToQSrSlru2SdWakyADWCvuLe5is4pqzYjPvKMbIktVsV_xhX3VCgD7G34Vwe7p1R4vxTJrXnAOeubhnM0ROyN27c5-2gSVC7ZjK1nvBLQ8Pdob_W_YqU0M1OY', alt: 'Luna Mug', type: 'image', sortOrder: 0 }],
        status: 'published'
      },
      {
        artisanId: elena._id,
        title: 'Sand Bowl',
        subtitle: 'Hand-built stoneware',
        price: { amount: 85, currency: 'USD' },
        media: [{ url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFhHiBmu7IeCus5XF8ujaNUDAzxbz1Jb92nxnGQU5zaRnl9LUXBOvngM-0VMcw2RllCG2r6ErCmLU1lBaVia6_CPaiCJf6g4Aln58OLc_RjhFysLkoxW5hJl8GCTGG-3r_30wBVCA7hr9-Q4TwBWe801smjmq4MpDUx4IfWzfPqGA1pVY7foVgE2COQjAPAHOi0LS357CgSdOWv3rAp0KlcbC6VO7dAPJI-R-t_xxEZnWJx6lHzlE-CnVH3v4YZ0_aHoM43kE3aik', alt: 'Sand Bowl', type: 'image', sortOrder: 0 }],
        status: 'published'
      }
    ])

    // 5. Create Collection
    const terraCollection = await Collection.create({
      title: 'The Terra Collection',
      description: 'Earthy tones and organic forms.',
      heroImage: { url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjJV_Ys5y7DB-9iPmftCawyWvgsKFBI2c5Rd80Vz25fUFwm9qjmq6mVkNc-fgqWegAOX2MOHEen29-sUEjyoaiFLr0ccVsSOs-xwuy2nO3KmspZsbPeB59lQHasSnYSTnUsl4o7Xa0dH2cONLURDQuvL2VU5T86nDau2NGz_4541f_YfPt3awGoFe2qhpXh8R9_-vOJXkZkQdk39OafpjzF7PHBN1qkUYYhKm3u1we6n0BnM5JiHGOgqBltJJsJvp0nanLRhe1cuk', alt: 'Terra Collection Hero' },
      productIds: products.map(p => p._id),
      status: 'published'
    })

    // 6. Configure Homepage
    await HomeSection.create({
      name: 'Primary Gallery Config',
      status: 'published',
      sections: [
        {
          type: 'hero',
          title: 'Purity in Form',
          image: {
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC701bcMYiOqcqA0N9T8SmbSd20joLIxo2oWIT0NAoNpZDuFGT5Zq9Sx3fPqp-wB4Ukxay-TCCF-yrTwvNPsFWw_-O6_40RoerDz_sIL1uNualOsh0nomdqdLi4xjsIKM5z-NzexrC-YeXZutD-B3Pcjbew_08SnvG924TNz1_KI3otnWmrdVvzFXzl2EAD8LfMTaw4oHcYYcCkp_FwOvbBlcngYV5vSNEMDdYltTxF-wNzNPthKXBnwqjJXIaVl9TZTIpY3PG59DM',
            alt: 'Hero Ceramic'
          },
          cta: { label: 'Shop the Collection', targetType: 'url', url: '/gallery' },
          sortOrder: 0
        },
        {
          type: 'collection_row',
          title: 'Collections',
          collectionIds: [terraCollection._id],
          sortOrder: 1
        },
        {
          type: 'artisan_spotlight',
          title: 'The Soul of Clay: Elena Rossi',
          content: 'Each vessel Elena crafts tells a story of Tuscan earth, balanced with quiet precision and modern design.',
          artisanId: elena._id,
          sortOrder: 2
        },
        {
          type: 'product_row',
          title: 'New Arrivals',
          productIds: products.map(p => p._id),
          sortOrder: 3
        }
      ]
    })

    console.log('Seeding complete! Admin user, artisan, products, collections, and homepage config created.')
    process.exit(0)
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

seed()
