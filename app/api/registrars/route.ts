import { NextResponse } from "next/server";
import { 
  getRegistrars, 
  getRegistrar,
  addRegistrar, 
  updateRegistrar,
  deleteRegistrar,
  type Registrar
} from "@/lib/sqlite-service";

/**
 * 获取所有注册商或单个注册商
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    // 如果指定了ID，则返回特定注册商的信息
    if (id) {
      const registrar = getRegistrar(parseInt(id, 10));
      
      if (!registrar) {
        return NextResponse.json(
          { error: "未找到指定的注册商" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(registrar);
    }
    
    // 否则返回所有注册商列表
    const registrars = getRegistrars();
    return NextResponse.json(registrars);
  } catch (error: any) {
    console.error("获取注册商数据失败:", error);
    return NextResponse.json(
      { error: "获取注册商数据失败", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * 添加新注册商
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 验证必填字段
    if (!body.name) {
      return NextResponse.json(
        { error: "注册商名称不能为空" },
        { status: 400 }
      );
    }
    
    // 添加注册商
    const id = addRegistrar(body as Registrar);
    
    if (!id) {
      return NextResponse.json(
        { error: "添加注册商失败" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      id,
      success: true,
      message: "注册商添加成功"
    });
  } catch (error: any) {
    console.error("添加注册商失败:", error);
    return NextResponse.json(
      { error: "添加注册商失败", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * 更新注册商信息
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // 验证ID
    if (!body.id) {
      return NextResponse.json(
        { error: "缺少注册商ID" },
        { status: 400 }
      );
    }
    
    // 更新注册商
    const success = updateRegistrar(body.id, body);
    
    if (!success) {
      return NextResponse.json(
        { error: "更新注册商失败，可能不存在指定的注册商" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "注册商更新成功"
    });
  } catch (error: any) {
    console.error("更新注册商失败:", error);
    return NextResponse.json(
      { error: "更新注册商失败", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * 删除注册商
 */
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "缺少注册商ID" },
        { status: 400 }
      );
    }
    
    // 删除注册商
    const success = deleteRegistrar(parseInt(id, 10));
    
    if (!success) {
      return NextResponse.json(
        { error: "删除注册商失败，可能不存在指定的注册商" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "注册商删除成功"
    });
  } catch (error: any) {
    console.error("删除注册商失败:", error);
    return NextResponse.json(
      { error: "删除注册商失败", message: error.message },
      { status: 500 }
    );
  }
} 