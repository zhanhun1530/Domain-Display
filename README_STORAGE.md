# 存储适配器系统说明

本项目实现了一个灵活的存储适配器系统，可以根据运行环境自动切换存储后端（SQLite或JSON文件）。

## 架构概述

存储系统采用了工厂模式和适配器模式，主要组件包括：

```
lib/
├── storage-factory.ts     # 存储工厂，根据环境决定使用哪种存储实现
├── sqlite-service.ts      # SQLite存储服务实现
├── sqlite-db.ts           # SQLite数据库连接管理
├── adapters/
│   └── json-storage.ts    # JSON文件存储适配器实现
├── fs-utils.ts            # 文件系统工具，用于JSON文件操作
├── db-init.ts             # 数据库初始化逻辑
└── use-storage.ts         # API路由中的存储初始化钩子
```

## 工作原理

1. **环境检测**：系统根据环境变量（`VERCEL`或`IS_VERCEL`）判断当前运行环境
2. **存储工厂**：`storage-factory.ts`根据环境选择适当的存储实现
3. **统一API**：无论使用哪种存储后端，对外暴露的API保持一致
4. **初始化钩子**：API路由使用`withStorage`钩子确保存储系统正确初始化

## 切换存储类型

存储类型由以下因素决定：

1. 环境变量`VERCEL`为`'1'`时，使用JSON存储
2. 环境变量`IS_VERCEL`为`'true'`时，使用JSON存储  
3. 环境变量`DATA_STORAGE_TYPE`可显式设置为`'sqlite'`或`'json'`

## 本地开发

默认情况下，本地开发使用SQLite存储。如果要切换到JSON存储进行测试，可以：

```bash
npm run vercel-dev  # 使用JSON存储启动开发服务器
```

## Vercel部署

Vercel环境中自动切换到JSON存储，不需要额外配置。部署详情请参考[VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)。

## 数据模型

所有存储实现支持相同的数据模型：

- 认证信息（Auth）
- 域名（Domains）
- 已售域名（SoldDomains）
- 注册商（Registrars）
- 友情链接（FriendlyLinks）
- 网站设置（SiteSettings）

## 扩展适配器

如需添加新的存储后端（如MongoDB或Redis），只需：

1. 创建新的适配器实现，提供与现有适配器相同的API
2. 在`storage-factory.ts`中添加相应的逻辑

## 注意事项

- JSON存储不适合高并发或大数据量场景
- JSON存储在Vercel环境中数据不会持久化保存（部署后会重置）
- 为生产环境，建议考虑使用真正的数据库服务 