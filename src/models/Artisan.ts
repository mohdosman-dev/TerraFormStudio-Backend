import mongoose, { Schema, Document } from "mongoose";
import slugify from "slugify";

export interface IArtisan extends Document {
  userId: mongoose.Types.ObjectId;
  slug: string;
  displayName: string;
  brandName: string;
  bioShort: string;
  bioLong: string;
  studioStory: {
    philosophy: string;
    materials: string[];
    techniques: string[];
  };
  heroImage: {
    url: string;
    alt: string;
  };
  gallery: Array<{ url: string; alt: string }>;
  location: {
    city: string;
    country: string;
  };
  socialLinks: {
  instagram?: string;
  };
  isSpotlight: boolean;
  status: "pending" | "published" | "archived";  createdAt: Date;
  updatedAt: Date;
}

const ArtisanSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    slug: { type: String, unique: true, index: true },
    displayName: { type: String, required: true },
    brandName: { type: String, required: true },
    bioShort: String,
    bioLong: String,
    studioStory: {
      philosophy: String,
      materials: [String],
      techniques: [String],
    },
    heroImage: {
      url: String,
      alt: String,
    },
    gallery: [{ url: String, alt: String }],
    location: {
      city: String,
      country: String,
    },
    socialLinks: {
      instagram: String,
    },
    isSpotlight: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "published", "archived"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// Auto-generate slug from brandName if not provided
ArtisanSchema.pre<IArtisan>("save", function () {
  if (this.brandName && !this.slug) {
    this.slug = slugify(this.brandName, { lower: true, strict: true });
  }
});

export const Artisan = mongoose.model<IArtisan>("Artisan", ArtisanSchema);
