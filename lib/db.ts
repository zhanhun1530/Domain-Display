import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

// 确保数据库目录存在
const dbDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// 数据库文件路径
const dbPath = path.join(dbDir, 'domains.db')

// 创建数据库连接
let db: Database.Database | null = null
let insertDomain: any = () => {}
let insertSoldDomain: any = () => {}
let insertFriendlyLink: any = () => {}
let insertSiteSetting: any = () => {}
let insertAuth: any = () => {}
let getAllDomains: any = { all: () => [] }
let getAllSoldDomains: any = { all: () => [] }
let getAllFriendlyLinks: any = { all: () => [] }
let getSiteSetting: any = () => {}
let getAuth: any = () => {}
let deleteDomain: any = () => {}
let deleteSoldDomain: any = () => {}
let deleteFriendlyLink: any = () => {}

// 确保只在服务器端初始化数据库
if (typeof window === 'undefined') {
  db = new Database(dbPath)

  // 初始化数据库表
  if (process.env.NODE_ENV !== 'development' || !fs.existsSync(dbPath)) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS domains (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        extension TEXT NOT NULL,
        status TEXT NOT NULL,
        registrar TEXT,
        registrarIcon TEXT,
        registrationTime TEXT,
        expirationTime TEXT,
        purchaseUrl TEXT,
        soldTo TEXT,
        soldDate TEXT
      );

      CREATE TABLE IF NOT EXISTS sold_domains (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        extension TEXT NOT NULL,
        status TEXT NOT NULL,
        registrar TEXT,
        registrarIcon TEXT,
        registrationTime TEXT,
        expirationTime TEXT,
        purchaseUrl TEXT,
        soldTo TEXT,
        soldDate TEXT
      );

      CREATE TABLE IF NOT EXISTS friendly_links (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        description TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS auth (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `)
  }

  // 准备语句
  insertDomain = db.prepare(`
    INSERT OR REPLACE INTO domains (
      id, name, extension, status, registrar, registrarIcon,
      registrationTime, expirationTime, purchaseUrl, soldTo, soldDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertSoldDomain = db.prepare(`
    INSERT OR REPLACE INTO sold_domains (
      id, name, extension, status, registrar, registrarIcon,
      registrationTime, expirationTime, purchaseUrl, soldTo, soldDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertFriendlyLink = db.prepare(`
    INSERT OR REPLACE INTO friendly_links (
      id, name, url, description
    ) VALUES (?, ?, ?, ?)
  `)

  insertSiteSetting = db.prepare(`
    INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)
  `)

  insertAuth = db.prepare(`
    INSERT OR REPLACE INTO auth (key, value) VALUES (?, ?)
  `)

  // 查询语句
  getAllDomains = db.prepare('SELECT * FROM domains')
  getAllSoldDomains = db.prepare('SELECT * FROM sold_domains')
  getAllFriendlyLinks = db.prepare('SELECT * FROM friendly_links')
  getSiteSetting = db.prepare('SELECT value FROM site_settings WHERE key = ?')
  getAuth = db.prepare('SELECT value FROM auth WHERE key = ?')

  // 删除语句
  deleteDomain = db.prepare('DELETE FROM domains WHERE id = ?')
  deleteSoldDomain = db.prepare('DELETE FROM sold_domains WHERE id = ?')
  deleteFriendlyLink = db.prepare('DELETE FROM friendly_links WHERE id = ?')
}

export {
  db,
  insertDomain,
  insertSoldDomain,
  insertFriendlyLink,
  insertSiteSetting,
  insertAuth,
  getAllDomains,
  getAllSoldDomains,
  getAllFriendlyLinks,
  getSiteSetting,
  getAuth,
  deleteDomain,
  deleteSoldDomain,
  deleteFriendlyLink,
} 