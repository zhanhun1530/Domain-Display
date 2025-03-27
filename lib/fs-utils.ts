/**
 * 文件系统工具 - 用于服务端操作JSON数据文件
 */

import fs from "fs";
import path from "path";
import { promises as fsPromises } from "fs";

// 数据目录路径
const DATA_DIR = path.join(process.cwd(), "data");

/**
 * 确保数据目录存在
 */
export async function ensureDataDir(): Promise<void> {
  try {
    await fsPromises.access(DATA_DIR);
  } catch (error) {
    // 目录不存在，创建它
    await fsPromises.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * 从JSON文件读取数据
 * @param filename 文件名
 * @param defaultValue 默认值，如果文件不存在或读取失败
 */
export async function readJsonFile<T>(filename: string, defaultValue: T): Promise<T> {
  try {
    // 确保目录存在
    await ensureDataDir();
    
    const filePath = path.join(DATA_DIR, filename);
    
    // 检查文件是否存在
    try {
      await fsPromises.access(filePath);
    } catch (error) {
      // 文件不存在，返回默认值
      return defaultValue;
    }
    
    // 读取文件内容
    const data = await fsPromises.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`读取文件 ${filename} 失败:`, error);
    return defaultValue;
  }
}

/**
 * 将数据写入JSON文件
 * @param filename 文件名
 * @param data 要写入的数据
 */
export async function writeJsonFile<T>(filename: string, data: T): Promise<boolean> {
  try {
    // 确保目录存在
    await ensureDataDir();
    
    const filePath = path.join(DATA_DIR, filename);
    
    // 将数据转换为格式化的JSON字符串
    const jsonData = JSON.stringify(data, null, 2);
    
    // 写入文件
    await fsPromises.writeFile(filePath, jsonData, "utf-8");
    
    return true;
  } catch (error) {
    console.error(`写入文件 ${filename} 失败:`, error);
    return false;
  }
}

/**
 * 同步读取JSON文件
 * @param filename 文件名
 * @param defaultValue 默认值，如果文件不存在或读取失败
 */
export function readJsonFileSync<T>(filename: string, defaultValue: T): T {
  try {
    // 确保目录存在
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    const filePath = path.join(DATA_DIR, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    
    // 读取文件内容
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`同步读取文件 ${filename} 失败:`, error);
    return defaultValue;
  }
}

/**
 * 同步写入JSON文件
 * @param filename 文件名
 * @param data 要写入的数据
 */
export function writeJsonFileSync<T>(filename: string, data: T): boolean {
  try {
    // 确保目录存在
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    const filePath = path.join(DATA_DIR, filename);
    
    // 将数据转换为格式化的JSON字符串
    const jsonData = JSON.stringify(data, null, 2);
    
    // 写入文件
    fs.writeFileSync(filePath, jsonData, "utf-8");
    
    return true;
  } catch (error) {
    console.error(`同步写入文件 ${filename} 失败:`, error);
    return false;
  }
}

/**
 * 获取数据目录中的所有JSON文件列表
 */
export async function listJsonFiles(): Promise<string[]> {
  try {
    // 确保目录存在
    await ensureDataDir();
    
    // 读取目录内容
    const files = await fsPromises.readdir(DATA_DIR);
    
    // 只返回JSON文件
    return files.filter(file => file.endsWith(".json"));
  } catch (error) {
    console.error("获取JSON文件列表失败:", error);
    return [];
  }
}

/**
 * 删除JSON文件
 * @param filename 文件名
 */
export async function deleteJsonFile(filename: string): Promise<boolean> {
  try {
    const filePath = path.join(DATA_DIR, filename);
    
    // 检查文件是否存在
    try {
      await fsPromises.access(filePath);
    } catch (error) {
      // 文件不存在，视为删除成功
      return true;
    }
    
    // 删除文件
    await fsPromises.unlink(filePath);
    return true;
  } catch (error) {
    console.error(`删除文件 ${filename} 失败:`, error);
    return false;
  }
} 