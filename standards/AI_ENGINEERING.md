# DummVinci — AI Engineering Standards

> **Reference Repository**: [patchy631/ai-engineering-hub](https://github.com/patchy631/ai-engineering-hub)  
> This document defines the standards for AI/LLM integration within the DummVinci Calculator ecosystem.

---

## 1. Structured Data & Validation

### Standard: Zod Enforcement
All inputs from AI models or outputs to calculators must be validated using **Zod**. This prevents hallucinated parameters from breaking the pure TS calculation functions in `lib/calc/`.

```typescript
// Example: Implementation of 'Retriever' tool input
import { z } from "zod";

export const SearchQuerySchema = z.object({
  product_family: z.enum(["ACQ580", "ACS880", "3VA"]),
  query_context: z.string().describe("Technical parameter to lookup, e.g., 'frame R5 ploss'"),
});
```

---

## 2. Multi-Agent Orchestration

### Pattern: Retriever-Reasoner-Synthesizer
Avoid monolithic prompts. Split complex engineering tasks into specialized roles:

| Role | Responsibility | Implementation |
|---|---|---|
| **Retriever** | Locate technical data in `data/*.json` or external RAG docs. | Tool calling (Vercel AI SDK) |
| **Engineering Auditor** | Validate retrieved data against IEC/ABB standards. | Pure Logic / Formal Logic Prompt |
| **Synthesizer** | Format the final `ResultCard` and recommendation strings. | Creative/Copywriting Prompt |

---

## 3. High-Fidelity Prompt Engineering

### Policy: Decoupled Personas
Store agent configurations outside of component code.

- **Path**: `lib/prompts/agents.json`
- **Constraint**: Use **Negative Constraints** (e.g., *"NEVER summarize findings unless specifically requested"*) to ensure "multinational-consultant" grade output.

### Policy: OCR Guardrails
When using Vision models for motor nameplate extraction:
1.  **Strict Formatting**: Use `Format Enforcement` prompts.
2.  **Output Sanitization**: Always strip common markdown/LaTeX delimiters before parsing.

---

## 4. UI/UX for AI Agents

### Principle: Human-Reality Layer
AI results should never be "black boxes".

- **Thinking States**: Implement "Reasoning Trace" in the UI for complex sizing.
- **Feedback Loops**: Allow users to "Correct AI" which then updates the local context.

---

## 5. Catalog Automation

### Standard: Manufacturer Sync
Periodic syncing of `data/*.json` using headless crawling of:
- [ABB Document Library](https://library.abb.com/)
- [Siemens Industry Mall](https://mall.industry.siemens.com/)

---

> *"Engineered by dummJo · DummVinci Calculator · AI Engineered Standard"*
