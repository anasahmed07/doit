---
id: "0003"
title: plan-conversational-mcp-chatbot
stage: plan
date: 2026-02-08
surface: claude-code
model: claude-opus-4-6
feature: 003-conversational-mcp-chatbot
branch: 003-conversational-mcp-chatbot
user: anas.shaikh
command: /sp.plan
labels: [plan, mcp, fastmcp, openai-agents, gemini, chat-ui, streaming]
links:
  spec: specs/003-conversational-mcp-chatbot/spec.md
  ticket: ""
  adr: ""
  pr: ""
files:
  - specs/003-conversational-mcp-chatbot/plan.md
  - specs/003-conversational-mcp-chatbot/research.md
  - specs/003-conversational-mcp-chatbot/data-model.md
  - specs/003-conversational-mcp-chatbot/quickstart.md
  - specs/003-conversational-mcp-chatbot/contracts/mcp-tools.md
  - specs/003-conversational-mcp-chatbot/contracts/chat-api.md
tests:
  - ""
---

## Prompt

/sp.plan we'll create a new mcp folder in the root and well use the fastmcp to build the mcp using the official mcp sdk , open ai agents sdk with google model provider for the llm and modify the frontend to include the chat widgit plus the chat page and the chat page should support markdown thats responded by the llm and must have interactive navigation preview and it should support streaming

## Response snapshot

Generated complete implementation plan with 6 artifacts. Phase 0 research resolved all technology decisions: FastMCP for MCP server (Streamable HTTP), OpenAI Agents SDK with LiteLLM for Gemini 3.5 integration, standalone MCP service with direct DB access deployed on Hugging Face. Phase 1 design produced data model (Conversation + Message tables), 15 MCP tool contracts across 5 domains (tasks, notes, projects, categories, dashboard), Chat API contract (SSE streaming + conversation CRUD), and quickstart guide. Architecture: Frontend (Next.js) → API proxy → MCP Service (FastAPI + Agent + FastMCP tools) → PostgreSQL. Constitution check passes all 6 gates. 3rd project (mcp/) justified for independent Hugging Face deployment.

## Outcome

- ✅ Impact: Complete implementation plan with all Phase 0 and Phase 1 artifacts generated
- 🧪 Tests: N/A (planning phase)
- 📁 Files: 6 files created (plan.md, research.md, data-model.md, quickstart.md, contracts/mcp-tools.md, contracts/chat-api.md)
- 🔁 Next prompts: /sp.tasks
- 🧠 Reflection: Deep codebase exploration was critical — understanding existing SQLModel patterns, security module, API proxy pattern, and dashboard layout directly informed the plan. Research on FastMCP middleware and OpenAI Agents SDK LiteLLM integration confirmed viability of the chosen stack.

## Evaluation notes (flywheel)

- Failure modes observed: Subagent rate limits forced direct research; recovered by reading files and doing web searches directly
- Graders run and results (PASS/FAIL): Constitution check PASS (all 6 principles)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
