/**
 * SQLite数据库工具 - 提供数据库连接和操作
 */

import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';

// 检查是否在Vercel环境中运行
const isVercel = process.env.VERCEL === '1' || process.env.IS_VERCEL === '1';
const storageType = isVercel ? 'json' : (process.env.DATA_STORAGE_TYPE || 'sqlite');

console.log(`🔄 当前存储类型: ${storageType} ${isVercel ? '(Vercel环境)' : ''}`);

// 动态导入better-sqlite3，只在服务器端运行且不在Vercel环境中
let Database: any = null;
if (typeof window === 'undefined' && !isVercel && storageType === 'sqlite') {
  // 服务器端环境且不在Vercel中
  try {
    // @ts-ignore
    Database = require('better-sqlite3');
    console.log('✅ better-sqlite3模块加载成功(sqlite-db)');
  } catch (error) {
    console.error('❌ 无法加载better-sqlite3模块(sqlite-db):', error);
  }
} else if (isVercel || storageType === 'json') {
  console.log('⚠️ 在Vercel环境或JSON存储模式下运行，SQLite模块已禁用');
}

// 数据库文件路径
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "app-data.db");

// SQLite数据库连接选项
const DB_OPTIONS = { 
  verbose: (message: string) => console.log(`SQLite: ${message}`),
  // 文件不存在时自动创建
  fileMustExist: false,
};

// 数据库连接缓存
let dbConnection: any = null;

/**
 * 确保数据目录存在
 */
async function ensureDataDir(): Promise<void> {
  // 在Vercel中或使用JSON存储时跳过目录检查
  if (isVercel || storageType === 'json') {
    return;
  }
  
  try {
    await fsPromises.access(DATA_DIR);
    console.log(`✅ 数据目录已存在: ${DATA_DIR}`);
  } catch (error) {
    // 目录不存在，创建它
    console.log(`🔄 数据目录不存在，正在创建: ${DATA_DIR}`);
    try {
      await fsPromises.mkdir(DATA_DIR, { recursive: true });
      console.log(`✅ 数据目录创建成功: ${DATA_DIR}`);
    } catch (dirError) {
      console.error(`❌ 创建数据目录失败: ${DATA_DIR}`, dirError);
      throw dirError;
    }
  }
}

/**
 * 获取数据库连接
 */
export function getDbConnection() {
  // 在Vercel中或使用JSON存储时返回null
  if (isVercel || storageType === 'json') {
    return null;
  }
  
  // 如果已经有连接，直接返回
  if (dbConnection) {
    return dbConnection;
  }
  
  // 检查模块是否加载成功
  if (!Database) {
    console.error('❌ 无法获取数据库连接：better-sqlite3模块未加载');
    return null;
  }
  
  try {
    console.log(`🔄 正在连接到数据库: ${DB_FILE}`);
    
    // 确保数据目录存在
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    // 检查数据库文件是否存在
    const dbExists = fs.existsSync(DB_FILE);
    console.log(`📝 数据库文件${dbExists ? '已存在' : '不存在'}: ${DB_FILE}`);
    
    // 创建数据库连接
    dbConnection = new Database(DB_FILE, DB_OPTIONS);
    
    // 启用外键约束
    dbConnection.exec('PRAGMA foreign_keys = ON');
    
    console.log(`✅ 数据库连接成功: ${DB_FILE}`);
    return dbConnection;
  } catch (error) {
    console.error(`❌ 数据库连接失败: ${DB_FILE}`, error);
    return null;
  }
}

/**
 * 关闭数据库连接
 */
export function closeDb(db: any) {
  if (db) {
    try {
      db.close();
      // 如果是缓存的连接，清除缓存
      if (db === dbConnection) {
        dbConnection = null;
      }
      console.log('✅ 数据库连接已关闭');
    } catch (error) {
      console.error('❌ 关闭数据库连接失败:', error);
    }
  }
}

/**
 * 检查表是否存在
 */
function checkTableExists(db: any, tableName: string): boolean {
  try {
    const result = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(tableName);
    return !!result;
  } catch (error) {
    console.error(`❌ 检查表${tableName}是否存在时发生错误:`, error);
    return false;
  }
}

/**
 * 初始化数据库表结构
 */
