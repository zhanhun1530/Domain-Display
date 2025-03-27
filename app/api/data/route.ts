import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile, listJsonFiles, deleteJsonFile } from "@/lib/fs-utils";
import { withStorage } from "@/lib/use-storage";

/**
 * 获取数据文件列表或特定文件内容
 */
export async function GET(request: Request) {
  try {
    return await withStorage(async () => {
      // 解析查询参数
      const url = new URL(request.url);
      const filename = url.searchParams.get("file");

      // 如果指定了文件名，则返回该文件的内容
      if (filename) {
        const data = await readJsonFile(filename, null);
        
        if (data === null) {
          return NextResponse.json(
            { error: `文件 ${filename} 不存在或读取失败` },
            { status: 404 }
          );
        }
        
        return NextResponse.json({ data });
      }
      
      // 否则返回所有JSON文件的列表
      const files = await listJsonFiles();
      return NextResponse.json({ files });
    });
  } catch (error) {
    console.error("GET请求处理失败:", error);
    return NextResponse.json(
      { error: `处理请求时发生错误: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

/**
 * 写入数据到文件
 */
export async function POST(request: Request) {
  console.log("📝 API: 接收到POST数据请求");
  
  try {
    return await withStorage(async () => {
      // 解析请求体
      const body = await request.json().catch(error => {
        console.error("❌ API: 解析请求体失败", error);
        throw new Error("无效的JSON数据");
      });
      
      const { filename, data } = body;
      
      if (!filename) {
        console.error("❌ API: 缺少文件名");
        return NextResponse.json(
          { error: "缺少文件名", success: false },
          { status: 400 }
        );
      }
      
      if (data === undefined) {
        console.error("❌ API: 缺少数据");
        return NextResponse.json(
          { error: "缺少数据", success: false },
          { status: 400 }
        );
      }
      
      console.log(`📝 API: 正在写入数据到文件: ${filename}`);
      
      // 写入数据
      const success = await writeJsonFile(filename, data);
      
      if (!success) {
        console.error(`❌ API: 写入文件失败: ${filename}`);
        return NextResponse.json(
          { error: "写入文件失败", success: false },
          { status: 500 }
        );
      }
      
      console.log(`✅ API: 成功写入数据到文件: ${filename}`);
      return NextResponse.json({ success: true });
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ API POST请求处理失败:", errorMessage);
    
    return NextResponse.json(
      { error: `处理请求时发生错误: ${errorMessage}`, success: false },
      { status: 500 }
    );
  }
}

/**
 * 删除数据文件
 */
export async function DELETE(request: Request) {
  try {
    return await withStorage(async () => {
      // 解析查询参数
      const url = new URL(request.url);
      const filename = url.searchParams.get("file");
      
      if (!filename) {
        return NextResponse.json(
          { error: "缺少文件名" },
          { status: 400 }
        );
      }
      
      // 删除文件
      const success = await deleteJsonFile(filename);
      
      if (!success) {
        return NextResponse.json(
          { error: "删除文件失败" },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ success: true });
    });
  } catch (error) {
    console.error("DELETE请求处理失败:", error);
    return NextResponse.json(
      { error: `处理请求时发生错误: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 