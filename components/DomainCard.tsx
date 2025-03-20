import Link from 'next/link';
import { TagIcon, CalendarIcon, CurrencyYenIcon } from '@heroicons/react/24/outline';

interface DomainProps {
  domain: {
    id: number;
    name: string;
    category: string;
    price: number;
    description: string;
    registrationDate: string;
    expiryDate: string;
    featured: boolean;
  };
}

export default function DomainCard({ domain }: DomainProps) {
  // 格式化价格
  const formattedPrice = new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(domain.price);
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg ${domain.featured ? 'border-l-4 border-primary' : ''}`}>
      {/* 域名信息 */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold truncate">{domain.name}</h3>
          {domain.featured && (
            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">推荐</span>
          )}
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <TagIcon className="h-4 w-4 mr-1" />
          <span>{domain.category}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{domain.description}</p>
        
        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>到期: {domain.expiryDate}</span>
          </div>
          <div className="font-semibold text-primary text-lg">{formattedPrice}</div>
        </div>
        
        <Link href={`/domain/${domain.id}`} className="block w-full bg-primary text-white text-center py-2 rounded-md hover:bg-opacity-90 transition">
          查看详情
        </Link>
      </div>
    </div>
  );
}