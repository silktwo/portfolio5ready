
"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import BackToTop from "@/components/back-to-top"

interface PersonalProject {
  id: string
  title: string
  slug: string
  image: string
  height?: string
}

// Personal Projects CMS Data
const personalProjects: PersonalProject[] = [
  {
    id: "1",
    title: "METAL-GEAR.EXE",
    slug: "metal-gear-exe",
    image: "https://via.placeholder.com/400x600/000000/FFFFFF?text=METAL-GEAR.EXE",
    height: "300px",
  },
  {
    id: "2",
    title: "NEURAL NETWORKS",
    slug: "neural-networks",
    image: "https://via.placeholder.com/400x500/333333/FFFFFF?text=NEURAL+NETWORKS",
    height: "250px",
  },
  {
    id: "3",
    title: "DIGITAL SCULPTURES",
    slug: "digital-sculptures",
    image: "https://via.placeholder.com/400x700/666666/FFFFFF?text=DIGITAL+SCULPTURES",
    height: "350px",
  },
  {
    id: "4",
    title: "CODE POETRY",
    slug: "code-poetry",
    image: "https://via.placeholder.com/400x400/999999/FFFFFF?text=CODE+POETRY",
    height: "200px",
  },
  {
    id: "5",
    title: "GENERATIVE ART",
    slug: "generative-art",
    image: "https://via.placeholder.com/400x550/CCCCCC/000000?text=GENERATIVE+ART",
    height: "275px",
  },
  {
    id: "6",
    title: "EXPERIMENTAL UI",
    slug: "experimental-ui",
    image: "https://via.placeholder.com/400x450/EEEEEE/000000?text=EXPERIMENTAL+UI",
    height: "225px",
  },
]

// Project Card Component
function ProjectCard({ project, className = "" }: { project: PersonalProject; className?: string }) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const onImageClick = () => {
    // You can add navigation logic here if needed
    console.log(`Clicked on project: ${project.title}`)
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div
        className="relative bg-gray-100 overflow-hidden rounded-[6px] mb-2 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={onImageClick}
        style={{ height: project.height || "200px" }}
      >
        {/* Image */}
        <div className="w-full h-full relative">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-sm">Loading...</div>
            </div>
          )}
          <img
            src={project.image}
            alt={project.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={handleImageLoad}
          />
        </div>
      </div>

      {/* Project Info */}
      <div className="text-left">
        <p className="font-medium text-black text-[12px] tracking-[0] leading-[normal] mb-1" style={{ fontFamily: "Roboto Mono, monospace" }}>
          {project.title}
        </p>
      </div>
    </div>
  )
}

export default function PersonalProjectsPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Distribute projects into columns for desktop layout
  const getColumnProjects = (columnIndex: number, totalColumns: number) => {
    return personalProjects.filter((_, index) => index % totalColumns === columnIndex)
  }

  const column1 = getColumnProjects(0, 3)
  const column2 = getColumnProjects(1, 3)
  const column3 = getColumnProjects(2, 3)

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
        <>
          {/* Mobile: Single column */}
          <div className="block sm:hidden">
            <div className="flex flex-col gap-[8px]">
              {personalProjects.map((project, index) => (
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
