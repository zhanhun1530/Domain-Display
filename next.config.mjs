let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['example.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  typescript: {
    // 类型检查失败时允许构建继续执行
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint错误不阻止构建
    ignoreDuringBuilds: true,
  },
  // Vercel部署环境检测
  env: {
    IS_VERCEL: process.env.VERCEL === '1' ? '1' : '0',
  },
  // 输出独立部署文件
  output: 'standalone',
  // 为Vercel部署做准备
  webpack: (config, { isServer }) => {
    // 避免在生产环境中打包原生模块
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
