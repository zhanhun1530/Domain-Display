/**
 * 数据库初始化脚本
 * 
 * 此脚本在应用启动时自动运行，确保数据库表结构和必要数据存在
 */

import { initDatabase } from './sqlite-db';

// 初始化数据库
export async function initDb() {
  try {
    console.log('🔄 初始化数据库...');
    
    // 创建所有表结构
    initDatabase();
    
    console.log('✅ 数据库初始化完成');
    return true;
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