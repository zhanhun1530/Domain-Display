/**
 * 存储工厂
 * 用于根据环境选择合适的存储实现
 */

import * as jsonStorage from './adapters/json-storage';
import * as sqliteService from './sqlite-service';

// 确定当前环境
const isVercel = process.env.VERCEL === '1' || process.env.IS_VERCEL === 'true';
const storageType = isVercel ? 'json' : (process.env.DATA_STORAGE_TYPE || 'sqlite');

console.log(`🔄 存储类型: ${storageType} ${isVercel ? '(Vercel环境)' : ''}`);

/**
 * 获取认证信息
 */
export async function getAuth() {
  if (storageType === 'json') {
    return await jsonStorage.getAuth();
  } else {
    return await sqliteService.getPassword();
  }
}

/**
 * 更新认证信息
 */
export async function updateAuth(password: string, lastUpdated: number, version?: string) {
  if (storageType === 'json') {
    return await jsonStorage.updateAuth(password, lastUpdated, version);
  } else {
    return await sqliteService.savePassword({ 
      password, 
      lastUpdated, 
      version: version || '' // 提供默认值，避免undefined
    });
  }
}

/**
 * 获取所有域名
 */
export async function getDomains() {
  if (storageType === 'json') {
    return await jsonStorage.getDomains();
  } else {
    return await sqliteService.getDomains();
  }
}

/**
 * 批量更新域名
 */
export async function updateDomains(domains: any[]) {
  if (storageType === 'json') {
    return await jsonStorage.updateDomains(domains);
  } else {
    return await sqliteService.saveDomains(domains);
  }
}

/**
 * 获取所有已售域名
 */
export async function getSoldDomains() {
  if (storageType === 'json') {
    return await jsonStorage.getSoldDomains();
  } else {
    return await sqliteService.getSoldDomains();
  }
}

/**
 * 批量更新已售域名
 */
export async function updateSoldDomains(domains: any[]) {
  if (storageType === 'json') {
    return await jsonStorage.updateSoldDomains(domains);
  } else {
    return await sqliteService.saveSoldDomains(domains);
  }
}

/**
 * 获取所有友情链接
 */
export async function getFriendlyLinks() {
  if (storageType === 'json') {
    return await jsonStorage.getFriendlyLinks();
  } else {
    return await sqliteService.getFriendlyLinks();
  }
}

/**
 * 批量更新友情链接
 */
export async function updateFriendlyLinks(links: any[]) {
  if (storageType === 'json') {
    return await jsonStorage.updateFriendlyLinks(links);
  } else {
    return await sqliteService.saveFriendlyLinks(links);
  }
}

/**
 * 获取网站设置
 */
export async function getSiteSetting(key: string) {
  if (storageType === 'json') {
    return await jsonStorage.getSiteSetting(key);
  } else {
    return await sqliteService.getSetting(key);
  }
}

/**
 * 更新网站设置
 */
export async function updateSiteSetting(key: string, value: string) {
  if (storageType === 'json') {
    return await jsonStorage.updateSiteSetting(key, value);
  } else {
    return await sqliteService.saveSetting(key, value);
  }
}

/**
 * 获取所有网站设置
 */
export async function getAllSiteSettings() {
  if (storageType === 'json') {
    return await jsonStorage.getAllSiteSettings();
  } else {
    return await sqliteService.getAllSettings();
  }
}

/**
 * 批量更新网站设置
 */
export async function updateAllSiteSettings(settingsObj: Record<string, string>) {
  if (storageType === 'json') {
    return await jsonStorage.updateAllSiteSettings(settingsObj);
  } else {
    return await sqliteService.saveAllSettings(settingsObj);
  }
}

/**
 * 获取所有注册商
 */
export async function getRegistrars() {
  if (storageType === 'json') {
    return await jsonStorage.getRegistrars();
  } else {
    return await sqliteService.getRegistrars();
  }
}

/**
 * 批量更新注册商
 */
export async function updateRegistrars(registrars: any[]) {
  if (storageType === 'json') {
    return await jsonStorage.updateRegistrars(registrars);
  } else {
    return await sqliteService.saveRegistrars(registrars);
  }
} 