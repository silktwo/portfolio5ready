export interface CaseProject {
  id: string
  projectTitle: string
  categoryTags: string[]
  description: string
  team: string
  introImage: string
  projectMedia: string[]
  draftProcess: string[]
  addMedia: string[]
  publish: boolean
  link: string
  slug: string // Added slug field
}

function cleanDatabaseId(id: string): string {
  return id.replace(/-/g, "")
}

function extractTextFromRichText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return ""
  return richText.map((text) => text.plain_text || "").join("")
}

function extractFilesFromProperty(files: any[]): string[] {
  if (!files || !Array.isArray(files)) return []
  return files
    .map((file) => {
      if (file.type === "file") return file.file?.url || ""
      if (file.type === "external") return file.external?.url || ""
      return ""
    })
    .filter(Boolean)
}

function extractMultiSelectFromProperty(multiSelect: any[]): string[] {
  if (!multiSelect || !Array.isArray(multiSelect)) return []
  return multiSelect.map((item) => item.name || "").filter(Boolean)
}

// Generate slug from project title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Function to get a single case by slug
export async function getCaseBySlug(slug: string): Promise<CaseProject | null> {
  try {
    console.log(`🔍 Searching for case with slug: ${slug}`)

    // Get all cases first
    const result = await getCaseProjects()

    if (!result.success || result.data.length === 0) {
      console.log("❌ No cases found or failed to fetch")
      return null
    }

    // Find case by matching slug
    const project = result.data.find((project) => project.slug === slug)

    if (project) {
      console.log(`✅ Found matching project: ${project.projectTitle}`)
      return project
    }

    console.log(`❌ No project found for slug: ${slug}`)
    return null
  } catch (error) {
    console.error("❌ Error in getCaseBySlug:", error)
    return null
  }
}

export async function getCaseProjects(): Promise<{
  success: boolean
  data: CaseProject[]
  metadata: {
    count: number
    errors: string[]
    warnings: string[]
    debugInfo: any
  }
}> {
  const metadata = {
    count: 0,
    errors: [] as string[],
    warnings: [] as string[],
    debugInfo: {} as any,
  }

  try {
    console.log("🔍 Starting case projects fetch...")

    // Get environment variables with fallback
    const token = process.env.CASES_TOKEN || process.env.NOTION_TOKEN || process.env.PERSONAL_TOKEN
    const databaseId = cleanDatabaseId(process.env.CASES_DATABASE_ID || process.env.NOTION_DATABASE_ID || "20855dd5594d805f94d8d0f5686b292d")

    metadata.debugInfo.token = token ? `${token.substring(0, 10)}...` : "Not found"
    metadata.debugInfo.databaseId = databaseId

    if (!token) {
      metadata.errors.push("No authentication token found. Please set CASES_TOKEN in your environment variables.")
      console.log("🔍 Available environment variables:", {
        CASES_TOKEN: process.env.CASES_TOKEN ? "Set" : "Not set",
        NOTION_TOKEN: process.env.NOTION_TOKEN ? "Set" : "Not set", 
        PERSONAL_TOKEN: process.env.PERSONAL_TOKEN ? "Set" : "Not set"
      })
      return { success: false, data: [], metadata }
    }

    if (!databaseId) {
      metadata.errors.push("No database ID found. Please set CASES_DATABASE_ID.")
      return { success: false, data: [], metadata }
    }

    console.log("🔑 Using token:", token.substring(0, 10) + "...")
    console.log("🗄️ Using database ID:", databaseId)

    // Import Notion client
    const { Client } = await import("@notionhq/client")

    const notion = new Client({
      auth: token,
      timeoutMs: 15000,
    })

    console.log("📡 Fetching from Notion database...")

    // Query the database
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
      filter: {
        property: "publish",
        checkbox: {
          equals: true,
        },
      },
    })

    console.log("📊 Raw response received:", response.results.length, "records")
    metadata.debugInfo.rawCount = response.results.length

    const projects: CaseProject[] = []

    for (const page of response.results) {
      try {
        if (!("properties" in page)) {
          metadata.warnings.push(`Skipping page ${page.id}: No properties found`)
          continue
        }

        const properties = page.properties

        // Extract required fields
        const projectTitle = extractTextFromRichText(properties.projectTitle?.title || [])
        const description = extractTextFromRichText(properties.description?.rich_text || [])
        const team = extractTextFromRichText(properties.team?.rich_text || [])
        const categoryTags = extractMultiSelectFromProperty(properties.categoryTags?.multi_select || [])
        const introImage = extractFilesFromProperty(properties.introImage?.files || [])[0] || ""
        const projectMedia = extractFilesFromProperty(properties.projectMedia?.files || [])
        const draftProcess = extractFilesFromProperty(properties.draftProcess?.files || [])
        const addMedia = extractFilesFromProperty(properties.addMedia?.files || [])
        const publish = properties.publish?.checkbox || false
        const link = properties.link?.url || ""

        // Generate slug from title
        const slug = generateSlug(projectTitle)

        // Validate required fields
        if (!projectTitle) {
          metadata.warnings.push(`Skipping project: Missing projectTitle`)
          continue
        }

        if (!introImage) {
          metadata.warnings.push(`Skipping project "${projectTitle}": Missing introImage`)
          continue
        }

        // Only include published projects
        if (!publish) {
          metadata.warnings.push(`Skipping project "${projectTitle}": Not published`)
          continue
        }

        const project: CaseProject = {
          id: page.id,
          projectTitle,
          categoryTags,
          description,
          team,
          introImage,
          projectMedia,
          draftProcess,
          addMedia,
          publish,
          link,
          slug,
        }

        projects.push(project)
        console.log("✅ Processed project:", projectTitle, "with slug:", slug)
      } catch (error) {
        metadata.warnings.push(
          `Error processing page ${page.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
        )
        console.error("Error processing page:", error)
      }
    }

    metadata.count = projects.length
    metadata.debugInfo.processedCount = projects.length

    console.log("🎉 Successfully processed", projects.length, "case projects")

    return {
      success: true,
      data: projects,
      metadata,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    metadata.errors.push(`Failed to fetch case projects: ${errorMessage}`)
    console.error("❌ Error in getCaseProjects:", error)

    return {
      success: false,
      data: [],
      metadata,
    }
  }
}
