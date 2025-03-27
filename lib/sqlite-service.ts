/**
 * SQLite数据服务层 - 提供对数据的存取操作
 */

import { getDbConnection, closeDb } from './sqlite-db';
import type Database from 'better-sqlite3';

// 密码数据类型
export interface PasswordData {
  password: string;
  lastUpdated: number;
  version: string;
}

/**
 * 从数据库获取密码信息
 */
export function getPassword(): PasswordData | null {
  const db = getDbConnection();
  
  try {
    const row = db.prepare('SELECT password, last_updated as lastUpdated, version FROM auth WHERE id = 1').get();
    return row as PasswordData || null;
  } catch (error) {
    console.error('从数据库获取密码失败:', error);
    return null;
  } finally {
    closeDb(db);
  }
}

/**
 * 保存密码到数据库
 */
export function savePassword(passwordData: PasswordData): boolean {
  const db = getDbConnection();
  
  try {
    // 开始事务
    const transaction = db.transaction(() => {
      // 检查是否已存在记录
      const existingRow = db.prepare('SELECT id FROM auth WHERE id = 1').get();
      
      if (existingRow) {
        // 更新现有记录
        db.prepare(`
          UPDATE auth 
          SET password = ?, last_updated = ?, version = ?
          WHERE id = 1
        `).run(passwordData.password, passwordData.lastUpdated, passwordData.version);
      } else {
        // 插入新记录
        db.prepare(`
          INSERT INTO auth (id, password, last_updated, version)
          VALUES (1, ?, ?, ?)
        `).run(passwordData.password, passwordData.lastUpdated, passwordData.version);
      }
    });
    
    // 执行事务
    transaction();
    
    console.log('✅ 密码已成功保存到数据库');
    return true;
  } catch (error) {
    console.error('保存密码到数据库失败:', error);
    return false;
  } finally {
    closeDb(db);
  }
}

