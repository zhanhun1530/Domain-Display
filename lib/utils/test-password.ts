/**
 * 密码更新测试工具
 * 用于测试和排查密码更新相关问题
 */

import logger from '../logger';
import { updatePassword, verifyPassword } from '../password-manager';
import { getAuth, updateAuth } from '../storage-factory';
import { readJsonFile, writeJsonFile } from '../fs-utils';

// 定义Auth数据结构
interface Auth {
  id: number;
  password: string;
  last_updated: number;
  version?: string;
}

// 测试密码数据的存储路径
const AUTH_FILE = "auth-credentials.json";

/**
 * 测试密码更新功能
 */
export async function testPasswordUpdate(testPassword: string = "test123"): Promise<boolean> {
  try {
    logger.info("开始测试密码更新...", "TEST");
    
    // 1. 获取当前存储的密码
    const currentAuth = await getAuth();
    logger.info(`当前存储的密码: ${currentAuth?.password || '无'}`, "TEST");
    
    // 2. 尝试使用新方法更新密码
    logger.info(`尝试更新密码为: ${testPassword}`, "TEST");
    const updateSuccess = await updatePassword(testPassword);
    
    if (updateSuccess) {
      logger.success("密码更新成功", "TEST");
    } else {
      logger.error("密码更新失败", null, "TEST");
      
      // 尝试直接使用存储工厂更新
      logger.info("尝试使用存储工厂直接更新...", "TEST");
      const factorySuccess = await updateAuth(testPassword, Date.now(), "test");
      
      if (factorySuccess) {
        logger.success("通过存储工厂更新成功", "TEST");
      } else {
        logger.error("通过存储工厂更新失败", null, "TEST");
      }
    }
    
    // 3. 验证更新是否成功
    logger.info("验证密码是否已成功更新...", "TEST");
    
    // 先清除缓存，确保从存储中获取最新值
    const verifySuccess = await verifyPassword(testPassword);
    
    if (verifySuccess) {
      logger.success("密码验证成功，更新已生效", "TEST");
      return true;
    } else {
      logger.error("密码验证失败，更新未生效", null, "TEST");
      return false;
    }
  } catch (error) {
    logger.error("测试密码更新过程中发生错误", error, "TEST");
    return false;
  }
}

/**
 * 直接检查JSON存储中的密码文件
 */
export async function inspectPasswordFile(): Promise<void> {
  try {
    logger.info("检查密码文件...", "TEST");
    const authData = await readJsonFile<Auth[]>(AUTH_FILE, []);
    
    if (Array.isArray(authData) && authData.length > 0) {
      logger.info(`找到${authData.length}条认证记录`, "TEST");
      logger.debug(JSON.stringify(authData, null, 2), "TEST");
    } else {
      logger.warn("未找到认证记录或记录为空", "TEST");
    }
  } catch (error) {
    logger.error("检查密码文件失败", error, "TEST");
  }
}

/**
 * 直接写入密码到JSON文件（仅用于修复）
 */
export async function forceUpdatePassword(password: string): Promise<boolean> {
  try {
    logger.info(`强制更新密码为: ${password}`, "TEST");
    
    const authData = await readJsonFile<Auth[]>(AUTH_FILE, []);
    const now = Date.now();
    
    if (Array.isArray(authData) && authData.length > 0) {
      // 更新现有记录
      authData[0] = {
        ...authData[0],
        password,
        last_updated: now,
      };
    } else {
      // 创建新记录
      authData.push({
        id: 1,
        password,
        last_updated: now,
        version: "force-update",
      });
    }
    
    const success = await writeJsonFile(AUTH_FILE, authData);
    
    if (success) {
      logger.success("密码已强制更新", "TEST");
    } else {
      logger.error("强制更新密码失败", null, "TEST");
    }
    
    return success;
  } catch (error) {
    logger.error("强制更新密码时发生错误", error, "TEST");
    return false;
  }
}

/**
 * 导出所有测试函数
 */
export default {
  testPasswordUpdate,
  inspectPasswordFile,
  forceUpdatePassword,
}; 