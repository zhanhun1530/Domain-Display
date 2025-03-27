/**
 * SQLite数据库工具 - 提供数据库连接和操作
 */

import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';

// 检查是否在Vercel环境中运行
const isVercel = process.env.VERCEL === '1' || process.env.IS_VERCEL === 'true';

// 动态导入better-sqlite3，只在服务器端运行且不在Vercel环境中
let Database: any = null;
if (typeof window === 'undefined' && !isVercel) {
  // 服务器端环境且不在Vercel中
  try {
    // @ts-ignore
    Database = require('better-sqlite3');
    console.log('✅ better-sqlite3模块加载成功(sqlite-db)');
  } catch (error) {
    console.error('❌ 无法加载better-sqlite3模块(sqlite-db):', error);
  }
} else if (isVercel) {
  console.log('⚠️ 在Vercel环境中运行，SQLite模块已禁用');
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

/**
 * 确保数据目录存在
 */
async function ensureDataDir(): Promise<void> {
  // 在Vercel中跳过目录检查
  if (isVercel) {
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
  
  // 权限验证可以省略，因为数据库操作本身会验证
}

/**
 * 获取数据库连接
 */
export function getDbConnection() {
  // 检查环境
  if (typeof window !== 'undefined') {
    console.warn('SQLite操作只能在服务器端执行');
    return null;
  }
  
  // 在Vercel环境中，不使用SQLite
  if (isVercel) {
    console.warn('在Vercel环境中不支持SQLite操作');
    return null;
  }
  
  // 检查模块是否加载成功
  if (!Database) {
    console.error('无法获取数据库连接：better-sqlite3模块未加载');
    return null;
  }
  
  // 确保数据目录存在
  if (!fs.existsSync(DATA_DIR)) {
    console.log(`🔄 数据目录不存在，正在创建: ${DATA_DIR}`);
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log(`✅ 数据目录创建成功: ${DATA_DIR}`);
    } catch (error) {
      console.error(`❌ 创建数据目录失败: ${DATA_DIR}`, error);
      return null;
    }
  }
  
  try {
    console.log(`🔄 正在连接到数据库: ${DB_FILE}`);
    
    // 创建数据库连接
    const db = new Database(DB_FILE, DB_OPTIONS);
    
    // 启用外键约束
    db.pragma('foreign_keys = ON');
    
    console.log(`✅ 数据库连接成功: ${DB_FILE}`);
    return db;
  } catch (error: any) {
    console.error(`❌ 获取数据库连接失败: ${DB_FILE}`, error);
    console.error(`错误详情: ${error.message}`);
    
    // 检查数据库文件权限
    try {
      if (fs.existsSync(DB_FILE)) {
        const stats = fs.statSync(DB_FILE);
        console.log(`数据库文件状态: 权限=${stats.mode.toString(8)}`);
      } else {
        console.log(`数据库文件不存在: ${DB_FILE}`);
      }
    } catch (statError) {
      console.log(`无法检查数据库文件状态: ${DB_FILE}`);
    }
    
    // 尝试删除损坏的数据库文件并重新创建
    try {
      if (fs.existsSync(DB_FILE)) {
        // 备份损坏的文件
        const backupFile = `${DB_FILE}.${Date.now()}.bak`;
        fs.copyFileSync(DB_FILE, backupFile);
        console.log(`已备份现有数据库文件: ${backupFile}`);
        
        // 删除损坏文件
        fs.unlinkSync(DB_FILE);
        console.log(`已删除现有数据库文件，将重新创建`);
        
        // 重新尝试创建
        const db = new Database(DB_FILE, DB_OPTIONS);
        db.pragma('foreign_keys = ON');
        console.log(`✅ 数据库重新创建成功: ${DB_FILE}`);
        return db;
      }
    } catch (recreateError) {
      console.error(`尝试重建数据库失败:`, recreateError);
    }
    
    throw new Error(`无法连接到数据库: ${error.message}`);
  }
}

/**
 * 初始化数据库表结构
 */
export function initDatabase() {
  // 在Vercel环境中，返回而不执行任何操作
  if (isVercel) {
    console.log('⚠️ 在Vercel环境中运行，跳过SQLite数据库初始化');
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
    db.exec('BEGIN TRANSACTION;');
    
    // 创建认证表
    db.exec(`
      CREATE TABLE IF NOT EXISTS auth (
        id INTEGER PRIMARY KEY,
        password TEXT NOT NULL,
        last_updated INTEGER NOT NULL,
        version TEXT
      );
    `);
    console.log('✅ 创建auth表成功');
    
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
    console.log('✅ 创建registrars表成功');
    
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
    console.log('✅ 创建domains表成功');
    
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
    console.log('✅ 创建sold_domains表成功');
    
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
    console.log('✅ 创建friendly_links表成功');
    
    // 创建网站设置表
    db.exec(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    console.log('✅ 创建site_settings表成功');
    
    // 提交事务
    db.exec('COMMIT;');
    
    console.log('✅ 数据库表初始化完成');
  } catch (error) {
    // 回滚事务
    try {
      db.exec('ROLLBACK;');
    } catch (rollbackError) {
      console.error('❌ 回滚事务失败:', rollbackError);
    }
    
    console.error('❌ 初始化数据库失败:', error);
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
  if (!db) return;
  
  try {
    db.close();
    console.log('✅ 数据库连接已关闭');
  } catch (error) {
    console.error('关闭数据库连接失败:', error);
  }
} 