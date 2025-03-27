/**
 * JSON存储适配器
 * 用于在Vercel环境中代替SQLite存储数据
 */

import { readJsonFile, writeJsonFile } from "../fs-utils";

// 数据模型接口
interface Auth {
  id: number;
  password: string;
  last_updated: number;
  version?: string;
}

interface Domain {
  id: number;
  name: string;
  status: string;
  price?: number;
  category?: string;
  description?: string;
  registrar?: string;
  featured?: number;
  created_at: number;
  updated_at: number;
}

interface SoldDomain {
  id: number;
  name: string;
  price?: number;
  sold_date?: number;
  company?: string;
  created_at: number;
  updated_at: number;
}

interface Registrar {
  id: number;
  name: string;
  website?: string;
  logo?: string;
  api_key?: string;
  description?: string;
  created_at: number;
  updated_at: number;
}

interface FriendlyLink {
  id: number;
  title: string;
  url: string;
  logo?: string;
  description?: string;
  created_at: number;
  updated_at: number;
}

interface SiteSetting {
  id: number;
  key: string;
  value: string;
  updated_at: number;
}

// JSON文件名常量
const AUTH_FILE = "auth-credentials.json";
const DOMAINS_FILE = "domains.json";
const SOLD_DOMAINS_FILE = "sold-domains.json";
const REGISTRARS_FILE = "registrars.json";
const FRIENDLY_LINKS_FILE = "friendly-links.json";
const SITE_SETTINGS_FILE = "site-settings.json";

/**
 * 获取认证信息
 */
export async function getAuth() {
  const authData = await readJsonFile<Auth[]>(AUTH_FILE, []);
  
  if (authData.length === 0) {
    return null;
  }
  
  // 找到id为1的记录
  const auth = authData.find(a => a.id === 1);
  if (!auth) return null;
  
  return {
    password: auth.password,
    lastUpdated: auth.last_updated,
    version: auth.version
  };
}

/**
 * 更新认证信息
 */
export async function updateAuth(password: string, lastUpdated: number, version?: string) {
  try {
    if (!password) {
      console.error("JSON存储: 无法更新空密码");
      return false;
    }
    
    console.log("JSON存储: 读取认证记录...");
    let authData = await readJsonFile<Auth[]>(AUTH_FILE, []);
    const now = Date.now();
    
    // 检查是否已存在记录
    const index = authData.findIndex(a => a.id === 1);
    
    if (index >= 0) {
      // 更新现有记录
      console.log("JSON存储: 更新现有认证记录");
      authData[index] = {
        ...authData[index],
        password,
        last_updated: lastUpdated,
        version: version || '',
      };
    } else {
      // 添加新记录
      console.log("JSON存储: 创建新认证记录");
      authData.push({
        id: 1,
        password,
        last_updated: lastUpdated,
        version: version || '',
      });
    }
    
    // 保存到文件
    console.log("JSON存储: 保存认证数据到文件");
    const success = await writeJsonFile(AUTH_FILE, authData);
    
    if (success) {
      console.log("JSON存储: 认证数据保存成功");
    } else {
      console.error("JSON存储: 认证数据保存失败");
    }
    
    return success;
  } catch (error) {
    console.error("JSON存储: 更新认证数据时发生错误:", error);
    return false;
  }
}

/**
 * 获取所有域名
 */
export async function getDomains() {
  const domains = await readJsonFile<Domain[]>(DOMAINS_FILE, []);
  return domains;
}

/**
 * 批量更新域名
 */
export async function updateDomains(domains: Domain[]) {
  // 确保每个记录都有id、created_at和updated_at
  const now = Date.now();
  const domainsWithMeta = domains.map((domain, index) => ({
    ...domain,
    id: domain.id || index + 1,
    created_at: domain.created_at || now,
    updated_at: now
  }));
  
  // 保存到文件
  return await writeJsonFile(DOMAINS_FILE, domainsWithMeta);
}

/**
 * 获取所有已售域名
 */
