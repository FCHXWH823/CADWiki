"use client"

import { useState } from "react"
import Link from "next/link"
import { generateVeritas } from "@/lib/api"
import { ModelSelector } from "@/components/lab/ModelSelector"
import { OutputPane } from "@/components/lab/OutputPane"
import { ArrowLeft, Play, Info } from "lucide-react"

const EXAMPLES = [
  {
    label: "2-to-1 MUX",
    desc: "A 2-to-1 multiplexer with inputs A and B, select line S, and output Y. When S=0, Y=A. When S=1, Y=B.",
  },
  {
    label: "Half Adder",
    desc: "A half adder with 1-bit inputs A and B. Output Sum = A XOR B. Output Carry = A AND B.",
  },
  {
    label: "3-input AND gate",
    desc: "A 3-input AND gate with inputs A, B, C. Output Y is high only when all three inputs are high.",
  },
]

export default function VeritasLabPage() {
  const [description, setDescription] = useState(EXAMPLES[0].desc)
  const [model, setModel] = useState("@gpt-4o/gpt-4o")
  const [output, setOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    setOutput("")
    let fullOutput = ""

    try {
      await generateVeritas(
        description,
        model,
        (chunk) => {
          fullOutput += chunk
          setOutput(fullOutput)
        },
        () => setIsLoading(false)
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      setOutput(`**Error:** ${msg}\n\nPlease try again in a moment.`)
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/labs" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Labs
      </Link>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Veritas Lab</h1>
          <p className="text-gray-600 text-sm mt-1">
            Natural Language → CNF Specification → Verilog. Correctness by construction.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ModelSelector value={model} onChange={setModel} disabled={isLoading} />
          <Link href="/modules/veritas" className="text-xs text-gray-500 hover:text-blue-600">About →</Link>
        </div>
      </div>

      {/* Two-step visualization */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {["Natural Language", "CNF Clauses", "Verilog"].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-lg px-3 py-1.5 text-sm text-purple-800 font-medium">
              <span className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">
                {i + 1}
              </span>
              {step}
            </div>
            {i < 2 && <span className="text-gray-400 font-bold">→</span>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Examples</p>
            <div className="flex flex-col gap-1.5">
              {EXAMPLES.map(({ label, desc }) => (
                <button
                  key={label}
                  onClick={() => setDescription(desc)}
                  className={`text-left text-xs px-3 py-2 rounded border transition-colors ${
                    description === desc
                      ? "bg-purple-50 border-purple-300 text-purple-800"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <strong>{label}</strong> — {desc.slice(0, 60)}…
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
              <span className="text-sm font-medium text-gray-700">Circuit Specification (Natural Language)</span>
            </div>
            <textarea
              className="w-full p-3 text-sm focus:outline-none resize-none min-h-[150px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your circuit's truth table or logic in plain English..."
              disabled={isLoading}
            />
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex gap-2 text-xs text-purple-900">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Veritas approach:</strong> The LLM first generates CNF (Conjunctive Normal Form) clauses
              as a formal specification, then converts them to Verilog deterministically — ensuring correctness
              by construction. A reasoning model (e.g. Gemini 2.5 Pro) works best.
            </span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !description.trim()}
            className="inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" /> Generate CNF → Verilog
          </button>
        </div>

        {/* Right: Output */}
        <div className="rounded-xl border border-gray-200 overflow-hidden h-[580px] flex flex-col">
          <OutputPane
            output={output}
            isLoading={isLoading}
            placeholder="CNF specification and Verilog will appear here in two labeled steps..."
          />
        </div>
      </div>
    </div>
  )
}
