import { Metadata } from "next";
import NotesClient from "./NotesClient";

export const metadata: Metadata = {
  title: "Notes",
  description: "Capture your thoughts, ideas, and tasks with multimedia support and smart categorization.",
};

export default function NotesPage() {
  return <NotesClient />;
}
