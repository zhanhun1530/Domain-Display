import { NextResponse } from 'next/server'
import {
  getAllDomains,
  getAllSoldDomains,
  getAllFriendlyLinks,
  deleteDomain,
  deleteSoldDomain,
  deleteFriendlyLink,
} from '@/lib/db'

export async function POST() {
  try {
    // 清空数据库表
    const domains = getAllDomains.all()
    const soldDomains = getAllSoldDomains.all()
    const friendlyLinks = getAllFriendlyLinks.all()

    // 使用事务来确保所有删除操作都成功
    try {
      domains.forEach((domain: any) => {
        if (domain.id) {
          deleteDomain.run(domain.id)
        }
      })
      soldDomains.forEach((domain: any) => {
        if (domain.id) {
          deleteSoldDomain.run(domain.id)
        }
      })
      friendlyLinks.forEach((link: any) => {
        if (link.id) {
          deleteFriendlyLink.run(link.id)
        }
      })
    } catch (error) {
      console.error('Error during database cleanup:', error)
      throw new Error('Failed to clean up database')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error resetting domains:', error)
    return NextResponse.json({ error: 'Failed to reset domains' }, { status: 500 })
  }
} 