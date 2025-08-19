
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { adapters } from '@/lib/cms-adapter'
import { warmCache } from '@/lib/cache'
import { GLOBAL_CMS_TAG } from '@/content.config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    const adapter = adapters.contentful
    if (!adapter.isAvailable()) {
      return NextResponse.json({ message: 'Contentful adapter not available' }, { status: 400 })
    }

    const { collection, slug } = adapter.webhookToCollectionAndSlug(payload)
    
    const actions: string[] = []

    // Always revalidate global tag
    revalidateTag(GLOBAL_CMS_TAG)
    actions.push(`Revalidated global tag: ${GLOBAL_CMS_TAG}`)

    // Handle collection-specific revalidation
    if (collection) {
      const collectionTag = adapter.tagFor(collection)
      revalidateTag(collectionTag)
      actions.push(`Revalidated collection: ${collection}`)

      if (slug) {
        const path = `/${collection}/${slug}`
        revalidatePath(path)
        await warmCache([path])
        actions.push(`Revalidated and warmed: ${path}`)
      }
    }

    console.log(`🪝 Contentful webhook processed: ${actions.join(', ')}`)

    return NextResponse.json({
      received: true,
      processed: true,
      actions
    })
  } catch (error) {
    console.error('Contentful webhook error:', error)
    return NextResponse.json(
      { 
        message: 'Error processing webhook',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
