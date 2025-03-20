import { useState } from 'react';
import Head from 'next/head';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import DomainCard from '@/components/DomainCard';
import Layout from '@/components/Layout';

// 模拟域名数据
const MOCK_DOMAINS = [
  {
    id: 1,
    name: 'example.com',
    category: '商业',
    price: 5000,
    description: '优质商业域名，简短易记，适合各类企业使用。',
    registrationDate: '2020-01-15',
    expiryDate: '2025-01-15',
    featured: true,
  },
  {
    id: 2,
    name: 'techblog.net',
    category: '科技',
    price: 2500,
    description: '适合科技博客和技术网站使用的域名。',
    registrationDate: '2021-03-22',
    expiryDate: '2026-03-22',
    featured: false,
  },
  {
    id: 3,
    name: 'foodrecipes.org',
    category: '美食',
    price: 1800,
    description: '适合美食博客和菜谱网站使用的域名。',
    registrationDate: '2019-07-10',
    expiryDate: '2024-07-10',
    featured: false,
  },
  {
    id: 4,
    name: 'travelblog.com',
    category: '旅游',
    price: 4200,
    description: '适合旅游博客和旅行社使用的优质域名。',
    registrationDate: '2018-11-05',
    expiryDate: '2023-11-05',
    featured: true,
  },
  {
    id: 5,
    name: 'fitnesscoach.net',
    category: '健康',
    price: 3000,
    description: '适合健身教练和健康网站使用的域名。',
    registrationDate: '2022-01-30',
    expiryDate: '2027-01-30',
    featured: false,
  },
  {
    id: 6,
    name: 'digitalart.com',
    category: '艺术',
    price: 6500,
    description: '适合数字艺术家和艺术网站使用的优质域名。',
    registrationDate: '2017-09-18',
    expiryDate: '2027-09-18',
    featured: true,
  },
];

// 所有可用分类
const CATEGORIES = ['全部', '商业', '科技', '美食', '旅游', '健康', '艺术'];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-asc', 'price-desc', 'name'

  // 过滤和排序域名
  const filteredDomains = MOCK_DOMAINS.filter(domain => {
    const matchesSearch = domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         domain.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || domain.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'featured') {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    } else if (sortBy === 'price-asc') {
      return a.price - b.price;
    } else if (sortBy === 'price-desc') {
      return b.price - a.price;
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">域名展示平台</h1>
          <p className="text-center text-gray-600 mb-6">发现并购买您理想的域名</p>
          
          {/* 搜索栏 */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-full max-w-xl">
              <input
                type="text"
                placeholder="搜索域名..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* 分类和排序 */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  className={`px-3 py-1 rounded-full text-sm ${selectedCategory === category ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <div className="flex items-center">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500 mr-2" />
              <select
                className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">推荐排序</option>
                <option value="price-asc">价格 (低到高)</option>
                <option value="price-desc">价格 (高到低)</option>
                <option value="name">名称 (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* 域名列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDomains.length > 0 ? (
            filteredDomains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">没有找到匹配的域名</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}