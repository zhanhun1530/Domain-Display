/**
 * 密码测试API
 * 仅用于开发环境调试密码更新问题
 */

import { NextRequest, NextResponse } from "next/server";
import { testPasswordUpdate, inspectPasswordFile, forceUpdatePassword } from "@/lib/utils/test-password";
import logger from "@/lib/logger";

/**
 * 禁止在生产环境中使用
 */
const isProduction = process.env.NODE_ENV === 'production';

/**
 * 测试密码API - 获取密码状态
 */
export async function GET(request: NextRequest) {
  if (isProduction) {
    return NextResponse.json({ error: "测试API在生产环境中不可用" }, { status: 403 });
  }

  try {
    // 检查密码文件
    await inspectPasswordFile();
    
    // 返回结果
    return NextResponse.json({ 
      success: true, 
      message: "密码文件检查完成，请查看服务器日志了解详情" 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("密码测试API出错", error, "API");
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}

/**
 * 测试密码API - 更新密码
 */
export async function POST(request: NextRequest) {
  if (isProduction) {
    return NextResponse.json({ error: "测试API在生产环境中不可用" }, { status: 403 });
  }

  try {
    // 获取测试参数
    const { password, mode } = await request.json();
    
    // 验证参数
    if (!password) {
      return NextResponse.json({ 
        success: false, 
        error: "缺少必要的password参数" 
      }, { status: 400 });
    }
    
    // 执行测试
    let success = false;
    if (mode === "force") {
      // 使用强制模式
      success = await forceUpdatePassword(password);
    } else {
      // 使用正常测试流程
      success = await testPasswordUpdate(password);
    }
    
    // 返回结果
    return NextResponse.json({ 
      success, 
      message: success ? "密码测试完成并更新成功" : "密码测试失败，请查看服务器日志了解详情" 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("密码测试API出错", error, "API");
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
} 