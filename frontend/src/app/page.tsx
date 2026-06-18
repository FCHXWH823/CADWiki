import Link from "next/link"
import { ArrowRight, BookOpen, FlaskConical, Shield, Cpu } from "lucide-react"

const topics = [
  {
    title: "RTL Generation",
    desc: "Generate synthesizable Verilog from natural language using AutoChip, ROME, Veritas, and more.",
    icon: Cpu,
    color: "blue",
    href: "/modules?topic=rtl-generation",
    units: 9,
  },
  {
    title: "RTL Verification",
    desc: "Automate testbench creation and SystemVerilog assertion generation using LLM-powered tools.",
    icon: FlaskConical,
    color: "green",
    href: "/modules?topic=rtl-verification",
    units: 6,
  },
  {
    title: "Hardware Security",
    desc: "Study both hardware attacks (Trojans, IP piracy) and defenses (logic locking, unlearning).",
    icon: Shield,
    color: "red",
    href: "/modules?topic=hardware-security",
    units: 8,
  },
]

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  green: "bg-green-50 border-green-200 text-green-700",
  red: "bg-red-50 border-red-200 text-red-700",
}

const iconBgMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  red: "bg-red-100 text-red-600",
}

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-4 border border-blue-200">
          <BookOpen className="w-3.5 h-3.5" />
          NYU GUIDE · GenAI Units in Digital Design Education
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          <span className="text-blue-600">CAD</span>Wiki
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          An interactive learning platform for LLM-aided chip design. Run live AI demos,
          explore research modules, and experiment with the NYU AI Gateway — no personal API key needed.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/modules"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Modules <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/labs"
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Try Interactive Labs <FlaskConical className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Topics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {topics.map(({ title, desc, icon: Icon, color, href, units }) => (
          <Link
            key={title}
            href={href}
            className={`group block rounded-xl border p-6 transition-all hover:shadow-md ${colorMap[color]}`}
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4 ${iconBgMap[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            <p className="text-sm opacity-80 mb-3">{desc}</p>
            <span className="text-xs font-medium opacity-70">{units} units →</span>
          </Link>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {[
          { value: "20+", label: "Research Modules" },
          { value: "4", label: "Interactive Labs" },
          { value: "6+", label: "AI Models Available" },
          { value: "Free", label: "via NYU Gateway" },
        ].map(({ value, label }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">{value}</div>
            <div className="text-sm text-gray-600">{label}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How CADWiki Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            {
              step: "1",
              title: "Explore Modules",
              desc: "Read about each LLM4ChipDesign research unit: key ideas, papers, slides, and code.",
            },
            {
              step: "2",
              title: "Run Interactive Labs",
              desc: "Type a hardware spec or property and instantly see LLM-generated Verilog or assertions.",
            },
            {
              step: "3",
              title: "No API Key Needed",
              desc: "All LLM calls go through the NYU AI Gateway (Portkey). The key lives on the server — students need nothing.",
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {step}
              </div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
