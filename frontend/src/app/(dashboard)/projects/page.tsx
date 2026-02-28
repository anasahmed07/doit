import { Metadata } from "next";
import ProjectsClient from "./ProjectsClient";

export const metadata: Metadata = {
  title: "Projects",
  description: "Manage your projects, track progress with Kanban boards, and collaborate with your team.",
};

export default function ProjectsPage() {
  return <ProjectsClient />;
}
