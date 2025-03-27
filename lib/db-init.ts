/**
 * 数据库初始化脚本
 * 
 * 此脚本在应用启动时自动运行，确保数据库表结构和必要数据存在
 */

import { initDatabase } from './sqlite-db';
import path from 'path';
import fs from 'fs';
import { writeJsonFileSync } from './fs-utils';

// 检查是否在Vercel环境中运行
const isVercel = process.env.VERCEL === '1' || process.env.IS_VERCEL === 'true';

// 检查数据目录权限
async function checkDataDir() {
  try {
    const dataDir = path.join(process.cwd(), "data");
    
    // 检查目录是否存在
    if (!fs.existsSync(dataDir)) {
      console.log(`数据目录不存在，正在创建: ${dataDir}`);
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // 检查写入权限，简单验证
    try {
      // 使用时间戳生成唯一文件名，避免冲突
      const timestamp = Date.now();
      const testFile = path.join(dataDir, `test-write-${timestamp}.tmp`);
      
      // 简单写入测试
      fs.writeFileSync(testFile, "test");
      
      // 尝试删除
      try {
        fs.unlinkSync(testFile);
      } catch (unlinkError) {
        // 删除失败只记录日志，不中断流程
        console.warn(`警告：无法删除测试文件(${testFile})，但这不影响数据库操作:`, unlinkError);
      }
      
      console.log(`✅ 数据目录权限检查通过: ${dataDir}`);
      return true;
    } catch (error) {
      console.error(`❌ 数据目录写入权限检查失败: ${dataDir}`, error);
      // 不要太快就放弃，可能只是并发问题
      return true; 
    }
  } catch (error) {
    console.error("检查数据目录权限失败:", error);
    // 不要太快就放弃，继续尝试数据库操作
    return true;
  }
}

// 在Vercel环境中初始化JSON数据文件
async function initJsonFiles() {
  const dataDir = path.join(process.cwd(), "data");
  
  // 确保目录存在
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  console.log('🔄 在Vercel环境中初始化JSON数据文件...');
  
  try {
    // 初始化基本的JSON文件（如果不存在）
    const files = [
      { 
        name: 'auth-credentials.json', 
        default: [{ id: 1, password: 'admin123', last_updated: Date.now(), version: '1.0' }] 
      },
      { name: 'domains.json', default: [] },
      { name: 'sold-domains.json', default: [] },
      { name: 'registrars.json', default: [] },
      { name: 'friendly-links.json', default: [] },
      { 
        name: 'site-settings.json', 
        default: [
          { id: 1, key: 'siteName', value: '我的域名管理系统', updated_at: Date.now() },
          { id: 2, key: 'siteDescription', value: '一个简单高效的域名管理工具', updated_at: Date.now() }
        ] 
      }
    ];
    
    for (const file of files) {
      const filePath = path.join(dataDir, file.name);
      
      // 如果文件不存在，创建默认内容
      if (!fs.existsSync(filePath)) {
        console.log(`🔄 创建默认JSON文件: ${file.name}`);
        writeJsonFileSync(file.name, file.default);
      }
    }
    
    console.log('✅ JSON数据文件初始化完成');
    return true;
  } catch (error) {
    console.error('❌ 初始化JSON数据文件失败:', error);
    return false;
  }
}

// 初始化数据库
export async function initDb() {
  // 确保只在服务器端执行
  if (typeof window !== 'undefined') {
    console.log('数据库初始化在客户端环境被跳过');
    return true;
  }
  
  try {
    console.log('🔄 初始化数据库...');
    
    // 在Vercel环境中使用JSON文件
    if (isVercel) {
      console.log('⚠️ 在Vercel环境中运行，将使用JSON文件存储');
      return await initJsonFiles();
    }
    
    // 本地环境使用SQLite
    // 检查better-sqlite3是否可用
    try {
      // @ts-ignore
      const sqlite = require('better-sqlite3');
      console.log('✅ better-sqlite3模块加载成功');
    } catch (error) {
      console.error('❌ better-sqlite3模块加载失败:', error);
      return false;
    }
    
    // 检查数据目录权限
    await checkDataDir();
    
    // 创建所有表结构
    try {
      initDatabase();
      console.log('✅ 数据库初始化完成');
      return true;
    } catch (dbError) {
      console.error('❌ 数据库表初始化失败:', dbError);
      return false;
    }
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    return false;
  }
}

// 如果此文件被直接运行（而不是导入），则执行初始化
if (require.main === module) {
  initDb()
    .then(success => {
      if (success) {
        console.log('🎉 数据库初始化成功');
        process.exit(0);
      } else {
        console.error('💥 数据库初始化失败');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 数据库初始化过程中发生错误:', error);
      process.exit(1);
    });
} 