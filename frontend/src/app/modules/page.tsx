"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { fetchModules } from "@/lib/api"
import { ModulesData, Topic } from "@/lib/types"
import { Badge } from "@/components/ui/Badge"
import { difficultyColor } from "@/lib/utils"
import { FlaskConical, FileText, Code } from "lucide-react"

const topicColors: Record<string, "blue" | "green" | "red"> = {
  "rtl-generation": "blue",
  "rtl-verification": "green",
  "hardware-security": "red",
}

function ModulesContent() {
  const searchParams = useSearchParams()
  const topicFilter = searchParams.get("topic")

  const [data, setData] = useState<ModulesData | null>(null)
  const [search, setSearch] = useState("")
  const [activeTopic, setActiveTopic] = useState<string | null>(topicFilter)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchModules()
      .then(setData)
      .catch((e) => setError(e.message ?? "Failed to load modules"))
  }, [])

  const topics: Topic[] = data?.topics ?? []

  const filteredTopics = topics
    .filter((t) => !activeTopic || t.id === activeTopic)
    .map((t) => ({
      ...t,
      subtopics: t.subtopics.map((st) => ({
        ...st,
        units: st.units.filter((u) => {
          if (!search) return true
          const q = search.toLowerCase()
          return (
            u.title.toLowerCase().includes(q) ||
            u.description.toLowerCase().includes(q) ||
            u.tags.some((tag) => tag.includes(q))
          )
        }),
      })).filter((st) => st.units.length > 0),
    }))
    .filter((t) => t.subtopics.length > 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Modules</h1>
        <p className="text-gray-600">
          Browse all 20+ GUIDE units across RTL generation, verification, and hardware security.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input
          type="text"
          placeholder="Search modules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          {[
            { id: null, label: "All Topics" },
            { id: "rtl-generation", label: "RTL Generation" },
            { id: "rtl-verification", label: "RTL Verification" },
            { id: "hardware-security", label: "Hardware Security" },
          ].map(({ id, label }) => (
            <button
              key={id ?? "all"}
              onClick={() => setActiveTopic(id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                activeTopic === id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-center py-20">
          <p className="text-red-600 font-medium mb-2">Failed to load modules</p>
          <p className="text-sm text-gray-500 font-mono">{error}</p>
          <p className="text-sm text-gray-400 mt-3">Check that the backend is running and CORS is configured correctly.</p>
        </div>
      )}
      {!data && !error && (
        <div className="text-center py-20 text-gray-400">Loading modules...</div>
      )}

      {filteredTopics.map((topic) => (
        <div key={topic.id} className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                topicColors[topic.id] === "blue"
                  ? "bg-blue-500"
                  : topicColors[topic.id] === "green"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />
            {topic.title}
          </h2>

          {topic.subtopics.map((subtopic) => (
            <div key={subtopic.id} className="mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3 ml-5">
                {subtopic.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subtopic.units.map((unit) => (
                  <Link
                    key={unit.id}
                    href={`/modules/${unit.slug}`}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {unit.title}
                      </h4>
                      {unit.hasLab && (
                        <span className="ml-2 flex-shrink-0 inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium px-2 py-0.5 rounded border border-purple-200">
                          <FlaskConical className="w-3 h-3" /> Lab
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{unit.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant={difficultyColor(unit.difficulty) as "green" | "yellow" | "red"}>
                        {unit.difficulty}
                      </Badge>
                      <div className="flex gap-2">
                        {unit.paper && <FileText className="w-4 h-4 text-gray-400" />}
                        {unit.code && <Code className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function ModulesPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">Loading modules...</div>}>
      <ModulesContent />
    </Suspense>
  )
}
