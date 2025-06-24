"use client"

import type { Metadata } from "next"
import Link from "next/link"
import { useState, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { getCaseProjects, type CaseProject } from "@/lib/notion-cases"

export default function WorkPage() {
  const [projects, setProjects] = useState<CaseProject[]>([])
  const [loading, setLoading] = useState(true)
  const [dataSource, setDataSource] = useState<"database" | "fallback">("fallback")

  // Fetch cases from API
  useEffect(() => {
    const fetchCases = async () => {
      try {
        console.log("🔄 Fetching cases for work page...")
        const response = await fetch("/api/cases", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        const result = await response.json()

        if (result.success && result.data.length > 0) {
          console.log("✅ Successfully loaded cases from database:", result.data.length)
          setProjects(result.data)
          setDataSource("database")
        } else {
          console.log("❌ Failed to load cases from database")
          setProjects([])
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

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Work</h1>
        <div className="flex justify-center items-center py-16">
          <p className="text-gray-500">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Work</h1>
      
      {/* Data Source Indicator */}
      {dataSource === "fallback" && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            ⚠️ No projects found. Check{" "}
            <a href="/cases-debug" className="underline">
              Cases Debug
            </a>{" "}
            to troubleshoot the database connection.
          </p>
        </div>
      )}

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link key={project.id} href={`/work/${project.slug}`}>
            <div className="group cursor-pointer">
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden mb-4 relative">
                <img
                  src={project.thumbnail || project.introImage || "/placeholder.svg"}
                  alt={project.projectTitle}
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                    project.comingSoon ? 'blur-sm' : ''
                  }`}
                />
                {project.comingSoon && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Badge className="bg-black text-white rounded-[10px] px-4 py-1 font-medium text-[10px]">
                      COMING SOON
                    </Badge>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-black text-sm">{project.projectTitle}</h3>
                <div className="flex flex-wrap gap-1">
                  {project.categoryTags.map((tag, tagIndex) => (
                    <Badge
                      key={tagIndex}
                      variant="outline"
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 border-gray-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {projects.length === 0 && !loading && (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No projects found</p>
          <p className="text-sm text-gray-400">
            Make sure your Notion database has published projects with the required fields.
          </p>
        </div>
      )}
    </div>
  )
}
