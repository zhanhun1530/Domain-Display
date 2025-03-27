/**
 * 数据库初始化和数据迁移工具
 */

import { initDatabase } from './sqlite-db';
import { readJsonFile } from './fs-utils';
import { 
  saveDomains, 
  saveSoldDomains, 
  saveFriendlyLinks,
  savePassword,
  saveAllSettings 
} from './sqlite-service';
import { getPasswordFromLocal } from './password-manager';

// 数据文件路径
const DOMAINS_FILENAME = "domains.json";
const SOLD_DOMAINS_FILENAME = "sold-domains.json";
const FRIENDLY_LINKS_FILENAME = "friendly-links.json";
const SITE_SETTINGS_FILENAME = "site-settings.json";

/**
 * 初始化数据库并迁移JSON数据
 */
export async function initDatabaseAndMigrateData() {
  console.log('开始初始化数据库和迁移数据...');
  
  try {
    // 初始化数据库表结构
    initDatabase();
    
    // 迁移域名数据
    await migrateDomains();
    
    // 迁移已售域名数据
    await migrateSoldDomains();
    
    // 迁移友情链接数据
    await migrateFriendlyLinks();
    
    // 迁移密码数据
    await migratePassword();
    
    // 迁移网站设置
    await migrateSiteSettings();
    
    console.log('✅ 数据库初始化和数据迁移完成');
    return true;
  } catch (error) {
    console.error('❌ 数据库初始化或数据迁移失败:', error);
    return false;
  }
}

/**
 * 迁移域名数据
 */
async function migrateDomains() {
  console.log('迁移域名数据...');
  
  try {
    // 从JSON文件读取数据
    const domains = await readJsonFile(DOMAINS_FILENAME, []);
    
    if (!domains || domains.length === 0) {
      console.log('没有域名数据需要迁移');
      return true;
    }
    
    // 添加时间戳
    const now = Date.now();
    const domainsWithTimestamps = domains.map(domain => ({
      ...domain,
      createdAt: now,
      updatedAt: now
    }));
    
    // 保存到SQLite
    const result = saveDomains(domainsWithTimestamps);
    
    if (result) {
      console.log(`✅ 成功迁移 ${domains.length} 个域名数据`);
    } else {
      console.error('❌ 域名数据迁移失败');
    }
    
    return result;
  } catch (error) {
    console.error('域名数据迁移过程中发生错误:', error);
    return false;
  }
}

/**
 * 迁移已售域名数据
 */
async function migrateSoldDomains() {
  console.log('迁移已售域名数据...');
  
  try {
    // 从JSON文件读取数据
    const soldDomains = await readJsonFile(SOLD_DOMAINS_FILENAME, []);
    
    if (!soldDomains || soldDomains.length === 0) {
      console.log('没有已售域名数据需要迁移');
      return true;
    }
    
    // 添加时间戳
    const now = Date.now();
    const domainsWithTimestamps = soldDomains.map(domain => ({
      ...domain,
      createdAt: now,
      updatedAt: now
    }));
    
    // 保存到SQLite
    const result = saveSoldDomains(domainsWithTimestamps);
    
    if (result) {
      console.log(`✅ 成功迁移 ${soldDomains.length} 个已售域名数据`);
    } else {
      console.error('❌ 已售域名数据迁移失败');
    }
    
    return result;
  } catch (error) {
    console.error('已售域名数据迁移过程中发生错误:', error);
    return false;
  }
}

/**
 * 迁移友情链接数据
 */
async function migrateFriendlyLinks() {
  console.log('迁移友情链接数据...');
  
  try {
    // 从JSON文件读取数据
    const links = await readJsonFile(FRIENDLY_LINKS_FILENAME, []);
    
    if (!links || links.length === 0) {
      console.log('没有友情链接数据需要迁移');
      return true;
    }
    
    // 添加时间戳
    const now = Date.now();
    const linksWithTimestamps = links.map(link => ({
      ...link,
      createdAt: now,
      updatedAt: now
    }));
    
    // 保存到SQLite
    const result = saveFriendlyLinks(linksWithTimestamps);
    
    if (result) {
      console.log(`✅ 成功迁移 ${links.length} 个友情链接数据`);
    } else {
      console.error('❌ 友情链接数据迁移失败');
    }
    
    return result;
  } catch (error) {
    console.error('友情链接数据迁移过程中发生错误:', error);
    return false;
  }
}

/**
 * 迁移密码数据
 */
async function migratePassword() {
  console.log('迁移密码数据...');
  
  try {
    // 从localStorage获取密码
    const password = getPasswordFromLocal();
    
    // 创建密码数据对象
    const passwordData = {
      password,
      lastUpdated: Date.now(),
      version: "1.0"
    };
    
    // 保存到SQLite
    const result = savePassword(passwordData);
    
    if (result) {
      console.log('✅ 成功迁移密码数据');
    } else {
      console.error('❌ 密码数据迁移失败');
    }
    
    return result;
  } catch (error) {
    console.error('密码数据迁移过程中发生错误:', error);
    return false;
  }
}

/**
 * 迁移网站设置
 */
async function migrateSiteSettings() {
  console.log('迁移网站设置数据...');
  
  try {
    // 从JSON文件读取数据
    const settings = await readJsonFile(SITE_SETTINGS_FILENAME, {});
    
    if (!settings || Object.keys(settings).length === 0) {
      console.log('没有网站设置数据需要迁移');
      return true;
    }
    
    // 将设置对象转换为字符串值的记录
    const stringSettings: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === 'object') {
        stringSettings[key] = JSON.stringify(value);
      } else {
        stringSettings[key] = String(value);
      }
    }
    
    // 保存到SQLite
    const result = saveAllSettings(stringSettings);
    
    if (result) {
      console.log(`✅ 成功迁移 ${Object.keys(settings).length} 个网站设置`);
    } else {
      console.error('❌ 网站设置数据迁移失败');
    }
    
    return result;
  } catch (error) {
    console.error('网站设置数据迁移过程中发生错误:', error);
    return false;
  }
} 