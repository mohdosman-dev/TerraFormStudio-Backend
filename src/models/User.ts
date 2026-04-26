import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcrypt'

export interface IUser extends Document {
  email: string
  passwordHash: string
  roles: string[]
  profile: {
    firstName?: string
    lastName?: string
    phone?: string
    avatarUrl?: string
  }
  preferences: {
    currency: string
    locale: string
  }
  status: 'active' | 'suspended' | 'pending'
  comparePassword: (password: string) => Promise<boolean>
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    roles: { type: [String], default: ['customer'] },
    profile: {
      firstName: String,
      lastName: String,
      phone: String,
      avatarUrl: String
    },
    preferences: {
      currency: { type: String, default: 'AED' },
      locale: { type: String, default: 'en-AE' }
    },
    status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' }
  },
  { timestamps: true }
)

UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('passwordHash')) return
  try {
    const salt = await bcrypt.genSalt(10)
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
  } catch (err: any) {
    throw err
  }
})

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash)
}

export const User = mongoose.model<IUser>('User', UserSchema)
