
"use client"

import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import Navigation from "@/components/navigation"
import BackToTop from "@/components/back-to-top"

interface PersonalProject {
  id: string
  title: string
  description?: string
  tags: string[]
  image?: string
  link?: string
  status: "completed" | "in-progress" | "coming-soon"
  priority: number
}

// Mock data for personal projects
const mockPersonalProjects: PersonalProject[] = [
  {
    id: "1",
    title: "Generative Art Collection",
    description: "A series of algorithmic art pieces exploring color theory and geometric patterns.",
    tags: ["Creative Coding", "Art", "Javascript"],
    image: "/placeholder.svg?height=300&width=400",
    link: "https://example.com/art-collection",
    status: "completed",
    priority: 1,
  },
  {
    id: "2",
    title: "Photography Portfolio",
    description: "Personal photography work focusing on urban landscapes and street photography.",
    tags: ["Photography", "Portfolio"],
    image: "/placeholder.svg?height=400&width=300",
    status: "in-progress",
    priority: 2,
  },
  {
    id: "3",
    title: "Interactive Data Visualization",
    description: "Exploring climate data through interactive web-based visualizations.",
    tags: ["Data Viz", "D3.js", "Climate"],
    image: "/placeholder.svg?height=350&width=400",
    status: "coming-soon",
    priority: 3,
  },
  {
    id: "4",
    title: "Experimental Typography",
    description: "Pushing boundaries in digital typography and letterform design.",
    tags: ["Typography", "Design", "Experimental"],
    image: "/placeholder.svg?height=320&width=400",
    status: "completed",
    priority: 4,
  },
  {
    id: "5",
    title: "Sound Visualization",
    description: "Real-time audio visualization using WebGL and modern web technologies.",
    tags: ["WebGL", "Audio", "Creative Coding"],
    image: "/placeholder.svg?height=380&width=350",
    status: "in-progress",
    priority: 5,
  },
  {
    id: "6",
    title: "3D Web Experiments",
    description: "Exploring three-dimensional web experiences with Three.js.",
    tags: ["Three.js", "3D", "WebGL"],
    image: "/placeholder.svg?height=300&width=380",
    status: "coming-soon",
    priority: 6,
  },
]

// Project Card Component
function ProjectCard({ project, className = "" }: { project: PersonalProject; className?: string }) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "coming-soon":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "COMPLETED"
      case "in-progress":
        return "IN PROGRESS"
      case "coming-soon":
        return "COMING SOON"
      default:
        return status.toUpperCase()
    }
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const onImageClick = () => {
    if (project.link && project.status === "completed") {
      window.open(project.link, "_blank")
    }
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div
        className="relative bg-gray-100 overflow-hidden rounded-[6px] mb-2 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={onImageClick}
      >
        {/* Status Badge */}
        <div className="absolute top-2 left-2 z-10">
          <Badge className={`text-[9px] font-medium px-2 py-1 ${getStatusColor(project.status)}`}>
            {getStatusText(project.status)}
          </Badge>
        </div>

        {/* Image */}
        <div className="aspect-[4/3] relative">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-sm">Loading...</div>
            </div>
          )}
          <img
            src={project.image || "/placeholder.svg?height=300&width=400"}
            alt={project.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={handleImageLoad}
          />
        </div>

        {/* Hover Overlay for Completed Projects */}
        {project.status === "completed" && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <div className="text-white opacity-0 hover:opacity-100 transition-opacity duration-300 font-medium text-sm">
              VIEW PROJECT
            </div>
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="text-left">
        <p className="font-medium text-black text-[12px] tracking-[0] leading-[normal] mb-1" style={{ fontFamily: "Roboto Mono, monospace" }}>
          {project.title}
        </p>
        {project.description && (
          <p className="text-[11px] text-[#939393] leading-[normal] tracking-[0] mb-2" style={{ fontFamily: "Roboto Mono, monospace" }}>
            {project.description}
          </p>
        )}
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {project.tags.map((tag, index) => (
            <Badge
              key={index}
              className="text-[9px] font-medium px-2 py-0.5 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PersonalProjectsPage() {
  const [projects, setProjects] = useState<PersonalProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate API call with mock data
    const fetchProjects = async () => {
      try {
        setLoading(true)
        // In a real implementation, you would fetch from your API
        // const response = await fetch('/api/personal-projects')
        // const data = await response.json()
        
        // For now, use mock data
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate loading
        setProjects(mockPersonalProjects.sort((a, b) => a.priority - b.priority))
        setError(null)
      } catch (error) {
        console.error("Error fetching personal projects:", error)
        setError("Failed to load projects")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
    window.scrollTo(0, 0)
  }, [])

  // Distribute projects into columns for desktop layout
  const getColumnProjects = (columnIndex: number, totalColumns: number) => {
    return projects.filter((_, index) => index % totalColumns === columnIndex)
  }

  const column1 = getColumnProjects(0, 3)
  const column2 = getColumnProjects(1, 3)
  const column3 = getColumnProjects(2, 3)

  if (loading) {
    return (
      <div className="bg-white min-h-screen overflow-x-hidden">
        <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
          <div className="mb-4">
            <Navigation />
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen overflow-x-hidden">
        <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
          <div className="mb-4">
            <Navigation />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Projects</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
        {/* Top Navigation */}
        <div className="mb-4">
          <Navigation />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-bold text-black text-[11px] tracking-[0] leading-[normal] mb-4">PERSONAL PROJECTS</h2>
          <p className="text-[12px] text-[#939393] max-w-2xl mx-auto" style={{ fontFamily: "Roboto Mono, monospace" }}>
            A collection of personal explorations, experiments, and passion projects spanning creative coding, photography, and design.
          </p>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects available</p>
          </div>
        ) : (
          <>
            {/* Mobile: Single column */}
            <div className="block sm:hidden">
              <div className="flex flex-col gap-[8px]">
                {projects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>

            {/* Tablet: Two columns */}
            <div className="hidden sm:grid lg:hidden grid-cols-2 gap-x-[10px] gap-y-[8px]">
              <div className="flex flex-col gap-[8px]">
                {getColumnProjects(0, 2).map((project, index) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              <div className="flex flex-col gap-[8px]">
                {getColumnProjects(1, 2).map((project, index) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>

            {/* Desktop: Three columns */}
            <div className="hidden lg:grid grid-cols-3 gap-x-[10px] gap-y-[8px]">
              <div className="flex flex-col gap-[8px]">
                {column1.map((project, index) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              <div className="flex flex-col gap-[8px]">
                {column2.map((project, index) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              <div className="flex flex-col gap-[8px]">
                {column3.map((project, index) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-[11px] text-[#939393]" style={{ fontFamily: "Roboto Mono, monospace" }}>
            More projects coming soon...
          </p>
        </div>
      </div>

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  )
}
