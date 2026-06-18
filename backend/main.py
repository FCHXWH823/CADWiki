import json
import os
from pathlib import Path
from typing import AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from portkey_ai import Portkey
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="CADWiki API", version="1.0.0")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public Portkey API (default) or NYU gateway when on NYU VPN
PORTKEY_BASE_URL = os.getenv("PORTKEY_BASE_URL", "https://api.portkey.ai/v1")
PORTKEY_API_KEY = os.getenv("PORTKEY_API_KEY", "")

DATA_DIR = Path(__file__).parent.parent / "data"


def get_portkey_client() -> Portkey:
    if not PORTKEY_API_KEY:
        raise HTTPException(status_code=503, detail="PORTKEY_API_KEY not configured")
    return Portkey(base_url=PORTKEY_BASE_URL, api_key=PORTKEY_API_KEY)


# ── Data endpoints ────────────────────────────────────────────────────────────

@app.get("/api/modules")
def get_modules():
    with open(DATA_DIR / "modules.json") as f:
        return json.load(f)


@app.get("/api/modules/{slug}")
def get_module(slug: str):
    with open(DATA_DIR / "modules.json") as f:
        data = json.load(f)
    for topic in data["topics"]:
        for subtopic in topic["subtopics"]:
            for unit in subtopic["units"]:
                if unit["slug"] == slug:
                    unit["topic"] = topic["title"]
                    unit["subtopic"] = subtopic["title"]
                    return unit
    raise HTTPException(status_code=404, detail="Module not found")


# ── LLM endpoints ─────────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    prompt: str
    model: str = "gpt-4o-mini"
    system: str = "You are an expert hardware design assistant specializing in Verilog and SystemVerilog."
    max_tokens: int = 2048


class AutoChipRequest(BaseModel):
    spec: str
    model: str = "gpt-4o-mini"
    previous_code: str = ""
    error_feedback: str = ""


class SVARequest(BaseModel):
    natural_language: str
    rtl_context: str = ""
    model: str = "gpt-4o-mini"


class TestbenchRequest(BaseModel):
    rtl_code: str
    description: str
    model: str = "gpt-4o-mini"


class VeritasRequest(BaseModel):
    description: str
    model: str = "gpt-4o-mini"


# Generic streaming generate
@app.post("/api/generate")
async def generate(req: GenerateRequest):
    client = get_portkey_client()

    async def stream() -> AsyncGenerator[str, None]:
        response = client.chat.completions.create(
            model=req.model,
            messages=[
                {"role": "system", "content": req.system},
                {"role": "user", "content": req.prompt},
            ],
            max_tokens=req.max_tokens,
            stream=True,
        )
        for chunk in response:
            delta = chunk.choices[0].delta
            if delta and delta.content:
                yield f"data: {json.dumps({'text': delta.content})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream")


# ── AutoChip Lab ──────────────────────────────────────────────────────────────

AUTOCHIP_SYSTEM = """You are an expert Verilog hardware designer.
Generate clean, synthesizable Verilog code.
Always wrap your Verilog in a ```verilog ... ``` code block.
After the code, briefly explain your design decisions."""

AUTOCHIP_REPAIR_SYSTEM = """You are an expert Verilog debugger.
You will be given Verilog code that has compilation or simulation errors.
Fix the errors and return corrected Verilog in a ```verilog ... ``` code block.
Explain what you fixed after the code block."""


@app.post("/api/labs/autochip")
async def autochip_generate(req: AutoChipRequest):
    client = get_portkey_client()

    if req.previous_code and req.error_feedback:
        system = AUTOCHIP_REPAIR_SYSTEM
        prompt = f"""Original specification:
{req.spec}

Previous Verilog attempt:
```verilog
{req.previous_code}
```

Errors from EDA tool:
{req.error_feedback}

Please fix the Verilog code to resolve these errors."""
    else:
        system = AUTOCHIP_SYSTEM
        prompt = f"Generate Verilog for the following specification:\n\n{req.spec}"

    async def stream() -> AsyncGenerator[str, None]:
        response = client.chat.completions.create(
            model=req.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            max_tokens=2048,
            stream=True,
        )
        for chunk in response:
            delta = chunk.choices[0].delta
            if delta and delta.content:
                yield f"data: {json.dumps({'text': delta.content})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream")


