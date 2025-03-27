import { NextResponse } from "next/server";
import { initDb } from "@/lib/db-init";

/**
 * 初始化数据库并迁移数据
 */
export async function POST(request: Request) {
  try {
    const success = await initDb();
    
    if (success) {
      return NextResponse.json({ 
        success: true,
        message: "数据库初始化成功" 
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: "数据库初始化失败" 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("数据库初始化API错误:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "处理请求时发生错误" 
      },
      { status: 500 }
    );
  }
}

/**
 * 获取数据库状态
 */
export async function GET(request: Request) {
  try {
    // 这里可以添加检查数据库状态的逻辑
    return NextResponse.json({ 
      ready: true,
      message: "SQLite数据库已配置" 
    });
  } catch (error) {
    console.error("检查数据库状态失败:", error);
    return NextResponse.json(
      { 
        ready: false,
        error: "检查数据库状态时发生错误" 
      },
      { status: 500 }
    );
  }
} 