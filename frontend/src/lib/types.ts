export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  createdAt: string | Date;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface MediaAsset {
  id: string;
  mime_type: string;
  url: string;
}

export interface Note {
  id: string;
  user_id?: string; // Optional because API might not return it in all views or it's redundant
  category_id?: string | null;
  title?: string | null;
  content?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  media_assets: MediaAsset[];
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  framework: "KANBAN_FIXED" | "GRID";
  created_at: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  status: string; // TODO, IN_PROGRESS, DONE
  priority: string; // LOW, MEDIUM, HIGH
  due_date?: string | null;
  content: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface SSEEvent {
  type: "text_delta" | "tool_call" | "tool_result" | "done" | "error";
  content?: string;
  tool?: string;
  args?: string;
  result?: string;
  conversation_id?: string;
  message_id?: string;
}
