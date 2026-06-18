const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function fetchModules() {
  const res = await fetch(`${API_BASE}/api/modules`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch modules")
  return res.json()
}

export async function fetchModule(slug: string) {
  const res = await fetch(`${API_BASE}/api/modules/${slug}`, { cache: "no-store" })
  if (!res.ok) throw new Error(`Module ${slug} not found`)
  return res.json()
}

export type StreamCallback = (text: string) => void

async function streamRequest(
  endpoint: string,
  body: object,
  onChunk: StreamCallback,
  onDone: () => void
) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }))
    throw new Error(err.detail || "Request failed")
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value)
    for (const line of chunk.split("\n")) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6)
        if (data === "[DONE]") {
          onDone()
          return
        }
        let parsed: { text?: string; error?: string } | null = null
        try {
          parsed = JSON.parse(data)
        } catch {
          // ignore partial / non-JSON lines
        }
        if (parsed?.error) throw new Error(parsed.error)
        if (parsed?.text) onChunk(parsed.text)
      }
    }
  }
  onDone()
}

export async function generateAutochip(
  spec: string,
  model: string,
  previousCode: string,
  errorFeedback: string,
  onChunk: StreamCallback,
  onDone: () => void
) {
  return streamRequest(
    "/api/labs/autochip",
    { spec, model, previous_code: previousCode, error_feedback: errorFeedback },
    onChunk,
    onDone
  )
}

export async function generateSVA(
  naturalLanguage: string,
  rtlContext: string,
  model: string,
  onChunk: StreamCallback,
  onDone: () => void
) {
  return streamRequest(
    "/api/labs/sva-gen",
    { natural_language: naturalLanguage, rtl_context: rtlContext, model },
    onChunk,
    onDone
  )
}

export async function generateTestbench(
  rtlCode: string,
  description: string,
  model: string,
  onChunk: StreamCallback,
  onDone: () => void
) {
  return streamRequest(
    "/api/labs/testbench",
    { rtl_code: rtlCode, description, model },
    onChunk,
    onDone
  )
}

export async function generateVeritas(
  description: string,
  model: string,
  onChunk: StreamCallback,
  onDone: () => void
) {
  return streamRequest(
    "/api/labs/veritas",
    { description, model },
    onChunk,
    onDone
  )
}
