import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputController,
} from "@/components/ai-elements/prompt-input";
import { FileText, Paperclip, X } from "lucide-react";
import { toast } from "sonner";

function toAIStatus(status) {
  if (status === "idle") return "ready";
  return status;
}

function formatFileSize(bytes) {
  if (!bytes || typeof bytes !== "number") return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageAttachment(file) {
  return (
    file.mediaType?.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif|svg|bmp)$/i.test(file.filename || "")
  );
}

function AttachmentPreviewList({ files, onRemove }) {
  if (!files || files.length === 0) return null;

  return (
    <div className="w-full max-w-full overflow-hidden px-3 pt-3 self-start">
      <div className="flex w-full items-center justify-start gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/25 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 [&::-webkit-scrollbar-track]:bg-transparent">
        {files.map((file) => {
          const isImage = isImageAttachment(file);
          return (
            <div
              key={file.id}
              className="group relative flex shrink-0 items-center gap-2 rounded-xl border border-border bg-muted/50 p-1.5 pr-2.5 text-xs text-foreground transition-all duration-200 hover:bg-muted"
            >
              {isImage ? (
                <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-background">
                  <img
                    src={file.url}
                    alt={file.filename}
                    className="size-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-background text-primary">
                  <FileText className="size-5" />
                </div>
              )}

              <div className="flex max-w-[140px] flex-col">
                <span className="truncate font-medium" title={file.filename}>
                  {file.filename}
                </span>
                {file.size ? (
                  <span className="text-[10px] text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => onRemove?.(file.id)}
                className="ml-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted-foreground/20 text-foreground transition-all hover:bg-destructive hover:text-destructive-foreground focus:outline-none"
                aria-label={`Remove ${file.filename}`}
              >
                <X className="size-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComposerForm({ onSend, status }) {
  const { textInput, attachments } = usePromptInputController();
  const hasAttachments = (attachments?.files?.length ?? 0) > 0;
  const canSubmit = textInput.value.trim().length > 0 || hasAttachments;

  return (
    <PromptInput
      accept="image/*,.pdf,.txt,.md,.csv,.json,.js,.jsx,.ts,.tsx,.py,.html,.css,.xml,.doc,.docx"
      multiple
      maxFiles={10}
      maxFileSize={25 * 1024 * 1024}
      onError={(err) => toast.error(err?.message || "Failed to add attachment")}
      className="rounded-2xl border border-input bg-background shadow-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 focus-within:shadow-md"
      onSubmit={({ text, files }) => {
        const trimmed = text?.trim() || "";
        const fileList = files || [];
        if (trimmed || fileList.length > 0) {
          onSend({ text: trimmed, files: fileList });
        }
      }}
    >
      <AttachmentPreviewList
        files={attachments?.files}
        onRemove={attachments?.remove}
      />
      <PromptInputTextarea
        className="min-h-[56px] py-3 pr-12"
        placeholder={hasAttachments ? "Add a message or instructions (optional)..." : "Message Nova..."}
      />
      <PromptInputFooter className="justify-between px-3 pb-3">
        <PromptInputTools>
          <PromptInputButton
            tooltip="Attach image or document"
            onClick={() => attachments?.openFileDialog?.()}
            className="size-8 rounded-lg text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            aria-label="Attach file"
          >
            <Paperclip className="size-4" />
          </PromptInputButton>
        </PromptInputTools>
        <PromptInputSubmit
          disabled={!canSubmit}
          status={toAIStatus(status)}
          className="transition-all duration-200 hover:scale-105 active:scale-95"
        />
      </PromptInputFooter>
    </PromptInput>
  );
}

export function Composer({ onSend, status }) {
  return (
    <PromptInputProvider>
      <ComposerForm onSend={onSend} status={status} />
    </PromptInputProvider>
  );
}

