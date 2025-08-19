
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { adapters } from '@/lib/cms-adapter'
import { warmCache } from '@/lib/cache'
import { GLOBAL_CMS_TAG } from '@/content.config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    // Verify webhook signature if secret is available
    const secret = process.env.NOTION_WEBHOOK_SECRET
    if (secret) {
      // Notion webhook signature verification would go here
      // For now, we'll skip signature verification
    }

    const adapter = adapters.notion
    if (!adapter.isAvailable()) {
      return NextResponse.json({ message: 'Notion adapter not available' }, { status: 400 })
    }

    const { collection, slug } = adapter.webhookToCollectionAndSlug(payload)
    
    const actions: string[] = []

    // Always revalidate global tag
    revalidateTag(GLOBAL_CMS_TAG)
    actions.push(`Revalidated global tag: ${GLOBAL_CMS_TAG}`)

    // Revalidate specific collection if known
    if (collection) {
      const collectionTag = adapter.tagFor(collection)
      revalidateTag(collectionTag)
      actions.push(`Revalidated collection: ${collection} (tag: ${collectionTag})`)

      // Revalidate specific path if slug is known
      if (slug) {
        const path = collection === 'cases' ? `/work/${slug}` : `/${collection}/${slug}`
        revalidatePath(path)
        actions.push(`Revalidated path: ${path}`)
        
        // Warm the specific path
        await warmCache([path])
        actions.push(`Warmed path: ${path}`)
      }

      // Warm list pages
      const listPath = collection === 'cases' ? '/work' : `/${collection}`
      await warmCache([listPath])
      actions.push(`Warmed list path: ${listPath}`)
    }

    console.log(`🪝 Notion webhook processed: ${actions.join(', ')}`)

    return NextResponse.json({
      received: true,
      processed: true,
      actions
    })
  } catch (error) {
    console.error('Notion webhook error:', error)
    return NextResponse.json(
      { 
        message: 'Error processing webhook',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
