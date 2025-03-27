/**
 * 存储服务初始化钩子
 * 用于在API路由中确保存储已初始化
 */

import { initDb } from './db-init';

let initialized = false;

/**
 * 使用存储初始化
 * 确保存储系统已经初始化，这是一个异步包装器
 * @param handler 处理函数，在存储初始化成功后调用
 */
export async function withStorage<T>(handler: () => Promise<T>): Promise<T> {
  // 如果已经初始化过，直接调用处理函数
  if (initialized) {
    return handler();
  }
  
  try {
    // 初始化存储
    console.log('🔄 首次API请求，初始化存储系统...');
    const success = await initDb();
    
    if (!success) {
      throw new Error('存储系统初始化失败');
    }
    
    // 标记为已初始化
    initialized = true;
    console.log('✅ 存储系统初始化成功');
    
    // 调用处理函数
    return handler();
  } catch (error) {
    console.error('❌ 存储系统初始化失败:', error);
    throw new Error(`存储系统初始化失败: ${error instanceof Error ? error.message : String(error)}`);
  }
} 