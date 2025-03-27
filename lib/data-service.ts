/**
 * 数据服务层，封装对数据文件的操作
 */

// 缓存数据，避免频繁API请求
const dataCache = new Map<string, any>();
// 缓存过期时间（毫秒）
const CACHE_EXPIRE_TIME = 5 * 60 * 1000; // 5分钟
// 缓存过期时间戳
const cacheExpireTime = new Map<string, number>();

/**
 * 从服务器读取JSON数据
 * @param filename 文件名
 * @param defaultValue 默认值，如果文件不存在或读取失败
 * @param useCache 是否使用缓存
 */
export async function fetchData<T>(
  filename: string, 
  defaultValue: T,
  useCache: boolean = true
): Promise<T> {
  // 检查缓存
  if (useCache) {
    const now = Date.now();
    const expire = cacheExpireTime.get(filename) || 0;
    
    if (now < expire && dataCache.has(filename)) {
      console.log(`🔄 从缓存获取数据: ${filename}`);
      return dataCache.get(filename) as T;
    }
  }
  
  try {
    console.log(`📥 从服务器获取数据: ${filename}`);
    const response = await fetch(`/api/data?file=${encodeURIComponent(filename)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`❓ 文件不存在: ${filename}, 使用默认值`);
        return defaultValue;
      }
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (useCache) {
      // 更新缓存
      dataCache.set(filename, result.data);
      cacheExpireTime.set(filename, Date.now() + CACHE_EXPIRE_TIME);
    }
    
    return result.data as T;
  } catch (error) {
    console.error(`获取数据失败: ${filename}`, error);
    return defaultValue;
  }
}

/**
 * 保存数据到服务器
 * @param filename 文件名
 * @param data 要保存的数据
 * @param updateCache 是否更新缓存
 */
export async function saveData<T>(
  filename: string, 
  data: T,
  updateCache: boolean = true
): Promise<boolean> {
  try {
    console.log(`📤 保存数据到服务器: ${filename}`);
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        data,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`保存失败: ${response.status} ${response.statusText}`);
    }
    
    if (updateCache) {
      // 更新缓存
      dataCache.set(filename, data);
      cacheExpireTime.set(filename, Date.now() + CACHE_EXPIRE_TIME);
    }
    
    return true;
  } catch (error) {
    console.error(`保存数据失败: ${filename}`, error);
    return false;
  }
}

/**
 * 删除数据文件
 * @param filename 文件名
 */
export async function deleteData(filename: string): Promise<boolean> {
  try {
    console.log(`🗑️ 删除数据文件: ${filename}`);
    const response = await fetch(`/api/data?file=${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`删除失败: ${response.status} ${response.statusText}`);
    }
    
    // 清除缓存
    dataCache.delete(filename);
    cacheExpireTime.delete(filename);
    
    return true;
  } catch (error) {
    console.error(`删除数据失败: ${filename}`, error);
    return false;
  }
}

/**
 * 获取所有JSON文件列表
 */
export async function listDataFiles(): Promise<string[]> {
  try {
    console.log('📋 获取数据文件列表');
    const response = await fetch('/api/data');
    
    if (!response.ok) {
      throw new Error(`获取文件列表失败: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.files || [];
  } catch (error) {
    console.error('获取数据文件列表失败', error);
    return [];
  }
}

/**
 * 清除指定文件的缓存
 * @param filename 文件名，如果为空则清除所有缓存
 */
export function clearCache(filename?: string): void {
  if (filename) {
    dataCache.delete(filename);
    cacheExpireTime.delete(filename);
    console.log(`🧹 清除缓存: ${filename}`);
  } else {
    dataCache.clear();
    cacheExpireTime.clear();
    console.log('🧹 清除所有缓存');
  }
}

/**
 * 检查缓存是否存在且有效
 * @param filename 文件名
 */
export function isCacheValid(filename: string): boolean {
  const now = Date.now();
  const expire = cacheExpireTime.get(filename) || 0;
  return now < expire && dataCache.has(filename);
} 