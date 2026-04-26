import { User, type IUser } from '../models/User.ts'

export class AuthService {
  async register(email: string, passwordHash: string): Promise<IUser> {
    const user = new User({ email, passwordHash })
    await user.save()
    return user
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email })
  }
}

export const authService = new AuthService()
