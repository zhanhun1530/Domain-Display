# Vercel部署指南

本项目已针对Vercel平台进行了优化，可以无缝部署到Vercel，而无需SQLite数据库。

## 关于数据存储

在Vercel环境中，由于SQLite库的限制，我们使用了JSON文件存储代替SQLite数据库。系统会自动检测Vercel环境并切换存储模式。主要区别如下：

- **本地开发环境**：使用SQLite数据库（`data/app-data.db`）存储数据
- **Vercel环境**：使用JSON文件（存储在`data/`目录下）存储数据

## 部署步骤

1. 确保你已有Vercel账户并安装了Vercel CLI
2. 在项目根目录下运行：
   ```
   vercel
   ```
3. 按照提示完成部署

## 数据持久化

请注意，Vercel的无服务器环境中，`/data`目录下的JSON文件会在每次部署时重置。如果需要持久化数据，建议考虑以下方案：

1. **使用外部数据库服务**：例如MongoDB Atlas、Supabase等
2. **使用Vercel KV、Vercel Postgres或Vercel Blob**

## 本地测试Vercel环境

你可以在本地模拟Vercel环境进行测试：

```
npm run vercel-dev
```

这将启动一个模拟Vercel环境的开发服务器，使用JSON文件而非SQLite数据库。

## 环境变量

项目配置了以下环境变量用于控制存储方式：

- `IS_VERCEL`：检测是否在Vercel环境中运行
- `DATA_STORAGE_TYPE`：存储类型，可选值为`sqlite`或`json`

在Vercel部署时，这些变量会自动设置。

## 故障排除

如果在Vercel部署时遇到问题：

1. 检查Vercel日志是否显示有关SQLite或better-sqlite3的错误
2. 确认`next.config.mjs`中的webpack配置正确排除了better-sqlite3
3. 确保`data`目录在你的Git仓库中

## 文件结构

- `lib/adapters/json-storage.ts`：JSON存储适配器
- `lib/storage-factory.ts`：存储工厂，根据环境选择存储类型
- `lib/use-storage.ts`：API路由使用的存储初始化钩子
- `lib/db-init.ts`：数据库/JSON文件初始化逻辑 