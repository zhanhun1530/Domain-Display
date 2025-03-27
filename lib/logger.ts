/**
 * 日志工具 - 提供统一的日志记录功能
 */

// 定义日志级别
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// 当前日志级别，可以通过环境变量设置
let currentLogLevel = process.env.LOG_LEVEL 
  ? parseInt(process.env.LOG_LEVEL) 
  : (process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG);

/**
 * 设置日志级别
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

/**
 * 获取当前日志级别
 */
export function getLogLevel(): LogLevel {
  return currentLogLevel;
}

/**
 * 格式化日志消息，添加时间戳和其他信息
 */
function formatMessage(level: string, message: string, context?: string): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}] ` : '';
  return `${timestamp} ${level} ${contextStr}${message}`;
}

/**
 * 记录调试级别日志
 */
export function debug(message: string, context?: string): void {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.log(formatMessage('🔍 DEBUG', message, context));
  }
}

/**
 * 记录信息级别日志
 */
export function info(message: string, context?: string): void {
  if (currentLogLevel <= LogLevel.INFO) {
    console.log(formatMessage('ℹ️ INFO', message, context));
  }
}

/**
 * 记录警告级别日志
 */
export function warn(message: string, context?: string): void {
  if (currentLogLevel <= LogLevel.WARN) {
    console.warn(formatMessage('⚠️ WARN', message, context));
  }
}

/**
 * 记录错误级别日志
 */
export function error(message: string, error?: unknown, context?: string): void {
  if (currentLogLevel <= LogLevel.ERROR) {
    console.error(formatMessage('❌ ERROR', message, context));
    if (error) {
      if (error instanceof Error) {
        console.error(`   原因: ${error.message}`);
        if (error.stack) {
          console.error(`   堆栈: ${error.stack}`);
        }
      } else {
        console.error(`   详情:`, error);
      }
    }
  }
}

/**
 * 记录成功操作
 */
export function success(message: string, context?: string): void {
  if (currentLogLevel <= LogLevel.INFO) {
    console.log(formatMessage('✅ SUCCESS', message, context));
  }
}

/**
 * 默认导出所有日志函数
 */
export default {
  debug,
  info,
  warn,
  error,
  success,
  setLogLevel,
  getLogLevel,
  LogLevel,
}; 