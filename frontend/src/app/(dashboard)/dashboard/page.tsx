import { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your workspace overview, task progress, and upcoming deadlines.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
