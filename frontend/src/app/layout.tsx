import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/Navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CADWiki — LLM-Aided Chip Design Education",
  description:
    "Interactive educational platform for LLM-aided RTL generation, verification, and hardware security.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-200 bg-white py-8 text-center text-sm text-gray-500">
          <p>
            CADWiki · Built on{" "}
            <a
              href="https://github.com/FCHXWH823/LLM4ChipDesign"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              GUIDE (LLM4ChipDesign)
            </a>{" "}
            · NYU AI Gateway powered by Portkey
          </p>
        </footer>
      </body>
    </html>
  )
}
