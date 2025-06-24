"use client"

import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import Navigation from "@/components/navigation"
import BackToTop from "@/components/back-to-top"
import { useRouter } from "next/navigation"
import { getCaseProjects, type CaseProject } from "@/lib/notion-cases"

interface TeamMember {
  role: string
  name: string
  isPrimary?: boolean
}

interface Props {
  params: {
    slug: string
  }
  initialProject: CaseProject
  dataSource: "database" | "fallback"
}

export default function WorkPageClient({ params, initialProject, dataSource }: Props) {
  const router = useRouter()
  const [caseProject, setCaseProject] = useState<CaseProject>(initialProject)
  const [allProjects, setAllProjects] = useState<CaseProject[]>([initialProject])
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState("project")

  // Social links
  const socialLinks = [
    { name: "instagram", url: "https://www.instagram.com/tiredxs/" },
    { name: "telegram", url: "http://t.me/tiredxs" },
    { name: "mail", url: "mailto:kifuliak66@gmail.com" },
    { name: "read.cv", url: "https://read.cv/tiredxs" },
    { name: "are.na", url: "https://www.are.na/dima-kifuliak" },
  ]

  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        setLoading(true)
        const result = await getCaseProjects()

        if (result.success && result.data.length > 0) {
          // Add the current project if it's not from the database
          if (dataSource === "fallback") {
            const existingProject = result.data.find((p) => p.slug === initialProject.slug)
            if (!existingProject) {
              result.data.push(initialProject)
            }
          }

          setAllProjects(result.data)

          // Find current project index
          const index = result.data.findIndex((p) => p.slug === params.slug)
          setCurrentProjectIndex(index >= 0 ? index : 0)
        } else if (dataSource === "fallback") {
          // If we're using fallback data and database fetch failed, just use the initial project
          setAllProjects([initialProject])
        }
      } catch (error) {
        console.error("Failed to fetch all projects:", error)
        // If fetch fails, ensure we at least have the current project
        setAllProjects([initialProject])
      } finally {
        setLoading(false)
      }
    }

    fetchAllProjects()
  }, [params.slug, initialProject, dataSource])

  // Parse team members from string
  const parseTeamMembers = (teamString: string): TeamMember[] => {
    if (!teamString) return []

    // Try to parse team members from format like "Designer: John Doe, Creative Director: Jane Smith"
    const members: TeamMember[] = []
    const parts = teamString.split(",").map((part) => part.trim())

    parts.forEach((part, index) => {
      const roleSplit = part.split(":")
      if (roleSplit.length === 2) {
        members.push({
          role: roleSplit[0].trim(),
          name: roleSplit[1].trim(),
          isPrimary: index === 0, // First person is primary
        })
      } else {
        // If format doesn't match, just add as is
        members.push({
          role: "Team Member",
          name: part,
          isPrimary: index === 0,
        })
      }
    })

    return members
  }

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setActiveSection(sectionId)
    }
  }

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["project", "info", "gallery", "drafts", "contact"]
      const scrollPosition = window.scrollY + window.innerHeight / 2

      // Check if we're near the bottom of the page
      const isNearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 100

      if (isNearBottom) {
        setActiveSection("contact")
        return
      }

      // Otherwise, find the section that's currently in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop } = element
          if (scrollPosition >= offsetTop) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Add useEffect to ensure page starts at the top
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const teamMembers = parseTeamMembers(caseProject.team)
  const hasDrafts = caseProject.draftProcess && caseProject.draftProcess.length > 0

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {dataSource === "fallback" && (
        <div className="fixed top-20 left-0 right-0 z-50 flex justify-center">
          <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-md shadow-md">
            <p className="text-sm text-yellow-800">
              ⚠️ Using fallback data.{" "}
              <a href="/cases-debug" className="underline">
                Debug connection
              </a>{" "}
              to use live data.
            </p>
          </div>
        </div>
      )}

      {/* Navigation - Overlaid on top of image */}
      <div className="absolute top-0 left-0 right-0 z-40">
        <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
          <Navigation />
        </div>
      </div>

      {/* Case Navigation Block - Right side, scrolls with page */}
      <div className="fixed top-[50%] right-[20px] transform -translate-y-1/2 z-50">
        <div className="bg-black rounded-xl p-1">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => scrollToSection("project")}
              className={`px-3 py-1.5 text-[11px] font-bold transition-colors rounded-md ${
                activeSection === "project"
                  ? "bg-[#eaeaea] text-[#202020]"
                  : "bg-transparent text-[#eaeaea] hover:bg-gray-800"
              }`}
            >
              {caseProject.projectTitle.toUpperCase()}
            </button>
            <button
              onClick={() => scrollToSection("info")}
              className={`px-3 py-1.5 text-[11px] font-medium transition-colors rounded-md ${
                activeSection === "info"
                  ? "bg-[#eaeaea] text-[#202020]"
                  : "bg-transparent text-[#eaeaea] hover:bg-gray-800"
              }`}
            >
              PROJECT INFO
            </button>
            <button
              onClick={() => scrollToSection("gallery")}
              className={`px-3 py-1.5 text-[11px] font-medium transition-colors rounded-md ${
                activeSection === "gallery"
                  ? "bg-[#eaeaea] text-[#202020]"
                  : "bg-transparent text-[#eaeaea] hover:bg-gray-800"
              }`}
            >
              GALLERY
            </button>
            {hasDrafts && (
              <button
                onClick={() => scrollToSection("drafts")}
                className={`px-3 py-1.5 text-[11px] font-medium transition-colors rounded-md ${
                  activeSection === "drafts"
                    ? "bg-[#eaeaea] text-[#202020]"
                    : "bg-transparent text-[#eaeaea] hover:bg-gray-800"
                }`}
              >
                DRAFTS
              </button>
            )}
            <button
              onClick={() => scrollToSection("contact")}
              className={`px-3 py-1.5 text-[11px] font-medium transition-colors rounded-md ${
                activeSection === "contact"
                  ? "bg-[#eaeaea] text-[#202020]"
                  : "bg-transparent text-[#eaeaea] hover:bg-gray-800"
              }`}
            >
              CONTACT
            </button>
          </div>
        </div>
      </div>

      {/* Cover Image - Full Screen, starts from top */}
      <section id="project" className="w-full h-screen relative">
        <img
          src={caseProject.introImage || "/placeholder.svg"}
          alt={caseProject.projectTitle}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </section>

      {/* Project Information Section */}
      <section id="info" className="py-0">
        <div className="max-w-[1200px] mx-auto px-[20px] sm:px-[30px]">
          {/* Project Information Header */}
          <div className="text-center mb-8">
            <h2 className="font-bold text-black text-[11px] tracking-[0] leading-[normal] mb-4">PROJECT INFORMATION</h2>
          </div>

          <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-12 max-w-[800px] mx-auto">
            {/* Description - Left Side */}
            <div className="flex-1">
              <h3 className="font-medium text-black text-[11px] mb-4 tracking-[0] leading-[normal]">DESCRIPTION:</h3>
              <p className="font-medium text-black text-[12px] tracking-[0] leading-[normal]">
                {caseProject.description}
              </p>
            </div>

            {/* Team Credits - Right Side with Roboto Mono */}
            <div className="w-full lg:w-[300px]">
              <h3 className="font-medium text-black text-[11px] mb-4 tracking-[0] leading-[normal]">TEAM:</h3>
              <div className="space-y-2">
                {teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className={`font-mono text-[11px] tracking-[0] leading-[normal] ${
                      member.isPrimary ? "text-black" : "text-[#939393]"
                    }`}
                    style={{ fontFamily: "Roboto Mono, monospace" }}
                  >
                    {member.role}: {member.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Full-width images without gaps after description */}
        {caseProject.projectMedia && caseProject.projectMedia.length > 0 && (
          <div className="mt-0">
            {caseProject.projectMedia.slice(0, 3).map((image, index) => {
              // Determine layout: every 3rd image (index 2, 5, 8, etc.) is full-width
              const isFullWidth = (index + 1) % 3 === 0
              const isPairStart = (index + 1) % 3 === 1

              if (isFullWidth) {
                // Full-width image
                return (
                  <div key={index} className="w-full">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${caseProject.projectTitle} - Image ${index + 1}`}
                      className="w-full h-full object-cover block rounded-[6px]"
                      style={{ margin: 0, padding: 0, display: "block" }}
                    />
                  </div>
                )
              } else if (isPairStart) {
                // Start of a pair - check if there's a next image
                const nextImage = caseProject.projectMedia[index + 1]
                if (nextImage) {
                  // Render pair without gap
                  return (
                    <div key={`pair-${index}`} className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 0 }}>
                      <div className="w-full">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${caseProject.projectTitle} - Image ${index + 1}`}
                          className="w-full h-full object-cover block rounded-[6px]"
                          style={{ margin: 0, padding: 0, display: "block" }}
                        />
                      </div>
                      <div className="w-full" style={{ margin: 0, padding: 0 }}>
                        <img
                          src={nextImage || "/placeholder.svg"}
                          alt={`${caseProject.projectTitle} - Image ${index + 2}`}
                          className="w-full h-full object-cover block rounded-[6px]"
                          style={{ margin: 0, padding: 0, display: "block" }}
                        />
                      </div>
                    </div>
                  )
                } else {
                  // Single image if no pair
                  return (
                    <div key={index} className="w-full">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${caseProject.projectTitle} - Image ${index + 1}`}
                        className="w-full h-full object-cover block rounded-[6px]"
                        style={{ margin: 0, padding: 0, display: "block" }}
                      />
                    </div>
                  )
                }
              } else {
                // Skip pair end images as they're handled in pair start
                return null
              }
            })}
          </div>
        )}
      </section>

      {/* Gallery Section - No title, continue alternating layout */}
      <section id="gallery" className="py-0">
        {/* Continue alternating layout for remaining images without gaps */}
        {caseProject.projectMedia && caseProject.projectMedia.length > 3 && (
          <div>
            {caseProject.projectMedia.slice(3).map((image, index) => {
              const actualIndex = index + 3 // Adjust for sliced array
              const isFullWidth = (actualIndex + 1) % 3 === 0
              const isPairStart = (actualIndex + 1) % 3 === 1

              if (isFullWidth) {
                // Full-width image
                return (
                  <div key={actualIndex} className="w-full">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${caseProject.projectTitle} - Gallery ${actualIndex + 1}`}
                      className="w-full h-full object-cover block"
                      style={{ margin: 0, padding: 0, display: "block" }}
                    />
                  </div>
                )
              } else if (isPairStart) {
                // Start of a pair - check if there's a next image
                const nextImage = caseProject.projectMedia[actualIndex + 1]
                if (nextImage) {
                  // Render pair without gap
                  return (
                    <div
                      key={`gallery-pair-${actualIndex}`}
                      className="grid grid-cols-1 md:grid-cols-2"
                      style={{ gap: 0 }}
                    >
                      <div className="w-full">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${caseProject.projectTitle} - Gallery ${actualIndex + 1}`}
                          className="w-full h-full object-cover block"
                          style={{ margin: 0, padding: 0, display: "block" }}
                        />
                      </div>
                      <div className="w-full" style={{ margin: 0, padding: 0 }}>
                        <img
                          src={nextImage || "/placeholder.svg"}
                          alt={`${caseProject.projectTitle} - Gallery ${actualIndex + 2}`}
                          className="w-full h-full object-cover block"
                          style={{ margin: 0, padding: 0, display: "block" }}
                        />
                      </div>
                    </div>
                  )
                } else {
                  // Single image if no pair
                  return (
                    <div key={actualIndex} className="w-full">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${caseProject.projectTitle} - Gallery ${actualIndex + 1}`}
                        className="w-full h-full object-cover block"
                        style={{ margin: 0, padding: 0, display: "block" }}
                      />
                    </div>
                  )
                }
              } else {
                // Skip pair end images as they're handled in pair start
                return null
              }
            })}
          </div>
        )}
      </section>

      {/* Drafts Section */}
      {hasDrafts && (
        <section id="drafts" className="py-0 relative">
          {/* Process & Drafts button - absolute positioned on top left */}
          <div className="absolute top-8 left-8 z-10">
            <Badge className="inline-flex items-center justify-center gap-1 py-1 px-4 rounded-full bg-black hover:bg-gray-800 cursor-pointer h-8">
              <span className="text-[11px] font-medium whitespace-nowrap text-[#E3E3E3]">PROCESS & DRAFTS</span>
            </Badge>
          </div>

          {/* Full-width images with no spacing */}
          <div className="w-full">
            <div className="flex overflow-x-auto">
              {caseProject.draftProcess.map((image, index) => (
                <div key={index} className="flex-shrink-0">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${caseProject.projectTitle} - Draft ${index + 1}`}
                    className="h-[400px] w-auto object-cover block rounded-[6px]"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact/Footer Section - Simplified */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-[20px] sm:px-[30px]">
          {/* Social Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <span className="font-medium text-[#202020] text-[12px]">SOCIAL:</span>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#202020] text-[12px] tracking-[0] leading-[normal] hover:underline cursor-pointer"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Logo - Center */}
          <div className="flex justify-center">
            <img src="/logo-case-footer.svg" alt="Logo Case Footer" className="w-[200px] h-[103px]" />
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  )
}