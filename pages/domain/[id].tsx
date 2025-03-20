import { useRouter } from 'next/router';
import { ArrowLeftIcon, GlobeAltIcon, CalendarIcon, CurrencyYenIcon, TagIcon } from '@heroicons/react/24/outline';
import Layout from '@/components/Layout';
import Link from 'next/link';

// 模拟域名数据 (与首页相同)
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
    features: [
      '简短易记，仅有11个字符',
      '通用顶级域名.com',
      '适合各类企业和个人使用',
      '已有5年历史，提升品牌可信度'
    ],
    contactEmail: 'sales@domainmarket.com',
    contactPhone: '+86 123 4567 8910'
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
    features: [
      '科技相关名称，直观表明网站内容',
      '流行的.net顶级域名',
      '适合技术博客和IT公司',
      '注册时间较新，价格合理'
    ],
    contactEmail: 'sales@domainmarket.com',
    contactPhone: '+86 123 4567 8910'
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
    features: [
      '直观的名称，表明网站内容',
      '非营利性质的.org顶级域名',
      '适合美食博客和菜谱分享网站',
      '价格实惠'
    ],
    contactEmail: 'sales@domainmarket.com',
    contactPhone: '+86 123 4567 8910'
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
    features: [
      '旅游相关名称，直观表明网站内容',
      '优质.com顶级域名',
      '适合旅游博客和旅行社',
      '已有多年历史，提升品牌可信度'
    ],
    contactEmail: 'sales@domainmarket.com',
    contactPhone: '+86 123 4567 8910'
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
    features: [
      '健身相关名称，直观表明网站内容',
      '流行的.net顶级域名',
      '适合健身教练和健康网站',
      '注册时间较新，价格合理'
    ],
    contactEmail: 'sales@domainmarket.com',
    contactPhone: '+86 123 4567 8910'
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
    features: [
      '艺术相关名称，直观表明网站内容',
      '优质.com顶级域名',
      '适合数字艺术家和艺术网站',
      '已有多年历史，提升品牌可信度'
    ],
    contactEmail: 'sales@domainmarket.com',
    contactPhone: '+86 123 4567 8910'
  },
];

export default function DomainDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  // 查找对应ID的域名
  const domain = MOCK_DOMAINS.find(d => d.id === Number(id));
  
  // 如果域名不存在或页面正在加载
  if (!domain && typeof id !== 'undefined') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">域名不存在</h1>
          <p className="mb-6">您查找的域名不存在或已被删除</p>
          <Link href="/" className="inline-flex items-center text-primary hover:underline">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            返回首页
          </Link>
        </div>
      </Layout>
    );
  }
  
  // 如果页面正在加载
  if (!domain) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p>加载中...</p>
        </div>
      </Layout>
    );
  }
  
  // 格式化价格
  const formattedPrice = new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(domain.price);
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-primary">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            返回域名列表
          </Link>
        </div>
        
        {/* 域名标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{domain.name}</h1>
          <div className="flex items-center text-sm text-gray-500">
            <TagIcon className="h-4 w-4 mr-1" />
            <span className="mr-4">{domain.category}</span>
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>注册于 {domain.registrationDate}</span>
          </div>
        </div>
        
        {/* 主要内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧信息 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">域名描述</h2>
              <p className="text-gray-700 mb-6">{domain.description}</p>
              
              <h2 className="text-xl font-semibold mb-4">域名特点</h2>
              <ul className="space-y-2">
                {domain.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-500 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">域名信息</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">注册日期</p>
                  <p className="font-medium">{domain.registrationDate}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">到期日期</p>
                  <p className="font-medium">{domain.expiryDate}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">类别</p>
                  <p className="font-medium">{domain.category}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">特色域名</p>
                  <p className="font-medium">{domain.featured ? '是' : '否'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 右侧价格和联系信息 */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-gray-500 text-sm mb-1">价格</p>
                <p className="text-3xl font-bold text-primary">{formattedPrice}</p>
              </div>
              
              <button className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition mb-3">
                立即购买
              </button>
              
              <button className="w-full bg-white text-primary border border-primary py-2 px-4 rounded-md hover:bg-gray-50 transition">
                添加到收藏
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">联系信息</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500 text-sm mb-1">电子邮件</p>
                  <p className="font-medium">{domain.contactEmail}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">电话</p>
                  <p className="font-medium">{domain.contactPhone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}