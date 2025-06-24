
import { getCaseBySlug } from "@/lib/notion-cases"
import WorkPageClient from "./WorkPageClient"
import type { Metadata } from "next"

// Enhanced slug matching function
function findProjectBySlug(projects: any[], targetSlug: string) {
  // First try exact match
  let project = projects.find(p => p.slug === targetSlug)
  if (project) return project
  
  // Try partial matches for backward compatibility
  const targetWords = targetSlug.toLowerCase().split('-')
  const firstWord = targetWords[0]
  
  // Look for projects that start with the first word
  project = projects.find(p => {
    const projectSlug = p.slug.toLowerCase()
    return projectSlug.startsWith(firstWord) || projectSlug.includes(firstWord)
  })
  
  if (project) return project
  
  // Try matching by project title
  project = projects.find(p => {
    const titleWords = p.projectTitle.toLowerCase().split(/[\s,]+/)
    return titleWords.some(word => targetWords.includes(word))
  })
  
  return project
}

interface Props {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params
    
    // Try to get from database
    const project = await getCaseBySlug(resolvedParams.slug)

    if (project) {
      return {
        title: project.projectTitle,
        description: project.description,
      }
    }

    // Try fallback data
    const fallbackProject = fallbackProjects[resolvedParams.slug]
    if (fallbackProject) {
      return {
        title: fallbackProject.projectTitle,
        description: fallbackProject.description,
      }
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
  }

  // Default metadata
  return {
    title: "Case Study",
    description: "View this case study project",
  }
}

export default async function WorkPage({ params }: Props) {
  try {
    const resolvedParams = await params
    console.log(`🔍 Server: Fetching project with slug: ${resolvedParams.slug}`)

    // Try to get from database
    let project = await getCaseBySlug(resolvedParams.slug)
    let dataSource = "database"

    // If not found with exact slug, try enhanced matching
    if (!project) {
      console.log(`⚠️ Server: Project not found with exact slug, trying enhanced matching`)
      
      // Get all projects and try enhanced matching
      const { getCaseProjects } = await import("@/lib/notion-cases")
      const allProjectsResult = await getCaseProjects()
      
      if (allProjectsResult.success && allProjectsResult.data.length > 0) {
        project = findProjectBySlug(allProjectsResult.data, resolvedParams.slug)
        if (project) {
          console.log(`✅ Server: Found project with enhanced matching: ${project.projectTitle}`)
          dataSource = "database"
        }
      }
    }

    // If we have a project (either from database or fallback), render the page
    if (project) {
      return <WorkPageClient params={resolvedParams} initialProject={project} dataSource={dataSource} />
    }

    // If no project found, show a custom not found page
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Project Not Found</h1>
            <p className="mt-2">
              The project "{resolvedParams.slug}" could not be found. Please check the URL or return to the projects page.
            </p>
            <div className="mt-4">
              <a href="/work" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
                Back to Projects
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in WorkPage:", error)

    // Show error page
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Error Loading Project</h1>
            <p className="mt-2">
              There was an error loading this project. Please try again later or return to the projects page.
            </p>
            <div className="mt-4">
              <a href="/work" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
                Back to Projects
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