# ── SVA Generator Lab ─────────────────────────────────────────────────────────

SVA_SYSTEM = """You are an expert in formal hardware verification and SystemVerilog assertions (SVA).
Convert natural language property descriptions into correct, synthesizable SystemVerilog assertions.
Always output assertions in a ```systemverilog ... ``` code block.
Include:
- The SVA property with proper temporal operators
- A concurrent assertion binding (assert property)
- A brief explanation of the assertion semantics"""


@app.post("/api/labs/sva-gen")
async def sva_generate(req: SVARequest):
    client = get_portkey_client()

    ctx = f"\n\nRTL Context:\n```verilog\n{req.rtl_context}\n```" if req.rtl_context else ""
    prompt = f"""Convert the following natural language property to a SystemVerilog assertion:{ctx}

Property: {req.natural_language}"""

    async def stream() -> AsyncGenerator[str, None]:
        response = client.chat.completions.create(
            model=req.model,
            messages=[
                {"role": "system", "content": SVA_SYSTEM},
                {"role": "user", "content": prompt},
            ],
            max_tokens=1024,
            stream=True,
        )
        for chunk in response:
            delta = chunk.choices[0].delta
            if delta and delta.content:
                yield f"data: {json.dumps({'text': delta.content})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream")


# ── Testbench Generator Lab ───────────────────────────────────────────────────

TESTBENCH_SYSTEM = """You are an expert in Verilog verification and testbench development.
Generate comprehensive, self-checking Verilog testbenches.
Include:
- Clock and reset generation
- Stimulus patterns covering corner cases
- A golden Python model (as comments) for expected output computation
- Self-checking assertions that compare DUT output to expected
Always wrap testbench in a ```verilog ... ``` block."""


@app.post("/api/labs/testbench")
async def testbench_generate(req: TestbenchRequest):
    client = get_portkey_client()

    prompt = f"""Generate a comprehensive testbench for the following Verilog module.

Module Description: {req.description}

RTL Code:
```verilog
{req.rtl_code}
```"""

    async def stream() -> AsyncGenerator[str, None]:
        response = client.chat.completions.create(
            model=req.model,
            messages=[
                {"role": "system", "content": TESTBENCH_SYSTEM},
                {"role": "user", "content": prompt},
            ],
            max_tokens=2048,
            stream=True,
        )
        for chunk in response:
            delta = chunk.choices[0].delta
            if delta and delta.content:
                yield f"data: {json.dumps({'text': delta.content})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream")


# ── Veritas Lab (NL → CNF → Verilog) ─────────────────────────────────────────

VERITAS_SYSTEM = """You are an expert in formal hardware verification and Verilog synthesis.
Follow a two-step process:
1. First, express the circuit specification as Conjunctive Normal Form (CNF) clauses.
   Format: list each clause as (literal1 ∨ literal2 ∨ ...) on its own line.
2. Then, deterministically convert those CNF clauses to Verilog.
   Wrap the final Verilog in ```verilog ... ```.
Show both steps clearly labeled: "## Step 1: CNF Specification" and "## Step 2: Verilog"."""


@app.post("/api/labs/veritas")
async def veritas_generate(req: VeritasRequest):
    client = get_portkey_client()

    prompt = f"Generate CNF specification then Verilog for:\n\n{req.description}"

    async def stream() -> AsyncGenerator[str, None]:
        response = client.chat.completions.create(
            model=req.model,
            messages=[
                {"role": "system", "content": VERITAS_SYSTEM},
                {"role": "user", "content": prompt},
            ],
            max_tokens=2048,
            stream=True,
        )
        for chunk in response:
            delta = chunk.choices[0].delta
            if delta and delta.content:
                yield f"data: {json.dumps({'text': delta.content})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream")


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "portkey_configured": bool(PORTKEY_API_KEY),
        "gateway": PORTKEY_BASE_URL,
    }
