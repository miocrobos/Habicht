/**
 * Verify all club logos are accessible
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

async function checkLogo(url: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await axios.head(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      validateStatus: () => true // Accept any status
    })
    
    if (response.status === 403) {
      // Try GET instead of HEAD (some servers don't support HEAD)
      const getResponse = await axios.get(url, {
        timeout: 10000,
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        validateStatus: () => true
      })
      
      if (getResponse.status >= 200 && getResponse.status < 400) {
        return { ok: true }
      }
      return { ok: false, error: `HTTP ${getResponse.status}` }
    }
    
    if (response.status >= 200 && response.status < 400) {
      return { ok: true }
    }
    
    return { ok: false, error: `HTTP ${response.status}` }
  } catch (error: any) {
    return { ok: false, error: error.message }
  }
}

async function main() {
  console.log('🔍 Verifying All Club Logos\n')
  console.log('============================\n')

  const clubs = await prisma.club.findMany({
    where: { logo: { not: null } },
    select: { id: true, name: true, logo: true }
  })

  let valid = 0
  let invalid = 0
  const errors: { name: string; logo: string; error: string }[] = []

  for (const club of clubs) {
    if (!club.logo) continue
    
    const result = await checkLogo(club.logo)
    
    if (result.ok) {
      valid++
      process.stdout.write('.')
    } else {
      invalid++
      errors.push({ name: club.name, logo: club.logo, error: result.error || 'Unknown' })
      process.stdout.write('X')
    }
  }

  console.log('\n\n📊 Results:')
  console.log(`   Valid: ${valid}`)
  console.log(`   Invalid: ${invalid}`)

  if (errors.length > 0) {
    console.log('\n❌ Invalid logos:')
    for (const e of errors) {
      console.log(`   ${e.name}: ${e.error}`)
      console.log(`      ${e.logo.substring(0, 80)}...`)
    }
  }

  await prisma.$disconnect()
}

main()
