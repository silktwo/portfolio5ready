
export interface CMSAdapter {
  list(collection: string): Promise<any[]>
  get(collection: string, slug: string): Promise<any | null>
  webhookToCollectionAndSlug(payload: any): { collection?: string; slug?: string }
  tagFor(collection: string): string
  isAvailable(): boolean
}

export class NotionAdapter implements CMSAdapter {
  private isConfigured = false

  constructor() {
    // Check if Notion is configured
    const token = process.env.CASES_TOKEN || process.env.NOTION_TOKEN || process.env.PERSONAL_TOKEN
    const databaseId = process.env.CASES_DATABASE_ID || process.env.NOTION_DATABASE_ID
    this.isConfigured = !!(token && databaseId)
  }

  isAvailable(): boolean {
    return this.isConfigured
  }

  async list(collection: string): Promise<any[]> {
    if (collection === 'cases') {
      const { getCaseProjects } = await import('./notion-cases')
      const result = await getCaseProjects()
      return result.success ? result.data : []
    }
    return []
  }

  async get(collection: string, slug: string): Promise<any | null> {
    if (collection === 'cases') {
      const { getCaseBySlug } = await import('./notion-cases')
      return await getCaseBySlug(slug)
    }
    return null
  }

  webhookToCollectionAndSlug(payload: any): { collection?: string; slug?: string } {
    // Notion webhook parsing logic
    return { collection: 'cases' }
  }

  tagFor(collection: string): string {
    return `cms:${collection}`
  }
}

export class ContentfulAdapter implements CMSAdapter {
  isAvailable(): boolean {
    return !!(process.env.CONTENTFUL_SPACE_ID && process.env.CONTENTFUL_ACCESS_TOKEN)
  }

  async list(collection: string): Promise<any[]> {
    if (!this.isAvailable()) return []
    // Contentful implementation would go here
    return []
  }

  async get(collection: string, slug: string): Promise<any | null> {
    if (!this.isAvailable()) return null
    // Contentful implementation would go here
    return null
  }

  webhookToCollectionAndSlug(payload: any): { collection?: string; slug?: string } {
    return {}
  }

  tagFor(collection: string): string {
    return `cms:${collection}`
  }
}

export class SanityAdapter implements CMSAdapter {
  isAvailable(): boolean {
    return !!(process.env.SANITY_PROJECT_ID && process.env.SANITY_DATASET)
  }

  async list(collection: string): Promise<any[]> {
    if (!this.isAvailable()) return []
    return []
  }

  async get(collection: string, slug: string): Promise<any | null> {
    if (!this.isAvailable()) return null
    return null
  }

  webhookToCollectionAndSlug(payload: any): { collection?: string; slug?: string } {
    return {}
  }

  tagFor(collection: string): string {
    return `cms:${collection}`
  }
}

// Registry of available adapters
export const adapters = {
  notion: new NotionAdapter(),
  contentful: new ContentfulAdapter(),
  sanity: new SanityAdapter(),
}

// Get active adapters (only those that are configured)
export function getActiveAdapters(): Record<string, CMSAdapter> {
  const active: Record<string, CMSAdapter> = {}
  
  Object.entries(adapters).forEach(([name, adapter]) => {
    if (adapter.isAvailable()) {
      active[name] = adapter
      console.log(`✅ CMS Adapter activated: ${name}`)
    } else {
      console.log(`⏭️ CMS Adapter skipped: ${name} (not configured)`)
    }
  })
  
  return active
}
