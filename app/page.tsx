"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import BackToTop from "@/components/back-to-top"
import Footer from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { getCaseProjects, type CaseProject } from "@/lib/notion-cases"

// Project Card Component
function ProjectCard({ project, className = "", onClick }: { project: CaseProject; className?: string; onClick?: () => void }) {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  // Use introImage as thumbnail if available, otherwise fallback to placeholder
  const thumbnailImage = project.introImage || "/placeholder.svg?height=300&width=400"

  return (
    <div
      className={`flex flex-col gap-2 ${className} cursor-pointer group`}
      onClick={() => {
        if (onClick) {
          onClick()
        } else {
          router.push(`/work/${project.slug}`)
        }
      }}
    >
      <p className="font-medium text-black text-[12px] leading-[8px] uppercase">{project.projectTitle}</p>
      <div className="relative bg-gray-100 overflow-hidden transition-transform duration-200 group-hover:scale-[1.02] rounded-lg">
        <img
          src={imageError ? "/placeholder.svg?height=300&width=400" : thumbnailImage}
          alt={project.projectTitle}
          className={`w-full h-full object-cover rounded-lg ${project.comingSoon ? 'blur-sm' : ''}`}
          style={{ height: "300px" }}
          onError={handleImageError}
        />
        {project.comingSoon && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Badge className="bg-black text-white rounded-[10px] px-4 py-1 font-medium text-[10px]">COMING SOON</Badge>
          </div>
        )}
      </div>
    </div>
  )
}

