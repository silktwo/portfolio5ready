
import { unstable_cache } from 'next/cache'
import { getActiveAdapters } from './cms-adapter'
import { DEFAULT_REVALIDATE, GLOBAL_CMS_TAG } from '../content.config'

export async function getCachedData<T>(
  collection: string,
  slug?: string,
  revalidate: number = DEFAULT_REVALIDATE
): Promise<T | T[] | null> {
  const activeAdapters = getActiveAdapters()
  
  // Find the right adapter for this collection
  const adapter = Object.values(activeAdapters).find(adapter => adapter.isAvailable())
  
  if (!adapter) {
    console.warn(`No adapter available for collection: ${collection}`)
    return null
  }

  const cacheKey = slug ? `${collection}:${slug}` : `${collection}:list`
  const tags = [GLOBAL_CMS_TAG, adapter.tagFor(collection)]

  const cachedFn = unstable_cache(
    async () => {
      try {
        if (slug) {
          return await adapter.get(collection, slug)
        } else {
          return await adapter.list(collection)
        }
      } catch (error) {
        console.error(`Error fetching ${cacheKey}:`, error)
        return null
      }
    },
    [cacheKey],
    {
      revalidate,
      tags
    }
  )

  return await cachedFn()
}

// Warm cache by fetching data without storing
export async function warmCache(paths: string[]): Promise<void> {
  console.log(`🔥 Warming cache for paths: ${paths.join(', ')}`)
  
  const warmPromises = paths.map(async (path) => {
    try {
      await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}${path}`, {
        cache: 'no-store'
      })
      console.log(`✅ Warmed: ${path}`)
    } catch (error) {
      console.warn(`⚠️ Failed to warm ${path}:`, error)
    }
  })

  await Promise.allSettled(warmPromises)
}
