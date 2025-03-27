/**
 * SQLite数据库工具 - 提供数据库连接和操作
 */

import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';

// 动态导入better-sqlite3，只在服务器端运行
let Database: any = null;
if (typeof window === 'undefined') {
  // 服务器端环境
  try {
    // @ts-ignore
    Database = require('better-sqlite3');
  } catch (error) {
    console.error('无法加载better-sqlite3模块:', error);
  }
}

// 数据库文件路径
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "app-data.db");

/**
 * 确保数据目录存在
 */
async function ensureDataDir(): Promise<void> {
  try {
    await fsPromises.access(DATA_DIR);
  } catch (error) {
    // 目录不存在，创建它
    await fsPromises.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * 获取数据库连接
 */
export function getDbConnection() {
  // 客户端环境，返回null
  if (typeof window !== 'undefined' || !Database) {
    console.warn('SQLite操作只能在服务器端执行');
    return null;
  }
  
  // 确保数据目录存在
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  try {
    // 创建数据库连接
    const db = new Database(DB_FILE, { verbose: console.log });
    
    // 启用外键约束
    db.pragma('foreign_keys = ON');
    
    return db;
  } catch (error: any) {
    console.error('获取数据库连接失败:', error);
    throw new Error(`无法连接到数据库: ${error.message}`);
  }
}

/**
 * 初始化数据库表结构
 */
export function initDatabase() {
  // 客户端环境，不执行任何操作
  if (typeof window !== 'undefined' || !Database) {
    console.warn('数据库初始化只能在服务器端执行');
    return;
  }
  
  const db = getDbConnection();
  
  if (!db) {
    console.error('无法获取数据库连接，初始化失败');
    return;
  }
  
  try {
    // 创建认证表
    db.exec(`
      CREATE TABLE IF NOT EXISTS auth (
        id INTEGER PRIMARY KEY,
        password TEXT NOT NULL,
        last_updated INTEGER NOT NULL,
        version TEXT
      );
    `);
    
    // 创建注册商表
    db.exec(`
      CREATE TABLE IF NOT EXISTS registrars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        website TEXT,
        logo TEXT,
        api_key TEXT,
        description TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    
    // 创建域名表
    db.exec(`
      CREATE TABLE IF NOT EXISTS domains (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL,
        price REAL,
        category TEXT,
        description TEXT,
        registrar TEXT,
        featured INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    
    // 创建已售域名表
    db.exec(`
      CREATE TABLE IF NOT EXISTS sold_domains (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        price REAL,
        sold_date INTEGER,
        company TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    
    // 创建友情链接表
    db.exec(`
      CREATE TABLE IF NOT EXISTS friendly_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        logo TEXT,
        description TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    
    // 创建网站设置表
    db.exec(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    
    console.log('✅ 数据库表初始化完成');
  } catch (error) {
    console.error('初始化数据库失败:', error);
    throw error;
  } finally {
    // 关闭数据库连接
    closeDb(db);
  }
}

/**
 * 关闭数据库连接
 */
export function closeDb(db: any) {
  if (db && typeof db.close === 'function') {
    try {
      db.close();
    } catch (error) {
      console.error('关闭数据库连接失败:', error);
    }
  }
} 