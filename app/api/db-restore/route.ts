import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";

/**
 * 上传并恢复SQLite数据库文件
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("database") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "未提供数据库文件" },
        { status: 400 }
      );
    }
    
    // 检查文件类型
    if (!file.name.endsWith('.db')) {
      return NextResponse.json(
        { error: "文件类型错误，仅支持.db文件" },
        { status: 400 }
      );
    }
    
    // 读取上传的文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 确保数据目录存在
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // 首先备份现有数据库（如果存在）
    const dbPath = path.join(dataDir, "app-data.db");
    if (fs.existsSync(dbPath)) {
      const backupPath = path.join(
        dataDir, 
        `app-data-backup-${new Date().toISOString().replace(/:/g, '-')}.db`
      );
      fs.copyFileSync(dbPath, backupPath);
      console.log(`✅ 已备份现有数据库到 ${backupPath}`);
    }
    
    // 保存上传的数据库文件
    await writeFile(dbPath, buffer);
    console.log(`✅ 数据库已恢复: ${file.name} -> app-data.db`);
    
    return NextResponse.json({
      success: true,
      message: "数据库已成功恢复"
    });
  } catch (error: any) {
    console.error("恢复数据库失败:", error);
    return NextResponse.json(
      { 
        error: "处理上传数据库文件时发生错误",
        message: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * 获取数据库恢复状态
 */
export async function GET(request: Request) {
  try {
    const dataDir = path.join(process.cwd(), "data");
    const dbPath = path.join(dataDir, "app-data.db");
    
    // 检查数据库文件是否存在
    const dbExists = fs.existsSync(dbPath);
    
    // 如果存在，获取文件信息
    let dbInfo = null;
    if (dbExists) {
      const stats = fs.statSync(dbPath);
      dbInfo = {
        size: stats.size,
        lastModified: stats.mtime
      };
    }
    
    // 获取所有备份文件
    const backupFiles = fs.existsSync(dataDir) 
      ? fs.readdirSync(dataDir)
          .filter(file => file.startsWith('app-data-backup-') && file.endsWith('.db'))
      : [];
    
    return NextResponse.json({
      dbExists,
      dbInfo,
      backupCount: backupFiles.length,
      backupFiles: backupFiles.slice(0, 5) // 只返回最近5个备份文件
    });
  } catch (error) {
    console.error("获取数据库状态失败:", error);
    return NextResponse.json(
      { error: "获取数据库状态时发生错误" },
      { status: 500 }
    );
  }
} 