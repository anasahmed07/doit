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

export interface Note {
  id: string;
  user_id: string;
  category_id?: string;
  content: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  framework: "KANBAN_FIXED";
  created_at: string;
}
