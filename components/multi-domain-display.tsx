// @ts-nocheck
import React from 'react'
import { useDomain } from '../contexts/domain-context'

export default function MultiDomainDisplay() {
  // 使用域名上下文
  const { domains } = useDomain()

  // Function to format date in a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "未知"
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // 过滤出不同状态的域名
  const availableDomains = domains.filter(domain => domain.status === "available")
  const soldDomains = domains.filter(domain => domain.status === "sold")
  const activeDomains = domains.filter(domain => domain.status === "active")

  return (
    <div className="space-y-8">
      {/* 可用域名 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">可用域名</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableDomains.map(domain => (
            <div
              key={domain.id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold">
                {domain.name}
                <span className="text-gray-500">{domain.extension}</span>
              </h3>
              <p className="text-gray-600">注册商: {domain.registrar || "未知"}</p>
              {domain.registrationTime && (
                <p className="text-gray-600">
                  注册时间: {formatDate(domain.registrationTime)}
                </p>
              )}
              {domain.expirationTime && (
                <p className="text-gray-600">
                  到期时间: {formatDate(domain.expirationTime)}
                </p>
              )}
              {domain.purchaseUrl && (
                <a
                  href={domain.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-blue-600 hover:text-blue-800"
                >
                  购买链接
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 已售出域名 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">已售出域名</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {soldDomains.map(domain => (
            <div
              key={domain.id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold">
                {domain.name}
                <span className="text-gray-500">{domain.extension}</span>
              </h3>
              <p className="text-gray-600">买家: {domain.soldTo || "未知"}</p>
              <p className="text-gray-600">
                售出时间: {formatDate(domain.soldDate)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 活跃域名 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">活跃域名</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeDomains.map(domain => (
            <div
              key={domain.id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold">
                {domain.name}
                <span className="text-gray-500">{domain.extension}</span>
              </h3>
              <p className="text-gray-600">注册商: {domain.registrar || "未知"}</p>
              {domain.registrationTime && (
                <p className="text-gray-600">
                  注册时间: {formatDate(domain.registrationTime)}
                </p>
              )}
              {domain.expirationTime && (
                <p className="text-gray-600">
                  到期时间: {formatDate(domain.expirationTime)}
                </p>
              )}
              {domain.lastChecked && (
                <p className="text-gray-600">
                  最后检查: {formatDate(domain.lastChecked)}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
} 