export async function getSoldDomains() {
  const soldDomains = await readJsonFile<SoldDomain[]>(SOLD_DOMAINS_FILE, []);
  return soldDomains;
}

/**
 * 批量更新已售域名
 */
export async function updateSoldDomains(domains: SoldDomain[]) {
  // 确保每个记录都有id、created_at和updated_at
  const now = Date.now();
  const domainsWithMeta = domains.map((domain, index) => ({
    ...domain,
    id: domain.id || index + 1,
    created_at: domain.created_at || now,
    updated_at: now
  }));
  
  // 保存到文件
  return await writeJsonFile(SOLD_DOMAINS_FILE, domainsWithMeta);
}

/**
 * 获取所有友情链接
 */
export async function getFriendlyLinks() {
  const links = await readJsonFile<FriendlyLink[]>(FRIENDLY_LINKS_FILE, []);
  return links;
}

/**
 * 批量更新友情链接
 */
export async function updateFriendlyLinks(links: FriendlyLink[]) {
  // 确保每个记录都有id、created_at和updated_at
  const now = Date.now();
  const linksWithMeta = links.map((link, index) => ({
    ...link,
    id: link.id || index + 1,
    created_at: link.created_at || now,
    updated_at: now
  }));
  
  // 保存到文件
  return await writeJsonFile(FRIENDLY_LINKS_FILE, linksWithMeta);
}

/**
 * 获取网站设置
 */
export async function getSiteSetting(key: string) {
  const settings = await readJsonFile<SiteSetting[]>(SITE_SETTINGS_FILE, []);
  const setting = settings.find(s => s.key === key);
  return setting ? setting.value : null;
}

/**
 * 更新网站设置
 */
export async function updateSiteSetting(key: string, value: string) {
  let settings = await readJsonFile<SiteSetting[]>(SITE_SETTINGS_FILE, []);
  const now = Date.now();
  
  // 查找是否已存在此key
  const index = settings.findIndex(s => s.key === key);
  
  if (index >= 0) {
    // 更新已有设置
    settings[index] = {
      ...settings[index],
      value,
      updated_at: now
    };
  } else {
    // 添加新设置
    settings.push({
      id: settings.length + 1,
      key,
      value,
      updated_at: now
    });
  }
  
  // 保存到文件
  return await writeJsonFile(SITE_SETTINGS_FILE, settings);
}

/**
 * 获取所有网站设置
 */
export async function getAllSiteSettings() {
  const settings = await readJsonFile<SiteSetting[]>(SITE_SETTINGS_FILE, []);
  // 转换为键值对
  return settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * 批量更新网站设置
 */
export async function updateAllSiteSettings(settingsObj: Record<string, string>) {
  const now = Date.now();
  let settings = await readJsonFile<SiteSetting[]>(SITE_SETTINGS_FILE, []);
  
  // 将键值对转换为数组
  const newSettings = Object.entries(settingsObj).map(([key, value], index) => {
    // 查找现有设置
    const existing = settings.find(s => s.key === key);
    return {
      id: existing?.id || settings.length + index + 1,
      key,
      value,
      updated_at: now
    };
  });
  
  // 保存到文件
  return await writeJsonFile(SITE_SETTINGS_FILE, newSettings);
}

/**
 * 获取所有注册商
 */
export async function getRegistrars() {
  const registrars = await readJsonFile<Registrar[]>(REGISTRARS_FILE, []);
  return registrars;
}

/**
 * 批量更新注册商
 */
export async function updateRegistrars(registrars: Registrar[]) {
  // 确保每个记录都有id、created_at和updated_at
  const now = Date.now();
  const registrarsWithMeta = registrars.map((registrar, index) => ({
    ...registrar,
    id: registrar.id || index + 1,
    created_at: registrar.created_at || now,
    updated_at: now
  }));
  
  // 保存到文件
  return await writeJsonFile(REGISTRARS_FILE, registrarsWithMeta);
} 