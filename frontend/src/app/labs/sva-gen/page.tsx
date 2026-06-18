"use client"

import { useState } from "react"
import Link from "next/link"
import { generateSVA } from "@/lib/api"
import { ModelSelector } from "@/components/lab/ModelSelector"
import { OutputPane } from "@/components/lab/OutputPane"
import { ArrowLeft, Play, Info } from "lucide-react"

const EXAMPLE_PROPS = [
  "The ready signal must be high within 5 clock cycles after the valid signal goes high.",
  "Once granted, the bus_grant signal must remain high until the request signal is deasserted.",
  "The FIFO empty flag must never be asserted while the read enable is high.",
  "After a reset, the state machine must return to IDLE within 3 clock cycles.",
]

const EXAMPLE_RTL = `module arbiter (
  input  logic clk, rst,
  input  logic req,
  output logic grant,
  output logic ready
);`

export default function SVAGenLabPage() {
  const [property, setProperty] = useState(EXAMPLE_PROPS[0])
  const [rtlContext, setRtlContext] = useState(EXAMPLE_RTL)
  const [model, setModel] = useState("@gpt-4o-mini/gpt-4o-mini")
  const [output, setOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    setOutput("")
    let fullOutput = ""

    try {
      await generateSVA(
        property,
        rtlContext,
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
          <h1 className="text-2xl font-bold text-gray-900">SVA Generator Lab</h1>
          <p className="text-gray-600 text-sm mt-1">
            Convert natural language hardware properties into formal SystemVerilog assertions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ModelSelector value={model} onChange={setModel} disabled={isLoading} />
          <Link href="/modules/hybrid-nl2sva" className="text-xs text-gray-500 hover:text-blue-600">About →</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="flex flex-col gap-4">
          {/* Quick examples */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Examples</p>
            <div className="flex flex-col gap-1.5">
              {EXAMPLE_PROPS.map((p) => (
                <button
                  key={p}
                  onClick={() => setProperty(p)}
                  className={`text-left text-xs px-3 py-1.5 rounded border transition-colors ${
                    property === p
                      ? "bg-green-50 border-green-300 text-green-800"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
              <span className="text-sm font-medium text-gray-700">Natural Language Property</span>
            </div>
            <textarea
              className="w-full p-3 text-sm focus:outline-none resize-none min-h-[100px]"
              value={property}
              onChange={(e) => setProperty(e.target.value)}
              placeholder="Describe the hardware property in plain English..."
              disabled={isLoading}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
              <span className="text-sm font-medium text-gray-700">RTL Context (optional)</span>
            </div>
            <textarea
              className="w-full p-3 font-mono text-sm focus:outline-none resize-none min-h-[120px]"
              value={rtlContext}
              onChange={(e) => setRtlContext(e.target.value)}
              placeholder="Paste module declaration or signal definitions to give the LLM context..."
              disabled={isLoading}
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2 text-xs text-green-800">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            Based on <strong>Hybrid-NL2SVA</strong>: RAG + fine-tuning for NL → SVA translation.
            Providing RTL context improves assertion accuracy.
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !property.trim()}
            className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" /> Generate SVA
          </button>
        </div>

        {/* Right: Output */}
        <div className="rounded-xl border border-gray-200 overflow-hidden h-[580px] flex flex-col">
          <OutputPane
            output={output}
            isLoading={isLoading}
            placeholder="SystemVerilog assertion will appear here..."
          />
        </div>
      </div>
    </div>
  )
}
