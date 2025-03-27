import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";

/**
 * 上传并恢复SQLite数据库文件
 */
export async function POST(request: Request) {
  try {
    console.log("🔄 开始处理数据库恢复请求");
    const formData = await request.formData();
    const file = formData.get("database") as File;
    
    if (!file) {
      console.error("❌ 未提供数据库文件");
      return NextResponse.json(
        { error: "未提供数据库文件" },
        { status: 400 }
      );
    }
    
    // 记录文件信息
    console.log(`📁 接收到文件: ${file.name}, 大小: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    
    // 检查文件类型
    if (!file.name.endsWith('.db')) {
      console.error(`❌ 文件类型错误: ${file.name}`);
      return NextResponse.json(
        { error: "文件类型错误，仅支持.db文件" },
        { status: 400 }
      );
    }
    
    // 检查文件大小限制（例如：100MB）
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_SIZE) {
      console.error(`❌ 文件过大: ${(file.size / (1024 * 1024)).toFixed(2)} MB, 超过限制: ${MAX_SIZE / (1024 * 1024)} MB`);
      return NextResponse.json(
        { error: `文件过大，最大允许 ${MAX_SIZE / (1024 * 1024)} MB` },
        { status: 413 }
      );
    }
    
    // 读取上传的文件
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // 简单验证文件是否为SQLite文件（SQLite文件的前16字节应该包含"SQLite format 3"字符串）
      if (buffer.length < 16 || !buffer.toString('utf8', 0, 16).includes('SQLite format')) {
        console.error("❌ 上传的文件不是有效的SQLite数据库文件");
        return NextResponse.json(
          { error: "上传的文件不是有效的SQLite数据库文件" },
          { status: 400 }
        );
      }
      
      // 确保数据目录存在
      const dataDir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        console.log(`📁 创建数据目录: ${dataDir}`);
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // 首先备份现有数据库（如果存在）
      const dbPath = path.join(dataDir, "app-data.db");
      if (fs.existsSync(dbPath)) {
        const now = new Date();
        const dateStr = now.toISOString().replace(/:/g, '-');
        const backupPath = path.join(
          dataDir, 
          `app-data-backup-${dateStr}.db`
        );
        fs.copyFileSync(dbPath, backupPath);
        console.log(`✅ 已备份现有数据库到: ${backupPath}`);
      } else {
        console.log("⚠️ 无现有数据库可备份");
      }
      
      // 保存上传的数据库文件
      try {
        await writeFile(dbPath, buffer);
        console.log(`✅ 数据库已恢复: ${file.name} -> app-data.db (${buffer.length} 字节)`);
        
        return NextResponse.json({
          success: true,
          message: "数据库已成功恢复",
          details: {
            fileName: file.name,
            size: buffer.length,
            timestamp: new Date().toISOString()
          }
        });
      } catch (writeError: any) {
        console.error("❌ 写入数据库文件失败:", writeError);
        return NextResponse.json(
          { 
            error: "写入数据库文件失败", 
            message: writeError.message || "文件系统错误" 
          },
          { status: 500 }
        );
      }
    } catch (readError: any) {
      console.error("❌ 读取上传文件失败:", readError);
      return NextResponse.json(
        { 
          error: "读取上传文件失败", 
          message: readError.message || "无法读取上传的文件" 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("❌ 恢复数据库失败:", error);
    return NextResponse.json(
      { 
        error: "处理上传数据库文件时发生错误",
        message: error.message || "未知错误"
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
    console.log("🔄 查询数据库状态");
    const dataDir = path.join(process.cwd(), "data");
    const dbPath = path.join(dataDir, "app-data.db");
    
    // 检查数据库文件是否存在
    const dbExists = fs.existsSync(dbPath);
    console.log(`📊 数据库文件存在: ${dbExists}`);
    
    // 如果存在，获取文件信息
    let dbInfo = null;
    if (dbExists) {
      try {
        const stats = fs.statSync(dbPath);
        const sizeInMB = stats.size / (1024 * 1024);
        dbInfo = {
          size: stats.size,
          sizeFormatted: `${sizeInMB.toFixed(2)} MB`,
          lastModified: stats.mtime,
          lastModifiedFormatted: new Date(stats.mtime).toLocaleString()
        };
        console.log(`📊 数据库大小: ${sizeInMB.toFixed(2)} MB, 最后修改: ${new Date(stats.mtime).toLocaleString()}`);
      } catch (statsError) {
        console.error("❌ 无法获取数据库文件信息:", statsError);
      }
    }
    
    // 获取所有备份文件
    let backupFiles: Array<{
      name: string;
      size?: number;
      sizeFormatted?: string;
      lastModified?: Date;
      lastModifiedFormatted?: string;
      error?: string;
    }> = [];
    try {
      if (fs.existsSync(dataDir)) {
        const files = fs.readdirSync(dataDir);
        backupFiles = files
          .filter(file => file.startsWith('app-data-backup-') && file.endsWith('.db'))
          .map(file => {
            try {
              const filePath = path.join(dataDir, file);
              const stats = fs.statSync(filePath);
              const sizeInMB = stats.size / (1024 * 1024);
              
              return {
                name: file,
                size: stats.size,
                sizeFormatted: `${sizeInMB.toFixed(2)} MB`,
                lastModified: stats.mtime,
                lastModifiedFormatted: new Date(stats.mtime).toLocaleString()
              };
            } catch (fileError) {
              console.error(`❌ 无法获取备份文件信息 ${file}:`, fileError);
              return {
                name: file,
                error: "无法获取文件信息"
              };
            }
          })
          .sort((a, b) => {
            // 按修改时间降序排序（最新的在前）
            if (!a.lastModified || !b.lastModified) return 0;
            return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
          });
        
        console.log(`📊 找到 ${backupFiles.length} 个备份文件`);
      } else {
        console.log("⚠️ 数据目录不存在，无备份文件");
      }
    } catch (backupError) {
      console.error("❌ 获取备份文件列表失败:", backupError);
    }
    
    return NextResponse.json({
      dbExists,
      dbInfo,
      backupCount: backupFiles.length,
      backupFiles: backupFiles.slice(0, 5) // 只返回最近5个备份文件
    });
  } catch (error: any) {
    console.error("❌ 获取数据库状态失败:", error);
    return NextResponse.json(
      { 
        error: "获取数据库状态时发生错误",
        message: error.message || "未知错误"
      },
      { status: 500 }
    );
  }
} 