import Link from "next/link"
import { fetchModules } from "@/lib/api"
import { ModulesData } from "@/lib/types"
import { FlaskConical, FileText, Code2, ExternalLink } from "lucide-react"

async function getData(): Promise<ModulesData> {
  try {
    return await fetchModules()
  } catch {
    return { topics: [], projects: [], models: [] }
  }
}

const topicColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  "rtl-generation": {
    bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", dot: "bg-blue-500",
  },
  "rtl-verification": {
    bg: "bg-green-50", border: "border-green-200", text: "text-green-800", dot: "bg-green-500",
  },
  "hardware-security": {
    bg: "bg-red-50", border: "border-red-200", text: "text-red-800", dot: "bg-red-500",
  },
}

const diffBadge: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 border-green-200",
  intermediate: "bg-amber-100 text-amber-700 border-amber-200",
  advanced: "bg-red-100 text-red-700 border-red-200",
}

export default async function SyllabusPage() {
  const data = await getData()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Syllabus</h1>
        <p className="text-gray-600">
          Complete curriculum for LLM-aided chip design education, organized by topic and subtopic.
          Each unit includes learning resources and interactive labs where available.
        </p>
      </div>

      {/* Taxonomy table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-gray-700 w-1/4">Topic</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 w-1/4">Subtopic</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Unit</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 w-24">Level</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 w-32">Resources</th>
            </tr>
          </thead>
          <tbody>
            {data.topics.map((topic) => {
              const colors = topicColors[topic.id]
              const totalUnits = topic.subtopics.reduce((acc, st) => acc + st.units.length, 0)

              return topic.subtopics.map((subtopic, si) =>
                subtopic.units.map((unit, ui) => (
                  <tr key={unit.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {/* Topic cell — only render on first subtopic + first unit */}
                    {si === 0 && ui === 0 && (
                      <td
                        rowSpan={totalUnits}
                        className={`px-4 py-3 font-semibold align-top ${colors.text} border-r border-gray-200`}
                      >
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${colors.bg} border ${colors.border} text-xs font-semibold`}>
                          <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                          {topic.title}
                        </div>
                      </td>
                    )}
                    {/* Subtopic — only on first unit of subtopic */}
                    {ui === 0 && (
                      <td
                        rowSpan={subtopic.units.length}
                        className="px-4 py-3 text-gray-600 align-top border-r border-gray-100 text-xs font-medium"
                      >
                        {subtopic.title}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <Link
                        href={`/modules/${unit.slug}`}
                        className="font-medium text-gray-900 hover:text-blue-700 hover:underline flex items-center gap-1"
                      >
                        {unit.title}
                        {unit.hasLab && (
                          <FlaskConical className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${diffBadge[unit.difficulty]}`}>
                        {unit.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {unit.paper && (
                          <a href={unit.paper} target="_blank" rel="noreferrer" title="Paper">
                            <FileText className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                          </a>
                        )}
                        {unit.code && (
                          <a href={unit.code} target="_blank" rel="noreferrer" title="Code">
                            <Code2 className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                          </a>
                        )}
                        {unit.hasLab && unit.labType && (
                          <Link href={`/labs/${unit.labType}`} title="Interactive Lab">
                            <FlaskConical className="w-4 h-4 text-purple-400 hover:text-purple-600" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Projects Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Course Projects</h2>
        <div className="flex flex-col gap-4">
          {data.projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-semibold text-gray-900">{project.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded border font-medium flex-shrink-0 ${diffBadge[project.difficulty]}`}>
                  {project.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{project.description}</p>
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Objectives</p>
                <ul className="space-y-1">
                  {project.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-500 font-bold flex-shrink-0">·</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
              {project.tutorial && (
                <a
                  href={project.tutorial}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Project Tutorial
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