export function initDatabase() {
  // 在Vercel环境中或使用JSON存储时，返回而不执行任何操作
  if (isVercel || storageType === 'json') {
    console.log('⚠️ 在Vercel环境或JSON存储模式下运行，跳过SQLite数据库初始化');
    return;
  }
  
  // 客户端环境，不执行任何操作
  if (typeof window !== 'undefined') {
    console.warn('数据库初始化只能在服务器端执行');
    return;
  }
  
  // 检查模块是否加载成功
  if (!Database) {
    console.error('❌ 数据库初始化失败：better-sqlite3模块未加载');
    throw new Error('better-sqlite3模块未加载，无法初始化数据库');
  }
  
  console.log('🔄 获取数据库连接...');
  const db = getDbConnection();
  
  if (!db) {
    console.error('❌ 无法获取数据库连接，初始化失败');
    throw new Error('无法获取数据库连接，初始化失败');
  }
  
  try {
    console.log('🔄 开始创建数据库表...');
    
    // 使用事务处理表创建
    const transaction = db.transaction(() => {
      // 创建认证表
      if (!checkTableExists(db, 'auth')) {
        db.exec(`
          CREATE TABLE auth (
            id INTEGER PRIMARY KEY,
            password TEXT NOT NULL,
            last_updated INTEGER NOT NULL,
            version TEXT
          );
        `);
        console.log('✅ 创建auth表成功');
      } else {
        console.log('ℹ️ auth表已存在，跳过创建');
      }
      
      // 创建注册商表
      if (!checkTableExists(db, 'registrars')) {
        db.exec(`
          CREATE TABLE registrars (
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
        console.log('✅ 创建registrars表成功');
      } else {
        console.log('ℹ️ registrars表已存在，跳过创建');
      }
      
      // 创建域名表
      if (!checkTableExists(db, 'domains')) {
        db.exec(`
          CREATE TABLE domains (
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
        console.log('✅ 创建domains表成功');
      } else {
        console.log('ℹ️ domains表已存在，跳过创建');
      }
      
      // 创建已售域名表
      if (!checkTableExists(db, 'sold_domains')) {
        db.exec(`
          CREATE TABLE sold_domains (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            price REAL,
            sold_date INTEGER,
            company TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
          );
        `);
        console.log('✅ 创建sold_domains表成功');
      } else {
        console.log('ℹ️ sold_domains表已存在，跳过创建');
      }
      
      // 创建友情链接表
      if (!checkTableExists(db, 'friendly_links')) {
        db.exec(`
          CREATE TABLE friendly_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            url TEXT NOT NULL UNIQUE,
            logo TEXT,
            description TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
          );
        `);
        console.log('✅ 创建friendly_links表成功');
      } else {
        console.log('ℹ️ friendly_links表已存在，跳过创建');
      }
      
      // 创建网站设置表
      if (!checkTableExists(db, 'site_settings')) {
        db.exec(`
          CREATE TABLE site_settings (
            id INTEGER PRIMARY KEY,
            key TEXT NOT NULL UNIQUE,
            value TEXT NOT NULL,
            updated_at INTEGER NOT NULL
          );
        `);
        console.log('✅ 创建site_settings表成功');
      } else {
        console.log('ℹ️ site_settings表已存在，跳过创建');
      }
    });
    
    // 执行事务
    transaction();
    
    // 验证所有表是否创建成功
    const tables = ['auth', 'registrars', 'domains', 'sold_domains', 'friendly_links', 'site_settings'];
    const missingTables = tables.filter(table => !checkTableExists(db, table));
    
    if (missingTables.length > 0) {
      console.error('❌ 以下表未能成功创建:', missingTables);
      throw new Error(`数据库表创建失败: ${missingTables.join(', ')}`);
    }
    
    console.log('✅ 数据库表初始化完成');
  } catch (error) {
    console.error('❌ 初始化数据库失败:', error);
    throw error;
  }
}

/**
 * 检查数据库中的表和数据
 */
export function checkDatabaseContent() {
  const db = getDbConnection();
  if (!db) {
    console.error('❌ 无法获取数据库连接');
    return;
  }

  try {
    // 获取所有表
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('📊 数据库中的表:', tables.map(t => t.name));

    // 检查每个表中的数据
    for (const table of tables) {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
      console.log(`📈 ${table.name} 表中有 ${count.count} 条记录`);
      
      // 显示前5条记录
      const records = db.prepare(`SELECT * FROM ${table.name} LIMIT 5`).all();
      if (records.length > 0) {
        console.log(`📝 ${table.name} 表的前5条记录:`, records);
      }
    }
  } catch (error) {
    console.error('❌ 检查数据库内容时发生错误:', error);
  }
} 