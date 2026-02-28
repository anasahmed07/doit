import { Metadata } from "next";
import ChatClient from "./ChatClient";

export const metadata: Metadata = {
  title: "AI Chat",
  description: "Chat with the DOIT AI assistant to organize your tasks, get project advice, and find information quickly.",
};

export default function ChatPage() {
  return <ChatClient />;
}
