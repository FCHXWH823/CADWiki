"use client"

import { LLMModel } from "@/lib/types"

const MODELS: LLMModel[] = [
  { id: "@gpt-4o-mini/gpt-4o-mini", label: "GPT-4o mini", provider: "OpenAI", type: "non-reasoning" },
  { id: "@gpt-4o/gpt-4o", label: "GPT-4o", provider: "OpenAI", type: "non-reasoning" },
  { id: "@o4-mini/o4-mini", label: "o4-mini", provider: "OpenAI", type: "reasoning" },
  { id: "@vertexai/anthropic.claude-sonnet-4-6", label: "Claude Sonnet 4.6", provider: "Anthropic", type: "reasoning" },
  { id: "@vertexai/anthropic.claude-haiku-4-5@20251001", label: "Claude Haiku 4.5", provider: "Anthropic", type: "non-reasoning" },
  { id: "@vertexai/gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "Google", type: "non-reasoning" },
  { id: "@vertexai/gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "Google", type: "reasoning" },
]

interface Props {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}

export function ModelSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-600 font-medium whitespace-nowrap">Model:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-white"
      >
        {MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label} ({m.provider}) {m.type === "reasoning" ? "🧠" : "⚡"}
          </option>
        ))}
      </select>
    </div>
  )
}
