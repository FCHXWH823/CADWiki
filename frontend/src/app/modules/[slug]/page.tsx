"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { fetchModule } from "@/lib/api"
import { Module } from "@/lib/types"
import { Badge } from "@/components/ui/Badge"
import { difficultyColor } from "@/lib/utils"
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Code2,
  Presentation,
  FlaskConical,
  Tag,
  Lightbulb,
} from "lucide-react"

const labLabels: Record<string, string> = {
  autochip: "AutoChip Lab",
  "sva-gen": "SVA Generator Lab",
  testbench: "Testbench Generator Lab",
  veritas: "Veritas Lab",
  "security-assertions": "Security Assertions Lab",
}

export default function ModuleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [module, setModule] = useState<Module | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchModule(slug)
      .then(setModule)
      .catch(() => setError("Module not found"))
  }, [slug])

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">{error}</p>
        <Link href="/modules" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to Modules
        </Link>
      </div>
    )
  }

  if (!module) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <Link
        href="/modules"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Modules
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
          <div>
            {module.topic && (
              <p className="text-sm text-gray-500 mb-1">
                {module.topic} › {module.subtopic}
              </p>
            )}
            <h1 className="text-3xl font-bold text-gray-900">{module.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={difficultyColor(module.difficulty) as "green" | "yellow" | "red"}>
              {module.difficulty}
            </Badge>
            {module.hasLab && (
              <Badge variant="blue">
                <FlaskConical className="w-3 h-3 mr-1" /> Interactive Lab
              </Badge>
            )}
          </div>
        </div>

        {/* Key idea */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5 flex gap-3">
          <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Key Idea</p>
            <p className="text-sm text-amber-900">{module.keyIdea}</p>
          </div>
        </div>

        <p className="text-gray-700 leading-relaxed mb-5">{module.description}</p>

        {/* Tags */}
        {module.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-gray-400" />
            {module.tags.map((tag) => (
              <Badge key={tag} variant="gray">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Resources */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Resources</h2>
        <div className="flex flex-col gap-3">
          {module.paper && (
            <a
              href={module.paper}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-700 group"
            >
              <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
              <span>Research Paper</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 ml-auto" />
            </a>
          )}
          {module.code && (
            <a
              href={module.code}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-700 group"
            >
              <Code2 className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
              <span>Source Code (GitHub)</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 ml-auto" />
            </a>
          )}
          {module.slides && (
            <a
              href={module.slides}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-700 group"
            >
              <Presentation className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
              <span>Slides</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 ml-auto" />
            </a>
          )}
          {!module.paper && !module.code && !module.slides && (
            <p className="text-sm text-gray-400">No resources linked yet.</p>
          )}
        </div>
      </div>

      {/* Lab CTA */}
      {module.hasLab && module.labType && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-blue-900 mb-1">Try the Interactive Lab</h2>
            <p className="text-sm text-blue-700">
              Run live LLM experiments for this module using the NYU AI Gateway.
            </p>
          </div>
          <Link
            href={`/labs/${module.labType}`}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <FlaskConical className="w-4 h-4" />
            {labLabels[module.labType] ?? "Open Lab"}
          </Link>
        </div>
      )}
    </div>
  )
}
