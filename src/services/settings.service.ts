import { SystemSetting, type ISystemSetting } from '../models/SystemSetting.ts'

const DEFAULT_DELIVERY_METHODS = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: '5-7 Business Days. Eco-conscious packaging with recycled materials.',
    price: 12,
    currency: 'USD',
    estimatedDays: '5-7 business days',
    isActive: true,
    isDefault: true,
  },
  {
    id: 'express',
    name: 'Express Courier',
    description: '1-2 Business Days. Priority handling with carbon-neutral shipping.',
    price: 28,
    currency: 'USD',
    estimatedDays: '1-2 business days',
    isActive: true,
    isDefault: false,
  },
]

export class SettingsService {
  async getSettings(): Promise<ISystemSetting> {
    let settings = await SystemSetting.findOne()
    if (!settings) {
      settings = await SystemSetting.create({
        deliveryMethods: DEFAULT_DELIVERY_METHODS,
      })
    }
    if (!settings.deliveryMethods || settings.deliveryMethods.length === 0) {
      settings.deliveryMethods = DEFAULT_DELIVERY_METHODS as any
      await settings.save()
    }
    return settings
  }

  async updateSettings(data: Partial<ISystemSetting>): Promise<ISystemSetting> {
    let settings = await SystemSetting.findOne()
    if (!settings) {
      settings = new SystemSetting(data)
    } else {
      Object.assign(settings, data)
    }
    await settings.save()
    return settings
  }
}

export const settingsService = new SettingsService()
