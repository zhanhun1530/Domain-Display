import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * 下载SQLite数据库文件
 */
export async function GET(request: Request) {
  const dbFilePath = path.join(process.cwd(), "data", "app-data.db");
  
  try {
    // 检查文件是否存在
    if (!fs.existsSync(dbFilePath)) {
      console.error(`数据库文件不存在: ${dbFilePath}`);
      return NextResponse.json(
        { error: "数据库文件不存在" },
        { status: 404 }
      );
    }
    
    // 检查文件大小，防止下载过大文件
    const stats = fs.statSync(dbFilePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    
    console.log(`准备下载数据库文件: ${dbFilePath}`);
    console.log(`文件大小: ${fileSizeInMB.toFixed(2)} MB`);
    
    // 如果文件太大，可以设置限制
    if (fileSizeInMB > 100) {
      console.error(`数据库文件过大: ${fileSizeInMB.toFixed(2)} MB`);
      return NextResponse.json(
        { error: "数据库文件过大，无法下载" },
        { status: 413 }
      );
    }
    
    // 检查文件是否可读
    try {
      fs.accessSync(dbFilePath, fs.constants.R_OK);
      console.log(`✅ 文件可读: ${dbFilePath}`);
    } catch (accessError) {
      console.error(`⚠️ 文件权限错误, 无法读取: ${dbFilePath}`, accessError);
      return NextResponse.json(
        { error: "数据库文件存在但无法读取，可能是权限问题" },
        { status: 403 }
      );
    }
    
    try {
      // 读取文件
      const fileBuffer = fs.readFileSync(dbFilePath);
      
      if (!fileBuffer || fileBuffer.length === 0) {
        console.error(`⚠️ 数据库文件为空: ${dbFilePath}`);
        return NextResponse.json(
          { error: "数据库文件内容为空" },
          { status: 500 }
        );
      }
      
      // 创建当前日期的文件名（格式：app-data-yyyy-mm-dd.db）
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const downloadFilename = `app-data-${dateStr}.db`;
      
      // 创建响应
      const response = new NextResponse(fileBuffer);
      
      // 设置响应头
      response.headers.set("Content-Type", "application/octet-stream");
      response.headers.set("Content-Disposition", `attachment; filename="${downloadFilename}"`);
      response.headers.set("Content-Length", String(fileBuffer.length));
      
      console.log(`✅ 数据库下载成功: ${downloadFilename}`);
      console.log(`✅ 响应大小: ${fileBuffer.length} 字节`);
      return response;
    } catch (readError) {
      console.error("读取数据库文件失败:", readError);
      return NextResponse.json(
        { error: "读取数据库文件失败", details: readError instanceof Error ? readError.message : "未知错误" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("下载数据库文件失败:", error);
    return NextResponse.json(
      { error: "处理请求时发生错误", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    );
  }
} 