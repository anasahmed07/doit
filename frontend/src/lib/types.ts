export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  createdAt: string;
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
  framework: "KANBAN_FIXED";
  created_at: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  status: string; // TODO, IN_PROGRESS, DONE
  content: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}
