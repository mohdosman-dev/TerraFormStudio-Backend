import { SystemSetting, type ISystemSetting } from '../models/SystemSetting.ts'

export class SettingsService {
  async getSettings(): Promise<ISystemSetting> {
    let settings = await SystemSetting.findOne()
    if (!settings) {
      settings = await SystemSetting.create({})
    }
    return settings
  }

  async updateSettings(data: Partial<ISystemSetting>): Promise<ISystemSetting> {
    let settings = await SystemSetting.findOne()
    if (!settings) {
      settings = new SystemSetting(data)
    } else {
      // Shallow merge at the top level to allow modular updates per category
      Object.assign(settings, data)
    }
    await settings.save()
    return settings
  }
}

export const settingsService = new SettingsService()
