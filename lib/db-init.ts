/**
 * 数据库初始化脚本
 * 
 * 此脚本在应用启动时自动运行，确保数据库表结构和必要数据存在
 */

import { initDatabase } from './sqlite-db';
import path from 'path';
import fs from 'fs';

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

// 初始化数据库
export async function initDb() {
  // 确保只在服务器端执行
  if (typeof window !== 'undefined') {
    console.log('数据库初始化在客户端环境被跳过');
    return true;
  }
  
  try {
    console.log('🔄 初始化数据库...');
    
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