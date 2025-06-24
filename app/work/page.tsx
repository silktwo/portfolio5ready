import type { Metadata } from "next"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { projects } from "@/data/projects"

export const metadata: Metadata = {
  title: "Work",
  description: "My projects",
}

export default function WorkPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Work</h1>
      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link key={project.id} href={`/work/${project.slug}`}>
            <div className="group cursor-pointer">
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden mb-4">
                <img
                  src={project.introImage || "/placeholder.svg"}
                  alt={project.projectTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
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
    </div>
  )
}
