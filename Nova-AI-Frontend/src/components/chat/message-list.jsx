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
import { Bot, FileText, User, X } from "lucide-react";
import { useState } from "react";

function formatFileSize(bytes) {
  if (!bytes || typeof bytes !== "number") return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(att) {
  return (
    att.mediaType?.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif|svg|bmp)$/i.test(att.filename || "")
  );
}

function MessageAttachments({ attachments, onImageClick }) {
  if (!attachments || attachments.length === 0) return null;

  const images = attachments.filter(isImage);
  const docs = attachments.filter((a) => !isImage(a));

  return (
    <div className="flex flex-col gap-2">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => onImageClick(img)}
              className="group relative max-h-60 max-w-xs overflow-hidden rounded-xl border border-primary-foreground/20 bg-background/20 text-left transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {img.url ? (
                <img
                  src={img.url}
                  alt={img.filename || "Uploaded image"}
                  className="max-h-60 w-auto rounded-xl object-contain"
                />
              ) : (
                <div className="flex size-24 items-center justify-center p-2 text-center text-xs">
                  {img.filename}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {docs.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {docs.map((doc, idx) => (
            <div
              key={doc.id || idx}
              className="flex items-center gap-2.5 rounded-xl border border-primary-foreground/20 bg-background/15 px-3 py-2 text-xs"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background/30">
                <FileText className="size-4" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-medium" title={doc.filename}>
                  {doc.filename || "Document"}
                </span>
                {doc.size ? (
                  <span className="text-[10px] opacity-80">
                    {formatFileSize(doc.size)}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MessageList({ messages, status }) {
  const [previewImage, setPreviewImage] = useState(null);
  const isGenerating = status === "submitted" || status === "streaming";

  return (
    <Conversation className="flex-1">
      <ConversationContent className="mx-auto w-full max-w-3xl px-4 pb-4 pt-6">
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;
          const isStreaming = isGenerating && isLast && message.role === "assistant";
          const hasAttachments =
            Array.isArray(message.attachments) && message.attachments.length > 0;
          const isDefaultAttachmentText =
            hasAttachments &&
            (/^Sent \d+ attachment(s)?$/.test(message.content) ||
              /^Sent .+$/.test(message.content));

          return (
            <Message
              className="w-full max-w-none px-0 sm:px-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
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
                    <div className="flex flex-col gap-2">
                      <MessageAttachments
                        attachments={message.attachments}
                        onImageClick={setPreviewImage}
                      />
                      {message.content && !isDefaultAttachmentText ? (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      ) : null}
                    </div>
                  )}
                </MessageContent>
              </div>
            </Message>
          );
        })}
      </ConversationContent>
      <ConversationScrollButton />

      {/* Image Preview Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in-0 duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-border bg-background p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="max-w-md truncate text-sm font-medium text-foreground">
                {previewImage.filename || "Image preview"}
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close preview"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex items-center justify-center p-2">
              <img
                src={previewImage.url}
                alt={previewImage.filename || "Preview"}
                className="max-h-[75vh] max-w-[85vw] rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </Conversation>
  );
}

