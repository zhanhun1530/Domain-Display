import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * 获取数据库备份文件列表或下载特定备份文件
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filename = url.searchParams.get("file");
    
    // 数据目录路径
    const dataDir = path.join(process.cwd(), "data");
    
    // 如果指定了文件名，则下载特定备份文件
    if (filename) {
      const filePath = path.join(dataDir, filename);
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { error: "备份文件不存在" },
          { status: 404 }
        );
      }
      
      // 检查文件是否是数据库备份文件
      if (!filename.startsWith('app-data-backup-') && !filename.endsWith('.db')) {
        return NextResponse.json(
          { error: "无效的备份文件" },
          { status: 400 }
        );
      }
      
      // 读取文件
      const fileBuffer = fs.readFileSync(filePath);
      
      // 创建响应
      const response = new NextResponse(fileBuffer);
      
      // 设置响应头
      response.headers.set("Content-Type", "application/octet-stream");
      response.headers.set("Content-Disposition", `attachment; filename="${filename}"`);
      
      return response;
    }
    
    // 否则返回所有备份文件列表
    if (!fs.existsSync(dataDir)) {
      return NextResponse.json({ backupFiles: [] });
    }
    
    // 获取所有备份文件
    const files = fs.readdirSync(dataDir);
    const backupFiles = files
      .filter(file => file.startsWith('app-data-backup-') && file.endsWith('.db'))
      .map(file => {
        const filePath = path.join(dataDir, file);
        const stats = fs.statSync(filePath);
        
        return {
          name: file,
          size: stats.size,
          lastModified: stats.mtime
        };
      })
      .sort((a, b) => {
        // 按修改时间降序排序（最新的在前）
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      });
    
    return NextResponse.json({ backupFiles });
  } catch (error) {
    console.error("处理数据库备份文件请求失败:", error);
    return NextResponse.json(
      { error: "处理请求时发生错误" },
      { status: 500 }
    );
  }
}

/**
 * 删除数据库备份文件
 */
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { filename } = body;
    
    if (!filename) {
      return NextResponse.json(
        { error: "未指定文件名" },
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
    const filePath = path.join(dataDir, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "备份文件不存在" },
        { status: 404 }
      );
    }
    
    // 删除文件
    fs.unlinkSync(filePath);
    
    return NextResponse.json({
      success: true,
      message: "备份文件已成功删除"
    });
  } catch (error) {
    console.error("删除数据库备份文件失败:", error);
    return NextResponse.json(
      { error: "处理请求时发生错误" },
      { status: 500 }
    );
  }
} 