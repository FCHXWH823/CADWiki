"use client"

import { useState } from "react"
import Link from "next/link"
import { generateAutochip } from "@/lib/api"
import { ModelSelector } from "@/components/lab/ModelSelector"
import { OutputPane } from "@/components/lab/OutputPane"
import { ArrowLeft, Play, RefreshCw, RotateCcw, Info } from "lucide-react"

const EXAMPLE_SPEC = `Design a 4-bit synchronous up-counter with:
- Clock input: clk
- Active-high synchronous reset: rst
- Enable input: en
- 4-bit output: count[3:0]
- Overflow output: ovf (high when count wraps from 15 to 0)`

export default function AutochipLabPage() {
  const [spec, setSpec] = useState(EXAMPLE_SPEC)
  const [model, setModel] = useState("@gpt-4o-mini/gpt-4o-mini")
  const [output, setOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [iteration, setIteration] = useState(0)
  const [previousCode, setPreviousCode] = useState("")
  const [errorFeedback, setErrorFeedback] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)

  const extractCode = (text: string) => {
    const match = text.match(/```(?:verilog)?\n([\s\S]*?)```/)
    return match ? match[1].trim() : text
  }

  const handleGenerate = async () => {
    setIsLoading(true)
    setOutput("")
    let fullOutput = ""

    try {
      await generateAutochip(
        spec,
        model,
        previousCode,
        errorFeedback,
        (chunk) => {
          fullOutput += chunk
          setOutput(fullOutput)
        },
        () => {
          setPreviousCode(extractCode(fullOutput))
          setIteration((i) => i + 1)
          setShowFeedback(true)
          setErrorFeedback("")
          setIsLoading(false)
        }
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      setOutput(`**Error:** ${msg}\n\nPlease try again — if it persists, the backend may be misconfigured.`)
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setOutput("")
    setIteration(0)
    setPreviousCode("")
    setErrorFeedback("")
    setShowFeedback(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <Link href="/labs" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Labs
      </Link>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AutoChip Lab</h1>
          <p className="text-gray-600 text-sm mt-1">
            Generate Verilog from a natural language spec. Provide EDA errors to iterate toward a correct design.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ModelSelector value={model} onChange={setModel} disabled={isLoading} />
          <Link href="/modules/autochip" className="text-xs text-gray-500 hover:text-blue-600">
            About →
          </Link>
        </div>
      </div>

      {/* Iteration badge */}
      {iteration > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-200">
            <RefreshCw className="w-3 h-3" /> Iteration {iteration}
          </div>
          <button onClick={handleReset} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {iteration === 0 ? "Hardware Specification" : "Original Specification"}
              </span>
            </div>
            <textarea
              className="w-full p-3 font-mono text-sm focus:outline-none resize-none min-h-[180px]"
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              placeholder="Describe your hardware module in natural language..."
              disabled={isLoading}
            />
          </div>

          {/* Error feedback (shown after first iteration) */}
          {showFeedback && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-200 bg-red-50 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-700">EDA Error Feedback (optional)</span>
              </div>
              <textarea
                className="w-full p-3 font-mono text-sm focus:outline-none resize-none min-h-[120px] text-red-800 bg-red-50/30"
                value={errorFeedback}
                onChange={(e) => setErrorFeedback(e.target.value)}
                placeholder="Paste compilation or simulation errors here to trigger an LLM repair iteration..."
                disabled={isLoading}
              />
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2 text-xs text-blue-800">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              <strong>AutoChip workflow:</strong> Generate → paste EDA errors → generate again.
              Each iteration provides the previous code + errors to the LLM for repair.
            </span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !spec.trim()}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            {iteration === 0 ? "Generate Verilog" : errorFeedback ? "Repair with Feedback" : "Regenerate"}
          </button>
        </div>

        {/* Right: Output */}
        <div className="rounded-xl border border-gray-200 overflow-hidden h-[600px] flex flex-col">
          <OutputPane
            output={output}
            isLoading={isLoading}
            placeholder="Generated Verilog will appear here. Code blocks will be syntax-highlighted."
          />
        </div>
      </div>
    </div>
  )
}
