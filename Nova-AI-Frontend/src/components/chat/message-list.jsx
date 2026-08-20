import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

export function MessageList({ messages, status }) {
  const isGenerating = status === "submitted" || status === "streaming";

  return (
    <Conversation className="flex-1">
      <ConversationContent className="mx-auto w-full max-w-3xl px-4 pb-4 pt-6">
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;
          const isStreaming = isGenerating && isLast && message.role === "assistant";

          return (
            <Message
              className="w-full max-w-none px-0 sm:px-2"
              from={message.role}
              key={message.id}
            >
              <div
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {message.role === "user" ? (
                    <User className="size-4" />
                  ) : (
                    <Bot className="size-4" />
                  )}
                </div>

                <MessageContent
                  className="group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground"
                >
                  {message.role === "assistant" ? (
                    message.content === "" && status === "submitted" ? (
                      <Shimmer className="text-sm">Thinking...</Shimmer>
                    ) : (
                      <MessageResponse isAnimating={isStreaming}>
                        {message.content}
                      </MessageResponse>
                    )
                  ) : (
                    message.content
                  )}
                </MessageContent>
              </div>
            </Message>
          );
        })}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
