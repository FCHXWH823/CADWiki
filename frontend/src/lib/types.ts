export interface Module {
  id: string
  title: string
  slug: string
  description: string
  keyIdea: string
  paper?: string
  code?: string
  slides?: string
  video?: string
  hasLab: boolean
  labType: string | null
  difficulty: "beginner" | "intermediate" | "advanced"
  tags: string[]
  topic?: string
  subtopic?: string
}

export interface Subtopic {
  id: string
  title: string
  units: Module[]
}

export interface Topic {
  id: string
  title: string
  color: "blue" | "green" | "red"
  subtopics: Subtopic[]
}

export interface LLMModel {
  id: string
  label: string
  provider: string
  type: "reasoning" | "non-reasoning"
}

export interface ModulesData {
  topics: Topic[]
  projects: Project[]
  models: LLMModel[]
}

export interface Project {
  id: string
  title: string
  description: string
  objectives: string[]
  tutorial?: string
  difficulty: "beginner" | "intermediate" | "advanced"
}
