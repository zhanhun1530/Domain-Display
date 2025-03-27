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
    domains: ['localhost'],
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
    DATA_STORAGE_TYPE: process.env.VERCEL === '1' ? 'json' : 'sqlite',
  },
  // 为Vercel部署做准备
  webpack: (config, { isServer }) => {
    // 避免在Vercel中打包native模块
    if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') {
      config.externals = [...(config.externals || []), 'better-sqlite3'];
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
