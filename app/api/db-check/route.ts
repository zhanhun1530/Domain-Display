import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

interface DbTable {
  name: string;
  recordCount?: number;
  columns?: Array<{ name: string; type: string }>;
  sampleRecords?: Record<string, any>[];
  error?: string;
}

interface JsonFileInfo {
  size?: number;
  records?: number;
  sample?: any;
  error?: string;
}

export async function GET() {
  try {
    // 检查数据库文件是否存在
    const dbPath = path.join(process.cwd(), 'data', 'app-data.db');
    const dbExists = fs.existsSync(dbPath);
    const dbSize = dbExists ? fs.statSync(dbPath).size : 0;
    const dbModified = dbExists ? fs.statSync(dbPath).mtime.toISOString() : '';
    
    // 获取数据目录中的文件列表
    const dataDir = path.join(process.cwd(), 'data');
    const files = fs.existsSync(dataDir) 
      ? fs.readdirSync(dataDir).map(file => ({
          name: file,
          size: fs.statSync(path.join(dataDir, file)).size,
          modified: fs.statSync(path.join(dataDir, file)).mtime.toISOString()
        }))
      : [];
      
    // 尝试连接SQLite数据库
    const dbTables: DbTable[] = [];
    let dbInfo = '';
    
    try {
      const sqlite3 = require('better-sqlite3');
      const db = sqlite3(dbPath);
      
      // 获取版本信息
      const version = db.prepare('SELECT sqlite_version() AS version').get();
      dbInfo = `SQLite 版本: ${version.version}`;
      
      // 获取表结构
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{name: string}>;
      
      // 获取每个表的记录数和结构
      tables.forEach(table => {
        try {
          const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as {count: number};
          const columns = db.prepare(`PRAGMA table_info(${table.name})`).all() as Array<{name: string; type: string}>;
          
          // 获取每个表的前5条记录
          const records = db.prepare(`SELECT * FROM ${table.name} LIMIT 5`).all();
          
          dbTables.push({
            name: table.name,
            recordCount: count.count,
            columns: columns.map(col => ({
              name: col.name, 
              type: col.type
            })),
            sampleRecords: records
          });
        } catch (error: any) {
          dbTables.push({
            name: table.name,
            error: `无法获取表信息: ${error.message}`
          });
        }
      });
      
      db.close();
    } catch (dbError: any) {
      console.error('无法连接到SQLite数据库:', dbError);
      dbInfo = `数据库连接错误: ${dbError.message}`;
    }
    
    // 检查 JSON 文件的内容
    const jsonFiles: Record<string, JsonFileInfo> = {};
    files.filter(file => file.name.endsWith('.json')).forEach(file => {
      try {
        const content = fs.readFileSync(path.join(dataDir, file.name), 'utf8');
        const data = JSON.parse(content);
        jsonFiles[file.name] = {
          size: file.size,
          records: Array.isArray(data) ? data.length : 1,
          sample: data
        };
      } catch (error: any) {
        jsonFiles[file.name] = { error: `解析JSON失败: ${error.message}` };
      }
    });
    
    return NextResponse.json({
      message: '数据库和文件系统检查完成',
      database: {
        path: dbPath,
        exists: dbExists,
        size: dbSize,
        modified: dbModified,
        info: dbInfo,
        tables: dbTables
      },
      dataDirectory: {
        path: dataDir,
        exists: fs.existsSync(dataDir),
        files: files
      },
      jsonFiles: jsonFiles,
      environment: {
        isVercel: process.env.VERCEL === '1' || process.env.IS_VERCEL === '1',
        storageType: process.env.DATA_STORAGE_TYPE || 'sqlite',
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error: any) {
    console.error('检查数据库时发生错误:', error);
    return NextResponse.json(
      { 
        error: '检查数据库时发生错误',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 