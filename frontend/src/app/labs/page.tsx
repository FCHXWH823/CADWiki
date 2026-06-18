import Link from "next/link"
import { FlaskConical, Zap, Shield, CheckSquare, GitBranch } from "lucide-react"

const labs = [
  {
    id: "autochip",
    title: "AutoChip Lab",
    subtitle: "RTL Generation from Natural Language",
    desc: "Describe a hardware circuit in plain English. The LLM generates Verilog, and you can simulate an iterative error-feedback loop by providing compiler errors for refinement.",
    icon: Zap,
    color: "blue",
    module: "autochip",
    badge: "Beginner",
  },
  {
    id: "sva-gen",
    title: "SVA Generator Lab",
    subtitle: "Natural Language → SystemVerilog Assertions",
    desc: "Type a property about your hardware design in plain English. The LLM converts it to a formal SystemVerilog assertion with correct temporal operators.",
    icon: CheckSquare,
    color: "green",
    module: "hybrid-nl2sva",
    badge: "Intermediate",
  },
  {
    id: "testbench",
    title: "Testbench Generator Lab",
    subtitle: "Automated Testbench Creation",
    desc: "Paste your RTL module and a natural-language description. The LLM generates a comprehensive, self-checking testbench with corner-case stimulus patterns.",
    icon: FlaskConical,
    color: "green",
    module: "testbench-gen",
    badge: "Beginner",
  },
  {
    id: "veritas",
    title: "Veritas Lab",
    subtitle: "NL → CNF → Verilog",
    desc: "Enter a circuit specification. The LLM generates CNF clauses as a formal specification, then deterministically converts them to synthesizable Verilog.",
    icon: GitBranch,
    color: "purple",
    module: "veritas",
    badge: "Advanced",
  },
]

const colorMap: Record<string, string> = {
  blue: "border-blue-200 bg-blue-50",
  green: "border-green-200 bg-green-50",
  purple: "border-purple-200 bg-purple-50",
}
const iconBgMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
}
const badgeMap: Record<string, string> = {
  Beginner: "bg-green-100 text-green-700 border-green-200",
  Intermediate: "bg-amber-100 text-amber-700 border-amber-200",
  Advanced: "bg-red-100 text-red-700 border-red-200",
}

export default function LabsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interactive Labs</h1>
        <p className="text-gray-600">
          Run live LLM experiments directly in your browser — no API key required.
          All calls route through the NYU AI Gateway, powered by Portkey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {labs.map(({ id, title, subtitle, desc, icon: Icon, color, module, badge }) => (
          <div
            key={id}
            className={`rounded-xl border p-6 ${colorMap[color]}`}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgMap[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="font-semibold text-gray-900">{title}</h2>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded border ${badgeMap[badge]}`}>
                    {badge}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{subtitle}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-5">{desc}</p>
            <div className="flex items-center gap-3">
              <Link
                href={`/labs/${id}`}
                className="inline-flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <FlaskConical className="w-4 h-4" /> Open Lab
              </Link>
              <Link
                href={`/modules/${module}`}
                className="text-sm text-gray-500 hover:text-blue-600 hover:underline"
              >
                View Module →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