// Three Column Works Section Component
function ThreeColumnWorksSection({ activeFilters, projects }: { activeFilters: string[]; projects: CaseProject[] }) {
  // Filter projects based on active filters
  const filteredProjects =
    activeFilters.length === 0
      ? projects
      : projects.filter((project) => project.categoryTags.some((category) => activeFilters.includes(category)))

  const displayedProjects = filteredProjects.slice(0, 12)

  // Split filtered projects into columns based on screen size
  const column1 = displayedProjects.filter((_, index) => index % 3 === 0)
  const column2 = displayedProjects.filter((_, index) => index % 3 === 1)
  const column3 = displayedProjects.filter((_, index) => index % 3 === 2)

  return (
    <section className="w-full mt-8 mb-16">
      {/* Mobile: Single column */}
      <div className="grid grid-cols-1 gap-[8px] md:hidden">
        {displayedProjects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>

      {/* Tablet: Two columns */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-x-[10px] gap-y-[8px]">
        <div className="flex flex-col gap-[8px]">
          {displayedProjects
            .filter((_, index) => index % 2 === 0)
            .map((project, index) => (
              <ProjectCard key={index} project={project} />
            ))}
        </div>
        <div className="flex flex-col gap-[8px]">
          {displayedProjects
            .filter((_, index) => index % 2 === 1)
            .map((project, index) => (
              <ProjectCard key={index} project={project} />
            ))}
        </div>
      </div>

      {/* Desktop: Three columns */}
      <div className="hidden lg:grid grid-cols-3 gap-x-[10px] gap-y-[8px]">
        <div className="flex flex-col gap-[8px]">
          {column1.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
        <div className="flex flex-col gap-[8px]">
          {column2.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
        <div className="flex flex-col gap-[8px]">
          {column3.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Define a type that is compatible with both CaseProject and your existing project types
type ProjectWithCompat = CaseProject & {
  title?: string // Make title optional
  thumbnail?: string // Make thumbnail optional
  category?: string
}

export default function Home() {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [projects, setProjects] = useState<ProjectWithCompat[]>([])
  const [loading, setLoading] = useState(true)
  const [dataSource, setDataSource] = useState<"database" | "fallback">("fallback")

  // Fetch cases from CMS
  useEffect(() => {
    const fetchCases = async () => {
      try {
        console.log("🔄 Fetching cases for homepage...")
        const result = await getCaseProjects()

        if (result.success && result.data.length > 0) {
          console.log("✅ Successfully loaded cases from database:", result.data.length)
          setProjects(result.data as ProjectWithCompat[])
          setDataSource("database")
        } else {
          console.log("⚠️ No cases found, using fallback data")
          // Fallback projects if CMS fails
          setProjects([
            {
              id: "fallback-1",
              projectTitle: "MAITREYA, LOGO DESIGN, IDENTITY, PACKAGING",
              categoryTags: ["IDENTITY", "PACKAGING"],
              description: "",
              team: "",
              introImage: "/placeholder.svg?height=150&width=200",
              projectMedia: [],
              draftProcess: [],
              addMedia: [],
              publish: true,
              link: "",
              slug: "maitreya-logo-design",
              comingSoon: false,
            },
            {
              id: "fallback-2",
              projectTitle: "FRESH BLACK COLD BREW, PACKAGING",
              categoryTags: ["PACKAGING"],
              description: "",
              team: "",
              introImage: "/placeholder.svg?height=150&width=200",
              projectMedia: [],
              draftProcess: [],
              addMedia: [],
              publish: true,
              link: "",
              slug: "fresh-black-cold-brew",
              comingSoon: true,
            },
          ] as ProjectWithCompat[])
          setDataSource("fallback")
        }
      } catch (error) {
        console.error("❌ Error fetching cases:", error)
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchCases()
  }, [])

  // Generate filter categories from actual project data
  const filterCategories = Array.from(
    new Set(projects.flatMap((project) => project.categoryTags))
  ).sort()

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  const clearFilters = () => {
    setActiveFilters([])
  }

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
        {/* Top Navigation */}
        <div className="mb-4">
          <Navigation />
        </div>

        {/* Three Column Info Section - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12 mb-8 lg:mb-12">
          {/* Column 1: Description */}
          <div className="flex flex-col lg:col-span-1">
            <p className="text-[12px] font-medium text-black leading-[16px]">
              Dmytro Kifuliak. All-in-one designer with 7+ years of experience. Conceives and builds visual systems from
              start to finish — not just beautiful things, but clear, thoughtful, and effective ones. Helps bring
              clarity to chaos and give form to the formless.
              <br />
              <br />I believe good design starts with respect — for the context, the user, and the team.
              <br />
              <br />I value structure and thoughtfulness. In my work, I focus not only on my own vision but also on the
              interests of the team.
              <br />
              <br />
              Open to collaboration. Always forward. Thanks, bye.
            </p>
          </div>

          {/* Column 2: Services & Clients */}
          <div className="flex flex-col sm:flex-row lg:flex-row gap-4 lg:col-span-1">
            {/* Services */}
            <div className="flex flex-col gap-1 flex-1">
              <h3 className="text-[12px] font-bold text-black leading-normal">SERVICES:</h3>
              <Separator className="h-[0.5px] w-full bg-black mb-1" />
              <div className="text-[12px] font-medium text-black leading-[16px]">
                {[
                  "Art Direction",
                  "Graphic Design",
                  "Packaging",
                  "Branding",
                  "Editorial Design",
                  "Motion Design",
                  "Web Design",
                  "Social Media",
                  "Creative Coding",
                ].map((service, index) => (
                  <div key={index}>{service}</div>
                ))}
              </div>
            </div>

            {/* Clients */}
            <div className="flex flex-col gap-1 flex-1">
              <h3 className="text-[12px] font-bold text-black leading-normal">SELECTED CLIENTS:</h3>
              <Separator className="h-[0.5px] w-full bg-black mb-1" />
              <div className="text-[12px] font-medium text-black leading-[16px]">
                {[
                  "Brand Ukraine",
                  "Uklon",
                  "Silpo",
                  "Etnodim",
                  "Galychyna",
                  "Ministry of Foreign Affairs of Ukraine",
                  "Ministry of Digital Transformation of Ukraine",
                  "Ukrainian Institute",
                  "Vodafone Ukraine",
                  "Sense Bank",
                ].map((client, index) => (
                  <div key={index}>{client}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Let's Get Connected */}
          <div className="flex flex-col gap-1 lg:col-span-1">
            <h3 className="text-[12px] font-bold text-black leading-normal">{"LET'S GET CONNECTED:"}</h3>
            <Separator className="h-[0.5px] w-full bg-black mb-1" />
            <p className="text-[12px] font-medium text-black leading-[16px] mb-2">
              Looking to collaborate on innovative projects at the intersection of technology, culture, and design.
              Especially interested in visual systems, identity work, and visual storytelling.
            </p>
            <div className="text-[12px] font-medium text-black leading-[16px]">
              {[
                { name: "instagram", url: "https://www.instagram.com/tiredxs/" },
                { name: "telegram", url: "http://t.me/tiredxs" },
                { name: "mail", url: "mailto:kifuliak66@gmail.com" },
                { name: "read.cv", url: "https://read.cv/tiredxs" },
                { name: "are.na", url: "https://www.are.na/dima-kifuliak" },
              ].map((link, index) => (
                <div key={index} className="hover:underline cursor-pointer">
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.name}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Categories with Static X Icons */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {activeFilters.length > 0 && (
            <Badge
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full transition-colors cursor-pointer hover:opacity-80 bg-black text-white"
            >
              <span className="text-[11px] font-bold">CLEAR ALL</span>
              <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <X className="w-2 h-2 text-black" />
              </div>
            </Badge>
          )}
          {filterCategories.map((filter, index) => {
            const isActive = activeFilters.includes(filter)
            return (
              <Badge
                key={index}
                onClick={() => toggleFilter(filter)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full transition-colors cursor-pointer hover:opacity-80 ${
                  isActive ? "bg-black text-white" : "bg-[rgba(149,149,149,0.2)] text-[rgba(148,148,148,1)]"
                }`}
              >
                <span className="text-[11px] font-bold">{filter}</span>
                {isActive && (
                  <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <X className="w-2 h-2 text-black" />
                  </div>
                )}
              </Badge>
            )
          })}
        </div>

        {/* Data Source Indicator */}
        {dataSource === "fallback" && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              ⚠️ Using fallback data. Check{" "}
              <a href="/cases-debug" className="underline">
                Cases Debug
              </a>{" "}
              to troubleshoot the database connection.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <p className="text-gray-500">Loading projects...</p>
          </div>
        )}

        {/* Three Column Works Section */}
        {!loading && <ThreeColumnWorksSection activeFilters={activeFilters} projects={projects} />}

        {/* Footer Section */}
        <Footer />

        {/* Back to Top Button */}
        <BackToTop />
      </div>
    </div>
  )
}