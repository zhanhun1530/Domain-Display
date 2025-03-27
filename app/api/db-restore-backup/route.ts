import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * 从现有备份恢复数据库
 */
export async function POST(request: Request) {
  try {
    console.log("🔄 开始从备份恢复数据库...");
    const body = await request.json();
    const { filename } = body;
    
    if (!filename) {
      console.error("❌ 未指定备份文件名");
      return NextResponse.json(
        { error: "未指定备份文件名" },
        { status: 400 }
      );
    }
    
    console.log(`📁 恢复请求的备份文件: ${filename}`);
    
    // 检查文件名是否是备份文件格式
    if (!filename.startsWith('app-data-backup-') || !filename.endsWith('.db')) {
      console.error(`❌ 无效的备份文件名: ${filename}`);
      return NextResponse.json(
        { error: "无效的备份文件名", details: "备份文件名必须以'app-data-backup-'开头且以'.db'结尾" },
        { status: 400 }
      );
    }
    
    // 数据目录路径
    const dataDir = path.join(process.cwd(), "data");
    const backupPath = path.join(dataDir, filename);
    const dbPath = path.join(dataDir, "app-data.db");
    
    // 检查数据目录是否存在
    if (!fs.existsSync(dataDir)) {
      console.error(`❌ 数据目录不存在: ${dataDir}`);
      return NextResponse.json(
        { error: "数据目录不存在" },
        { status: 500 }
      );
    }
    
    // 检查备份文件是否存在
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ 指定的备份文件不存在: ${backupPath}`);
      return NextResponse.json(
        { error: "指定的备份文件不存在" },
        { status: 404 }
      );
    }
    
    // 检查备份文件是否可读和是否为SQLite数据库
    try {
      fs.accessSync(backupPath, fs.constants.R_OK);
      
      // 检查文件大小
      const stats = fs.statSync(backupPath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      console.log(`📊 备份文件大小: ${fileSizeInMB.toFixed(2)} MB`);
      
      // 验证SQLite文件头部
      const header = Buffer.alloc(16);
      const fd = fs.openSync(backupPath, 'r');
      fs.readSync(fd, header, 0, 16, 0);
      fs.closeSync(fd);
      
      if (!header.toString('utf8').includes('SQLite format')) {
        console.error(`❌ 备份文件不是有效的SQLite数据库: ${filename}`);
        return NextResponse.json(
          { error: "备份文件不是有效的SQLite数据库" },
          { status: 400 }
        );
      }
      
      console.log(`✅ 备份文件验证通过: ${filename}`);
    } catch (validationError: any) {
      console.error(`❌ 备份文件验证失败:`, validationError);
      return NextResponse.json(
        { 
          error: "备份文件验证失败", 
          message: validationError.message || "无法读取或验证备份文件" 
        },
        { status: 500 }
      );
    }
    
    try {
      // 在恢复之前备份当前数据库（如果存在）
      if (fs.existsSync(dbPath)) {
        const now = new Date();
        const dateStr = now.toISOString().replace(/:/g, '-');
        const currentBackupPath = path.join(
          dataDir, 
          `app-data-backup-before-restore-${dateStr}.db`
        );
        
        fs.copyFileSync(dbPath, currentBackupPath);
        console.log(`✅ 已在恢复前备份当前数据库到: ${currentBackupPath}`);
      } else {
        console.log("⚠️ 当前无数据库文件可备份");
      }
      
      // 复制备份文件到主数据库文件
      fs.copyFileSync(backupPath, dbPath);
      console.log(`✅ 已从备份文件 ${filename} 恢复数据库`);
      
      // 验证恢复后的数据库文件
      const restoredStats = fs.statSync(dbPath);
      console.log(`✅ 恢复完成，数据库文件大小: ${(restoredStats.size / (1024 * 1024)).toFixed(2)} MB`);
      
      return NextResponse.json({
        success: true,
        message: "数据库已成功从备份恢复",
        details: {
          source: filename,
          size: restoredStats.size,
          sizeFormatted: `${(restoredStats.size / (1024 * 1024)).toFixed(2)} MB`,
          timestamp: new Date().toISOString()
        }
      });
    } catch (restoreError: any) {
      console.error("❌ 复制备份文件失败:", restoreError);
      return NextResponse.json(
        { 
          error: "复制备份文件失败", 
          message: restoreError.message || "文件系统错误" 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("❌ 从备份恢复数据库失败:", error);
    return NextResponse.json(
      { 
        error: "处理恢复请求时发生错误",
        message: error.message || "未知错误"
      },
      { status: 500 }
    );
  }
} 