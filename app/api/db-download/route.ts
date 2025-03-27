import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * 下载SQLite数据库文件
 */
export async function GET(request: Request) {
  try {
    // 数据库文件路径
    const dbFilePath = path.join(process.cwd(), "data", "app-data.db");
    
    // 检查文件是否存在
    if (!fs.existsSync(dbFilePath)) {
      return NextResponse.json(
        { error: "数据库文件不存在" },
        { status: 404 }
      );
    }
    
    // 读取文件
    const fileBuffer = fs.readFileSync(dbFilePath);
    
    // 创建响应
    const response = new NextResponse(fileBuffer);
    
    // 设置响应头
    response.headers.set("Content-Type", "application/octet-stream");
    response.headers.set("Content-Disposition", `attachment; filename="app-data.db"`);
    
    return response;
  } catch (error) {
    console.error("下载数据库文件失败:", error);
    return NextResponse.json(
      { error: "处理请求时发生错误" },
      { status: 500 }
    );
  }
} 