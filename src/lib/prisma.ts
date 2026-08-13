import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import { getCloudflareContext } from '@opennextjs/cloudflare'

const createPrismaClient = (accelerateUrl: string) => {
  return new PrismaClient({ accelerateUrl }).$extends(withAccelerate())
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

let cached: ExtendedPrismaClient | null = null

export async function getPrisma(): Promise<ExtendedPrismaClient> {
  if (cached) return cached

  let connectionString = process.env.DATABASE_URL

  try {
    const { env } = await getCloudflareContext({ async: true })
    connectionString = (env as any).DATABASE_URL || connectionString
  } catch {
    // ignore outside Workers
  }

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set.')
  }

  cached = createPrismaClient(connectionString)
  return cached
}