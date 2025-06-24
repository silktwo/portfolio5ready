"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import BackToTop from "@/components/back-to-top"
import Footer from "@/components/footer"
import { getPersonalProjects, type PersonalProject } from "@/lib/notion-projects"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

// Image Modal Component with Navigation
function ImageModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
}: {
  images: { src: string; alt: string }[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowLeft") {
        onPrevious()
      } else if (e.key === "ArrowRight") {
        onNext()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose, onNext, onPrevious])

  if (!isOpen || !images[currentIndex]) return null

  const currentImage = images[currentIndex]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Previous button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPrevious()
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        <img
          src={currentImage.src || "/placeholder.svg"}
          alt={currentImage.alt}
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )
}

// Project Card Component
function ProjectCard({
  project,
  className = "",
  onImageClick,
}: {
  project: PersonalProject
  className?: string
  onImageClick: () => void
}) {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div
        className="relative bg-gray-100 overflow-hidden rounded-[6px] mb-2 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={onImageClick}
      >
        <img
          src={imageError ? "/placeholder.svg?height=300&width=300" : project.image}
          alt={project.title}
          className="w-full h-auto object-contain rounded-[6px]"
          onError={handleImageError}
        />
      </div>
      <div className="text-left">
        <p className="text-black text-[12px] tracking-[0] leading-[normal]" style={{ fontFamily: "Roboto Mono, monospace" }}>{project.title}</p>
      </div>
      {project.description && (
        <div className="text-left">
          <p className="text-[11px] text-[#939393] leading-[normal] tracking-[0]" style={{ fontFamily: "Roboto Mono, monospace" }}>
            {project.description}
          </p>
        </div>
      )}</div>
    </div>
  )
}
    </div>
  )
}

export default function PersonalProjects() {
  const [activePage, setActivePage] = useState<string | null>("Personal Projects")
  const [projects, setProjects] = useState<PersonalProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Prepare images for modal
  const modalImages = projects.map((project, index) => ({
    src: project.image,
    alt: project.title,
    projectIndex: index,
  }))

  const openModal = (projectIndex: number) => {
    setCurrentImageIndex(projectIndex)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % modalImages.length)
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + modalImages.length) % modalImages.length)
  }

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true)
        setError(null)
        console.log("Fetching personal projects from Notion...")

        const projectsData = await getPersonalProjects()
        console.log(`Loaded ${projectsData.length} projects from database`)

        setProjects(projectsData)

        // Find the most recently updated project
        if (projectsData.length > 0) {
          const mostRecentProject = projectsData.reduce((latest, current) => {
            const latestDate = new Date(latest.lastEditedTime || latest.createdTime || 0)
            const currentDate = new Date(current.lastEditedTime || current.createdTime || 0)
            return currentDate > latestDate ? current : latest
          })

          // Format the date from the most recent project
          const updateDate = new Date(mostRecentProject.lastEditedTime || mostRecentProject.createdTime || Date.now())
          const day = String(updateDate.getDate()).padStart(2, "0")
          const month = String(updateDate.getMonth() + 1).padStart(2, "0")
          const year = String(updateDate.getFullYear()).slice(-2)
          setLastUpdate(`${day} ${month} ${year}`)
        } else {
          // Fallback to current date if no projects
          const now = new Date()
          const day = String(now.getDate()).padStart(2, "0")
          const month = String(now.getMonth() + 1).padStart(2, "0")
          const year = String(now.getFullYear()).slice(-2)
          setLastUpdate(`${day} ${month} ${year}`)
        }

        if (projectsData.length === 0) {
          setError("No projects found in the Notion database.")
        }
      } catch (err) {
        console.error("Error loading projects:", err)
        setError("Failed to load projects from Notion database.")
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) {
    return (
      <div className="bg-white min-h-screen overflow-x-hidden">
        <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px] min-h-screen">
          <div className="mb-4">
            <Navigation activePage={activePage} setActivePage={setActivePage} />
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px] min-h-screen">
        {/* Top Navigation */}
        <div className="mb-8">
          <Navigation activePage={activePage} setActivePage={setActivePage} />
        </div>

        {/* Header Section */}
        <div className="mb-12">
          <p className="font-medium text-gray-600 text-[14px] max-w-2xl mb-2">
            A collection of personal design explorations, experiments, and creative projects
          </p>
          {lastUpdate && <p className="font-medium text-gray-400 text-[12px]">{lastUpdate}</p>}
        </div>

        {/* Error message if database connection fails */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
            <p className="text-red-600 text-xs mt-2">
              Make sure your Notion database has entries with both workTitle and workFile fields populated.
            </p>
          </div>
        )}

        {/* Personal Projects Grid */}
        <section className="w-full mb-16">
          {projects.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} onImageClick={() => openModal(index)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-sm">No projects found in the database.</p>
              <p className="text-gray-400 text-xs mt-2">
                Add projects to your Notion database with workTitle and workFile fields.
              </p>
            </div>
          )}
        </section>

        {/* Footer Section */}
        <Footer />

        {/* Back to Top Button */}
        <BackToTop />
      </div>

      {/* Image Modal */}
      <ImageModal
        images={modalImages}
        currentIndex={currentImageIndex}
        isOpen={isModalOpen}
        onClose={closeModal}
        onNext={nextImage}
        onPrevious={previousImage}
      />
    </div>
  )
}