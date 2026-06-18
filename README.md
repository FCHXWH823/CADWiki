# CADWiki

Interactive educational platform for **LLM-Aided Chip Design**, built on the [GUIDE (LLM4ChipDesign)](https://github.com/FCHXWH823/LLM4ChipDesign) curriculum from NYU.

## Features

- **20+ Research Modules** — Browse all GUIDE units with descriptions, key ideas, papers, slides, and code links
- **4 Interactive Labs** — Run live LLM experiments in-browser (no personal API key needed)
- **NYU AI Gateway** — All LLM calls route through Portkey at `https://ai-gateway.apps.cloud.rt.nyu.edu/v1`
- **Course Syllabus** — Full taxonomy view for instructors

## Architecture

```
CADWiki/
├── frontend/       # Next.js 16 + TypeScript + Tailwind CSS
├── backend/        # Python FastAPI + portkey_ai
├── data/
│   └── modules.json   # Registry of all 20+ research units
└── docker-compose.yml
```

## Quick Start

### Prerequisites
- Node.js 20+ (frontend)
- Python 3.12+ (backend)
- **NYU VPN** connected (required for AI Gateway)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your PORTKEY_API_KEY
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
# Open http://localhost:3000
```

### 3. Docker (both services)

```bash
export PORTKEY_API_KEY=your-key-here
docker-compose up
```

## Interactive Labs

| Lab | Description | API Endpoint |
|-----|-------------|-------------|
| **AutoChip** | RTL generation with iterative error feedback | `POST /api/labs/autochip` |
| **SVA Generator** | NL → SystemVerilog assertions | `POST /api/labs/sva-gen` |
| **Testbench Generator** | Automated self-checking testbench creation | `POST /api/labs/testbench` |
| **Veritas** | NL → CNF → Verilog (correctness by construction) | `POST /api/labs/veritas` |

## NYU Gateway Configuration

Per the Portkey AI Tutorial (NYU):
1. Connect to NYU VPN
2. Set `PORTKEY_API_KEY` in `backend/.env`
3. Gateway URL: `https://ai-gateway.apps.cloud.rt.nyu.edu/v1`

Supported models: Gemini 2.5 Pro/Flash, GPT-4o, o4-mini, Claude Sonnet 4.6, Claude Opus 4.6.

## Adding a New Module

Edit `data/modules.json` — add an entry to the appropriate subtopic:

```json
{
  "id": "my-module",
  "title": "My Module",
  "slug": "my-module",
  "description": "...",
  "keyIdea": "...",
  "paper": "https://arxiv.org/...",
  "code": "https://github.com/...",
  "hasLab": false,
  "labType": null,
  "difficulty": "intermediate",
  "tags": ["verilog", "generation"]
}
```

## Backend API

| Endpoint | Description |
|----------|-------------|
| `GET /api/modules` | All modules data |
| `GET /api/modules/{slug}` | Single module detail |
| `POST /api/generate` | Generic streaming LLM endpoint |
| `POST /api/labs/autochip` | AutoChip lab (stream) |
| `POST /api/labs/sva-gen` | SVA generator (stream) |
| `POST /api/labs/testbench` | Testbench generator (stream) |
| `POST /api/labs/veritas` | Veritas CNF→Verilog (stream) |
| `GET /api/health` | Health check |
