import { NextResponse } from 'next/server'
import {
  getAllDomains,
  getAllSoldDomains,
  getAllFriendlyLinks,
  insertDomain,
  insertSoldDomain,
  insertFriendlyLink,
  deleteDomain,
  deleteSoldDomain,
  deleteFriendlyLink,
} from '@/lib/db'

export async function GET() {
  try {
    const domains = getAllDomains.all()
    const soldDomains = getAllSoldDomains.all()
    const friendlyLinks = getAllFriendlyLinks.all()

    return NextResponse.json({
      domains,
      soldDomains,
      friendlyLinks,
    })
  } catch (error) {
    console.error('Error fetching domains:', error)
    return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { domains, soldDomains, friendlyLinks } = body

    if (domains) {
      if (!Array.isArray(domains)) {
        return NextResponse.json({ error: 'Domains must be an array' }, { status: 400 })
      }
      domains.forEach((domain: any) => {
        if (!domain.id || !domain.name || !domain.extension || !domain.status) {
          throw new Error('Invalid domain data')
        }
        insertDomain.run(
          domain.id,
          domain.name,
          domain.extension,
          domain.status,
          domain.registrar || null,
          domain.registrarIcon || null,
          domain.registrationTime || null,
          domain.expirationTime || null,
          domain.purchaseUrl || null,
          domain.soldTo || null,
          domain.soldDate || null
        )
      })
    }

    if (soldDomains) {
      if (!Array.isArray(soldDomains)) {
        return NextResponse.json({ error: 'Sold domains must be an array' }, { status: 400 })
      }
      soldDomains.forEach((domain: any) => {
        if (!domain.id || !domain.name || !domain.extension || !domain.status) {
          throw new Error('Invalid sold domain data')
        }
        insertSoldDomain.run(
          domain.id,
          domain.name,
          domain.extension,
          domain.status,
          domain.registrar || null,
          domain.registrarIcon || null,
          domain.registrationTime || null,
          domain.expirationTime || null,
          domain.purchaseUrl || null,
          domain.soldTo || null,
          domain.soldDate || null
        )
      })
    }

    if (friendlyLinks) {
      if (!Array.isArray(friendlyLinks)) {
        return NextResponse.json({ error: 'Friendly links must be an array' }, { status: 400 })
      }
      friendlyLinks.forEach((link: any) => {
        if (!link.id || !link.name || !link.url || !link.description) {
          throw new Error('Invalid friendly link data')
        }
        insertFriendlyLink.run(
          link.id,
          link.name,
          link.url,
          link.description
        )
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating domains:', error)
    return NextResponse.json({ error: 'Failed to update domains' }, { status: 500 })
  }
} 