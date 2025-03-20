# 域名展示平台

这是一个使用Next.js和Tailwind CSS构建的域名展示和交易平台。

## 功能特点

- 域名列表展示
- 域名搜索功能
- 分类筛选
- 排序功能
- 域名详情页面
- 响应式设计，适配各种设备

## 技术栈

- Next.js - React框架
- TypeScript - 类型安全
- Tailwind CSS - 样式框架
- Heroicons - 图标库

## 开始使用

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## 项目结构

- `/pages` - Next.js页面
  - `/index.tsx` - 首页，展示域名列表
  - `/domain/[id].tsx` - 域名详情页
  - `/_app.tsx` - 应用入口
- `/components` - React组件
  - `/Layout.tsx` - 页面布局组件
  - `/DomainCard.tsx` - 域名卡片组件
- `/styles` - 样式文件
  - `/globals.css` - 全局样式和Tailwind配置

## 数据结构

目前使用模拟数据，未来可以连接到后端API。域名数据结构如下：

```typescript
interface Domain {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  registrationDate: string;
  expiryDate: string;
  featured: boolean;
  features?: string[];
  contactEmail?: string;
  contactPhone?: string;
}
```