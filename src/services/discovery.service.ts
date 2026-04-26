import { HomeSection, type IHomeSection } from '../models/HomeSection.ts'

export class DiscoveryService {
  async getActiveHome(): Promise<IHomeSection | null> {
    return HomeSection.findOne({ status: 'published' })
      .populate('sections.artisanId')
      .populate('sections.productIds')
      .sort({ updatedAt: -1 })
  }

  async createHomeConfiguration(data: Partial<IHomeSection>): Promise<IHomeSection> {
    const config = new HomeSection(data)
    await config.save()
    return config
  }

  async updateHomeConfiguration(id: string, data: Partial<IHomeSection>): Promise<IHomeSection | null> {
    return HomeSection.findByIdAndUpdate(id, data, { new: true })
  }
}

export const discoveryService = new DiscoveryService()
