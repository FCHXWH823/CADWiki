"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BookOpen, FlaskConical, GraduationCap, Home } from "lucide-react"

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/modules", label: "Modules", icon: BookOpen },
  { href: "/labs", label: "Labs", icon: FlaskConical },
  { href: "/syllabus", label: "Syllabus", icon: GraduationCap },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900">
          <span className="text-blue-600">CAD</span>Wiki
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                pathname === href || (href !== "/" && pathname.startsWith(href))
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
