import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/fs-utils";
import { 
  getDomains, 
  saveDomains, 
  getSoldDomains, 
  saveSoldDomains,
  getFriendlyLinks,
  saveFriendlyLinks
} from "@/lib/sqlite-service";
import type { Domain, SoldDomain, FriendlyLink } from "@/lib/sqlite-service";

// JSON文件名
const DOMAINS_FILENAME = "domains.json";
const SOLD_DOMAINS_FILENAME = "sold-domains.json";
const FRIENDLY_LINKS_FILENAME = "friendly-links.json";

/**
 * 将JSON数据同步到SQLite数据库
 */
export async function POST(request: Request) {
  try {
    // 从JSON文件读取数据
    const domainsJson = await readJsonFile(DOMAINS_FILENAME, []);
    const soldDomainsJson = await readJsonFile(SOLD_DOMAINS_FILENAME, []);
    const friendlyLinksJson = await readJsonFile(FRIENDLY_LINKS_FILENAME, []);
    
    // 转换为SQLite格式的数据
    const domains = convertJsonToDomains(domainsJson);
    const soldDomains = convertJsonToSoldDomains(soldDomainsJson);
    const friendlyLinks = convertJsonToFriendlyLinks(friendlyLinksJson);
    
    // 保存到SQLite数据库
    const domainsSaved = saveDomains(domains);
    const soldDomainsSaved = saveSoldDomains(soldDomains);
    const friendlyLinksSaved = saveFriendlyLinks(friendlyLinks);
    
    // 返回结果
    return NextResponse.json({
      success: domainsSaved && soldDomainsSaved && friendlyLinksSaved,
      stats: {
        domains: domains.length,
        soldDomains: soldDomains.length,
        friendlyLinks: friendlyLinks.length
      }
    });
  } catch (error: any) {
    console.error("同步数据到SQLite数据库失败:", error);
    return NextResponse.json(
      { 
        error: "同步数据失败", 
        message: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * 从SQLite数据库读取数据并返回
 */
export async function GET(request: Request) {
  try {
    // 从SQLite读取数据
    const domains = getDomains();
    const soldDomains = getSoldDomains();
    const friendlyLinks = getFriendlyLinks();
    
    return NextResponse.json({
      domains,
      soldDomains,
      friendlyLinks,
      stats: {
        domains: domains.length,
        soldDomains: soldDomains.length,
        friendlyLinks: friendlyLinks.length
      }
    });
  } catch (error: any) {
    console.error("从SQLite数据库读取数据失败:", error);
    return NextResponse.json(
      { 
        error: "读取数据失败", 
        message: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * 将JSON格式的域名数据转换为SQLite格式
 */
function convertJsonToDomains(jsonData: any[]): Domain[] {
  const now = Date.now();
  
  return jsonData.map(item => {
    // 提取域名和扩展名
    const fullName = item.name || "";
    
    // 状态转换
    let status: "available" | "sold" | "active";
    switch ((item.status || "").toLowerCase()) {
      case "available":
        status = "available";
        break;
      case "sold":
        status = "sold";
        break;
      default:
        status = "active";
    }
    
    return {
      name: fullName,
      status,
      price: item.price ? parseFloat(item.price) : undefined,
      category: item.category,
      description: item.description,
      registrar: item.registrar,
      featured: item.featured === true,
      createdAt: now,
      updatedAt: now
    };
  });
}

/**
 * 将JSON格式的已售域名数据转换为SQLite格式
 */
function convertJsonToSoldDomains(jsonData: any[]): SoldDomain[] {
  const now = Date.now();
  
  return jsonData.map(item => {
    return {
      name: item.name || "",
      price: item.price ? parseFloat(item.price) : undefined,
      soldDate: item.soldDate ? new Date(item.soldDate).getTime() : undefined,
      company: item.soldTo,
      createdAt: now,
      updatedAt: now
    };
  });
}

/**
 * 将JSON格式的友情链接数据转换为SQLite格式
 */
function convertJsonToFriendlyLinks(jsonData: any[]): FriendlyLink[] {
  const now = Date.now();
  
  return jsonData.map(item => {
    return {
      title: item.name || "",
      url: item.url || "",
      logo: item.logo,
      description: item.description,
      createdAt: now,
      updatedAt: now
    };
  });
} 