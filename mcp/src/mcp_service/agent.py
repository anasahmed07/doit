import json
import logging
import uuid
from typing import AsyncGenerator, Optional

from openai import AsyncOpenAI
from agents import Agent, Runner, ModelSettings, set_default_openai_client, set_default_openai_api
from agents.mcp.server import MCPServerStreamableHttp

from mcp_service.config import settings

logger = logging.getLogger(__name__)

# Custom Gemini provider via OpenAI-compatible endpoint
gemini_client = AsyncOpenAI(
    api_key=settings.GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)
set_default_openai_client(gemini_client, use_for_tracing=False)
set_default_openai_api("chat_completions")

# Gemini-compatible model settings
# All values left as None so the SDK omits unsupported fields (like "store")
# rather than sending them explicitly, which Gemini's compat layer rejects.
GEMINI_MODEL_SETTINGS = ModelSettings()

SYSTEM_PROMPT = """\
You are DoIt Assistant, a friendly and efficient productivity assistant. \
You help users manage their tasks, notes, projects, categories, and view dashboard summaries through natural conversation.

Available tools:
- **Tasks**: list_tasks, create_task, update_task, delete_task — manage tasks in projects
- **Notes**: list_notes, create_note, update_note, delete_note — manage notes with optional categories
- **Projects**: list_projects, create_project, update_project — organize work into projects
- **Categories**: list_categories, create_category, delete_category — organize notes by category
- **Dashboard**: get_dashboard_summary — overview of all projects, tasks, notes, and categories

Key behaviors:
- When the user asks to create a task without specifying a project, use the default project.
- When the user asks to "show" or "list" items, use the appropriate list tool.
- When updating or deleting, identify the item by its content/title. If ambiguous, ask for clarification.
- Format your responses clearly. Use markdown for lists and emphasis.
- Be concise but helpful. Confirm actions after completing them.
- If an item is not found, suggest listing available items.
- Parse natural language dates (e.g., "tomorrow", "next Monday") for due dates — convert to ISO format (YYYY-MM-DD).
- Parse priority levels from natural language (e.g., "high priority", "urgent" → HIGH, "low" → LOW).
- For colors, accept natural language (e.g., "green" → "#4CAF50", "blue" → "#2196F3", "red" → "#F44336").
- When creating notes, always ask or infer a title if none is provided.
- For dashboard requests like "how am I doing?" or "summary", use get_dashboard_summary.
"""


def create_mcp_server(user_id: uuid.UUID, base_url: str) -> MCPServerStreamableHttp:
    """Create an MCP server connection with user auth headers."""
    return MCPServerStreamableHttp(
        params={
            "url": f"{base_url}/mcp",
            "headers": {"X-User-ID": str(user_id)},
            "timeout": 10.0,
            "sse_read_timeout": 300.0,
        },
        cache_tools_list=True,
        name="doit-mcp",
    )


def create_agent(mcp_server: MCPServerStreamableHttp) -> Agent:
    """Create the DoIt assistant agent with MCP tools."""
    return Agent(
        name="DoIt Assistant",
        model="gemini-3-pro-preview",
        instructions=SYSTEM_PROMPT,
        mcp_servers=[mcp_server],
        model_settings=GEMINI_MODEL_SETTINGS,
    )


async def run_agent_stream(
    message: str,
    conversation_history: list[dict],
    user_id: uuid.UUID,
    base_url: str,
) -> AsyncGenerator[dict, None]:
    """Run the agent with streaming and yield SSE-formatted events.

    Yields dicts with keys: type, content/tool/args/result/conversation_id/message_id
    """
    # Build input: conversation history + new message
    # Filter out empty messages and ensure content is non-empty strings
    input_messages = []
    for msg in conversation_history:
        content = (msg.get("content") or "").strip()
        if content:
            input_messages.append({
                "role": msg["role"],
                "content": content,
            })
    input_messages.append({"role": "user", "content": message})

    # Try with full history first, retry with truncated history on API errors
    max_attempts = 2
    for attempt in range(max_attempts):
        mcp_server = create_mcp_server(user_id, base_url)
        try:
            async with mcp_server:
                agent = create_agent(mcp_server)

                result = Runner.run_streamed(
                    starting_agent=agent,
                    input=input_messages,
                    max_turns=10,
                )

                full_response = ""

                async for event in result.stream_events():
                    if event.type == "raw_response_event":
                        data = event.data
                        # Responses API format: check type to distinguish text from function call args
                        event_type = getattr(data, "type", "")
                        if event_type == "response.output_text.delta" and hasattr(data, "delta") and data.delta:
                            full_response += data.delta
                            yield {"type": "text_delta", "content": data.delta}
                        # Chat Completions format fallback: choices[].delta.content
                        elif hasattr(data, "choices"):
                            for choice in data.choices:
                                delta = getattr(choice, "delta", None)
                                if delta and getattr(delta, "content", None):
                                    text = delta.content
                                    full_response += text
                                    yield {"type": "text_delta", "content": text}
                    elif event.type == "run_item_stream_event":
                        if event.name == "tool_called":
                            item = event.item
                            if hasattr(item, "raw_item") and hasattr(item.raw_item, "name"):
                                yield {
                                    "type": "tool_call",
                                    "tool": item.raw_item.name,
                                    "args": item.raw_item.arguments if hasattr(item.raw_item, "arguments") else "",
                                }
                        elif event.name == "tool_output":
                            item = event.item
                            output = item.output if hasattr(item, "output") else str(item)
                            yield {"type": "tool_result", "tool": "", "result": output}

                yield {
                    "type": "done",
                    "full_response": full_response,
                }
                return  # Success, exit retry loop

        except Exception as e:
            error_str = str(e)
            is_api_error = "400" in error_str or "INVALID_ARGUMENT" in error_str

            if is_api_error and attempt < max_attempts - 1:
                # Retry with only the last user message (drop history that may confuse the API)
                logger.warning("Gemini API error, retrying without history: %s", error_str)
                input_messages = [{"role": "user", "content": message}]
                continue

            yield {"type": "error", "content": f"Agent error: {error_str}"}
