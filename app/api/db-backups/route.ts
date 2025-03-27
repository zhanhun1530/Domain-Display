import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * 获取数据库备份文件列表或下载特定备份文件
 */
export async function GET(request: Request) {
  try {
    console.log("🔄 处理数据库备份文件请求");
    const url = new URL(request.url);
    const filename = url.searchParams.get("file");
    
    // 数据目录路径
    const dataDir = path.join(process.cwd(), "data");
    
    // 如果指定了文件名，则下载特定备份文件
    if (filename) {
      console.log(`📁 请求下载备份文件: ${filename}`);
      const filePath = path.join(dataDir, filename);
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        console.error(`❌ 备份文件不存在: ${filePath}`);
        return NextResponse.json(
          { error: "备份文件不存在", details: `文件 ${filename} 未找到` },
          { status: 404 }
        );
      }
      
      // 检查文件是否是数据库备份文件
      if (!filename.startsWith('app-data-backup-') && !filename.endsWith('.db')) {
        console.error(`❌ 无效的备份文件: ${filename}`);
        return NextResponse.json(
          { error: "无效的备份文件", details: "备份文件必须以'app-data-backup-'开头且以'.db'结尾" },
          { status: 400 }
        );
      }
      
      try {
        // 检查文件权限
        fs.accessSync(filePath, fs.constants.R_OK);
        
        // 获取文件大小
        const stats = fs.statSync(filePath);
        const fileSizeInMB = stats.size / (1024 * 1024);
        console.log(`📊 备份文件大小: ${fileSizeInMB.toFixed(2)} MB`);
        
        // 如果文件过大，可以设置限制
        if (fileSizeInMB > 100) {
          console.error(`❌ 备份文件过大: ${fileSizeInMB.toFixed(2)} MB`);
          return NextResponse.json(
            { error: "备份文件过大，无法下载", details: `文件大小 ${fileSizeInMB.toFixed(2)} MB 超过限制` },
            { status: 413 }
          );
        }
        
        // 读取文件
        const fileBuffer = fs.readFileSync(filePath);
        
        // 创建响应
        const response = new NextResponse(fileBuffer);
        
        // 设置响应头
        response.headers.set("Content-Type", "application/octet-stream");
        response.headers.set("Content-Disposition", `attachment; filename="${filename}"`);
        response.headers.set("Content-Length", String(fileBuffer.length));
        
        console.log(`✅ 备份文件下载成功: ${filename} (${fileBuffer.length} 字节)`);
        return response;
      } catch (fileError: any) {
        console.error(`❌ 读取备份文件失败:`, fileError);
        return NextResponse.json(
          { error: "读取备份文件失败", details: fileError.message || "文件系统错误" },
          { status: 500 }
        );
      }
    }
    
    // 否则返回所有备份文件列表
    console.log("📋 获取备份文件列表");
    if (!fs.existsSync(dataDir)) {
      console.log(`⚠️ 数据目录不存在: ${dataDir}`);
      return NextResponse.json({ backupFiles: [] });
    }
    
    try {
      // 获取所有备份文件
      const files = fs.readdirSync(dataDir);
      const backupFiles = files
        .filter(file => file.startsWith('app-data-backup-') && file.endsWith('.db'))
        .map(file => {
          try {
            const filePath = path.join(dataDir, file);
            const stats = fs.statSync(filePath);
            const sizeInMB = stats.size / (1024 * 1024);
            
            // 从备份文件名中提取日期时间
            let dateInfo = "未知";
            const dateMatch = file.match(/app-data-backup-(.+)\.db/);
            if (dateMatch && dateMatch[1]) {
              dateInfo = dateMatch[1].replace(/T/, ' ').replace(/-/g, '/').slice(0, 19);
            }
            
            return {
              name: file,
              size: stats.size,
              sizeFormatted: `${sizeInMB.toFixed(2)} MB`,
              lastModified: stats.mtime,
              lastModifiedFormatted: new Date(stats.mtime).toLocaleString(),
              dateInfo
            };
          } catch (fileError) {
            console.error(`⚠️ 获取文件 ${file} 信息失败:`, fileError);
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
      
      console.log(`✅ 找到 ${backupFiles.length} 个备份文件`);
      return NextResponse.json({ 
        backupFiles,
        count: backupFiles.length,
        dataDir
      });
    } catch (listError: any) {
      console.error("❌ 读取目录失败:", listError);
      return NextResponse.json(
        { error: "读取备份目录失败", details: listError.message || "文件系统错误" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("❌ 处理数据库备份文件请求失败:", error);
    return NextResponse.json(
      { error: "处理请求时发生错误", details: error.message || "未知错误" },
      { status: 500 }
    );
  }
}

/**
 * 删除数据库备份文件
 */
export async function DELETE(request: Request) {
  try {
    console.log("🗑️ 处理删除备份文件请求");
    const body = await request.json();
    const { filename } = body;
    
    if (!filename) {
      console.error("❌ 未指定文件名");
      return NextResponse.json(
        { error: "未指定文件名" },
        { status: 400 }
      );
    }
    
    console.log(`🗑️ 请求删除备份文件: ${filename}`);
    
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
    const filePath = path.join(dataDir, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.error(`❌ 备份文件不存在: ${filePath}`);
      return NextResponse.json(
        { error: "备份文件不存在" },
        { status: 404 }
      );
    }
    
    try {
      // 获取文件信息用于记录
      const stats = fs.statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      
      // 检查文件权限
      fs.accessSync(filePath, fs.constants.W_OK);
      
      // 删除文件
      fs.unlinkSync(filePath);
      console.log(`✅ 备份文件已成功删除: ${filename} (${fileSizeInMB.toFixed(2)} MB)`);
      
      return NextResponse.json({
        success: true,
        message: "备份文件已成功删除",
        details: {
          filename,
          size: stats.size,
          sizeFormatted: `${fileSizeInMB.toFixed(2)} MB`,
          deletedAt: new Date().toISOString()
        }
      });
    } catch (deleteError: any) {
      console.error("❌ 删除备份文件失败:", deleteError);
      return NextResponse.json(
        { error: "删除备份文件失败", details: deleteError.message || "文件系统错误" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("❌ 删除数据库备份文件失败:", error);
    return NextResponse.json(
      { error: "处理请求时发生错误", details: error.message || "未知错误" },
      { status: 500 }
    );
  }
} 