// 域名数据类型
export interface Domain {
  id?: number;
  name: string;
  status: 'available' | 'sold' | 'active';
  price?: number;
  category?: string;
  description?: string;
  registrar?: string;
  featured?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * 获取域名列表
 */
export function getDomains(): Domain[] {
  const db = getDbConnection();
  
  try {
    const rows = db.prepare(`
      SELECT 
        id, name, status, price, category, description, registrar, 
        featured, created_at as createdAt, updated_at as updatedAt
      FROM domains
      ORDER BY featured DESC, name ASC
    `).all();
    
    return rows as Domain[];
  } catch (error) {
    console.error('从数据库获取域名列表失败:', error);
    return [];
  } finally {
    closeDb(db);
  }
}

/**
 * 保存域名列表
 */
export function saveDomains(domains: Domain[]): boolean {
  const db = getDbConnection();
  
  try {
    // 开始事务
    const transaction = db.transaction(() => {
      // 清空现有数据
      db.prepare('DELETE FROM domains').run();
      
      // 批量插入新数据
      const insert = db.prepare(`
        INSERT INTO domains (
          name, status, price, category, description, registrar, 
          featured, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const now = Date.now();
      
      for (const domain of domains) {
        insert.run(
          domain.name,
          domain.status,
          domain.price || null,
          domain.category || null,
          domain.description || null,
          domain.registrar || null,
          domain.featured ? 1 : 0,
          domain.createdAt || now,
          domain.updatedAt || now
        );
      }
    });
    
    // 执行事务
    transaction();
    
    console.log(`✅ 成功保存 ${domains.length} 个域名到数据库`);
    return true;
  } catch (error) {
    console.error('保存域名到数据库失败:', error);
    return false;
  } finally {
    closeDb(db);
  }
}

// 已售域名数据类型
export interface SoldDomain {
  id?: number;
  name: string;
  price?: number;
  soldDate?: number;
  company?: string;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * 获取已售域名列表
 */
export function getSoldDomains(): SoldDomain[] {
  const db = getDbConnection();
  
  try {
    const rows = db.prepare(`
      SELECT 
        id, name, price, sold_date as soldDate, company,
        created_at as createdAt, updated_at as updatedAt
      FROM sold_domains
      ORDER BY sold_date DESC, name ASC
    `).all();
    
    return rows as SoldDomain[];
  } catch (error) {
    console.error('从数据库获取已售域名列表失败:', error);
    return [];
  } finally {
    closeDb(db);
  }
}

/**
 * 保存已售域名列表
 */
export function saveSoldDomains(domains: SoldDomain[]): boolean {
  const db = getDbConnection();
  
  try {
    // 开始事务
    const transaction = db.transaction(() => {
      // 清空现有数据
      db.prepare('DELETE FROM sold_domains').run();
      
      // 批量插入新数据
      const insert = db.prepare(`
        INSERT INTO sold_domains (
          name, price, sold_date, company, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const now = Date.now();
      
      for (const domain of domains) {
        insert.run(
          domain.name,
          domain.price || null,
          domain.soldDate || null,
          domain.company || null,
          domain.createdAt || now,
          domain.updatedAt || now
        );
      }
    });
    
    // 执行事务
    transaction();
    
    console.log(`✅ 成功保存 ${domains.length} 个已售域名到数据库`);
    return true;
  } catch (error) {
    console.error('保存已售域名到数据库失败:', error);
    return false;
  } finally {
    closeDb(db);
  }
}

// 友情链接数据类型
export interface FriendlyLink {
  id?: number;
  title: string;
  url: string;
  logo?: string;
  description?: string;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * 获取友情链接列表
 */
export function getFriendlyLinks(): FriendlyLink[] {
  const db = getDbConnection();
  
  try {
    const rows = db.prepare(`
      SELECT 
        id, title, url, logo, description,
        created_at as createdAt, updated_at as updatedAt
      FROM friendly_links
      ORDER BY title ASC
    `).all();
    
    return rows as FriendlyLink[];
  } catch (error) {
    console.error('从数据库获取友情链接列表失败:', error);
    return [];
  } finally {
    closeDb(db);
  }
}

/**
 * 保存友情链接列表
 */
export function saveFriendlyLinks(links: FriendlyLink[]): boolean {
  const db = getDbConnection();
  
  try {
    // 开始事务
    const transaction = db.transaction(() => {
      // 清空现有数据
      db.prepare('DELETE FROM friendly_links').run();
      
      // 批量插入新数据
      const insert = db.prepare(`
        INSERT INTO friendly_links (
          title, url, logo, description, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const now = Date.now();
      
      for (const link of links) {
        insert.run(
          link.title,
          link.url,
          link.logo || null,
          link.description || null,
          link.createdAt || now,
          link.updatedAt || now
        );
      }
    });
    
    // 执行事务
    transaction();
    
    console.log(`✅ 成功保存 ${links.length} 个友情链接到数据库`);
    return true;
  } catch (error) {
    console.error('保存友情链接到数据库失败:', error);
    return false;
  } finally {
    closeDb(db);
  }
}

// 网站设置操作
export function getSetting(key: string): string | null {
  const db = getDbConnection();
  
  try {
    const row = db.prepare('SELECT value FROM site_settings WHERE key = ?').get(key);
    return row ? row.value : null;
  } catch (error) {
    console.error(`从数据库获取设置 ${key} 失败:`, error);
    return null;
  } finally {
    closeDb(db);
  }
}

export function saveSetting(key: string, value: string): boolean {
  const db = getDbConnection();
  
  try {
    // 开始事务
    const transaction = db.transaction(() => {
      const now = Date.now();
      
      // 检查是否已存在
      const existing = db.prepare('SELECT id FROM site_settings WHERE key = ?').get(key);
      
      if (existing) {
        // 更新
        db.prepare('UPDATE site_settings SET value = ?, updated_at = ? WHERE key = ?')
          .run(value, now, key);
      } else {
        // 插入
        db.prepare('INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)')
          .run(key, value, now);
      }
    });
    
    // 执行事务
    transaction();
    
    console.log(`✅ 成功保存设置 ${key} 到数据库`);
    return true;
  } catch (error) {
    console.error(`保存设置 ${key} 到数据库失败:`, error);
    return false;
  } finally {
    closeDb(db);
  }
}

// 获取所有设置
export function getAllSettings(): Record<string, string> {
  const db = getDbConnection();
  
  try {
    const rows = db.prepare('SELECT key, value FROM site_settings').all();
    
    // 转换为对象
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    
    return settings;
  } catch (error) {
    console.error('从数据库获取所有设置失败:', error);
    return {};
  } finally {
    closeDb(db);
  }
}

// 保存多个设置
export function saveAllSettings(settings: Record<string, string>): boolean {
  const db = getDbConnection();
  
  try {
    // 开始事务
    const transaction = db.transaction(() => {
      const now = Date.now();
      
      // 更新或插入每个设置
      const insertOrUpdate = db.prepare(`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
      `);
      
      for (const [key, value] of Object.entries(settings)) {
        insertOrUpdate.run(key, value, now);
      }
    });
    
    // 执行事务
    transaction();
    
    console.log(`✅ 成功保存 ${Object.keys(settings).length} 个设置到数据库`);
    return true;
  } catch (error) {
    console.error('保存所有设置到数据库失败:', error);
    return false;
  } finally {
    closeDb(db);
  }
} 