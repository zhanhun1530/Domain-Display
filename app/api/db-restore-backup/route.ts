import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * 从现有备份恢复数据库
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filename } = body;
    
    if (!filename) {
      return NextResponse.json(
        { error: "未指定备份文件名" },
        { status: 400 }
      );
    }
    
    // 检查文件名是否是备份文件格式
    if (!filename.startsWith('app-data-backup-') || !filename.endsWith('.db')) {
      return NextResponse.json(
        { error: "无效的备份文件名" },
        { status: 400 }
      );
    }
    
    // 数据目录路径
    const dataDir = path.join(process.cwd(), "data");
    const backupPath = path.join(dataDir, filename);
    const dbPath = path.join(dataDir, "app-data.db");
    
    // 检查备份文件是否存在
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json(
        { error: "指定的备份文件不存在" },
        { status: 404 }
      );
    }
    
    // 在恢复之前备份当前数据库（如果存在）
    if (fs.existsSync(dbPath)) {
      const currentBackupPath = path.join(
        dataDir, 
        `app-data-backup-before-restore-${new Date().toISOString().replace(/:/g, '-')}.db`
      );
      fs.copyFileSync(dbPath, currentBackupPath);
      console.log(`✅ 已在恢复前备份当前数据库到 ${currentBackupPath}`);
    }
    
    // 复制备份文件到主数据库文件
    fs.copyFileSync(backupPath, dbPath);
    console.log(`✅ 已从备份文件 ${filename} 恢复数据库`);
    
    return NextResponse.json({
      success: true,
      message: "数据库已成功从备份恢复"
    });
  } catch (error: any) {
    console.error("从备份恢复数据库失败:", error);
    return NextResponse.json(
      { 
        error: "处理恢复请求时发生错误",
        message: error.message
      },
      { status: 500 }
    );
  }
} 