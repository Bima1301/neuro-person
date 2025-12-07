import { createFileRoute } from "@tanstack/react-router";
import { ChatBotContainer } from "@/components/pages/chatbot/containers";

export const Route = createFileRoute("/app/chatbot")({
    component: ChatBotPage,
});

function ChatBotPage() {
    return <ChatBotContainer />;
}

