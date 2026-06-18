"use client"

import { useState } from "react"
import Link from "next/link"
import { generateTestbench } from "@/lib/api"
import { ModelSelector } from "@/components/lab/ModelSelector"
import { OutputPane } from "@/components/lab/OutputPane"
import { ArrowLeft, Play, Info } from "lucide-react"

const EXAMPLE_RTL = `module fsm_traffic_light (
  input  logic clk, rst,
  output logic red, yellow, green
);
  typedef enum logic [1:0] {RED, GREEN, YELLOW} state_t;
  state_t state, next_state;
  logic [3:0] counter;

  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin state <= RED; counter <= 0; end
    else if (counter == 4'd9) begin state <= next_state; counter <= 0; end
    else counter <= counter + 1;
  end

  always_comb begin
    case (state)
      RED:    begin next_state = GREEN;  red=1; yellow=0; green=0; end
      GREEN:  begin next_state = YELLOW; red=0; yellow=0; green=1; end
      YELLOW: begin next_state = RED;    red=0; yellow=1; green=0; end
      default: next_state = RED;
    endcase
  end
endmodule`

const EXAMPLE_DESC = "A 3-state traffic light FSM cycling through RED→GREEN→YELLOW→RED. Each state lasts 10 clock cycles. Synchronous active-high reset returns to RED."

export default function TestbenchLabPage() {
  const [rtlCode, setRtlCode] = useState(EXAMPLE_RTL)
  const [description, setDescription] = useState(EXAMPLE_DESC)
  const [model, setModel] = useState("gpt-4o-mini")
  const [output, setOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    setOutput("")
    let fullOutput = ""

    try {
      await generateTestbench(
        rtlCode,
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
      setOutput(`**Error:** ${msg}\n\nMake sure you are connected to NYU VPN.`)
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
          <h1 className="text-2xl font-bold text-gray-900">Testbench Generator Lab</h1>
          <p className="text-gray-600 text-sm mt-1">
            Generate comprehensive, self-checking Verilog testbenches from RTL and a natural language description.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ModelSelector value={model} onChange={setModel} disabled={isLoading} />
          <Link href="/modules/testbench-gen" className="text-xs text-gray-500 hover:text-blue-600">About →</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
              <span className="text-sm font-medium text-gray-700">Module Description</span>
            </div>
            <textarea
              className="w-full p-3 text-sm focus:outline-none resize-none min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what the module does in natural language..."
              disabled={isLoading}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
              <span className="text-sm font-medium text-gray-700">RTL Code (Verilog / SystemVerilog)</span>
            </div>
            <textarea
              className="w-full p-3 font-mono text-sm focus:outline-none resize-none min-h-[280px]"
              value={rtlCode}
              onChange={(e) => setRtlCode(e.target.value)}
              placeholder="Paste your Verilog module here..."
              disabled={isLoading}
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2 text-xs text-green-800">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            The LLM will generate a testbench with clock/reset, stimulus patterns covering corner cases,
            and self-checking assertions — based on the <strong>LLM-Aided Testbench Generation</strong> approach.
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !rtlCode.trim() || !description.trim()}
            className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" /> Generate Testbench
          </button>
        </div>

        {/* Right: Output */}
        <div className="rounded-xl border border-gray-200 overflow-hidden h-[600px] flex flex-col">
          <OutputPane
            output={output}
            isLoading={isLoading}
            placeholder="Generated testbench will appear here..."
          />
        </div>
      </div>
    </div>
  )
}
