import {
  PromptInput,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  usePromptInputController,
} from "@/components/ai-elements/prompt-input";

function toAIStatus(status) {
  if (status === "idle") return "ready";
  return status;
}

function ComposerForm({ onSend, status }) {
  const { textInput } = usePromptInputController();
  const canSubmit = textInput.value.trim().length > 0;

  return (
    <PromptInput
      className="rounded-2xl border border-input bg-background shadow-sm"
      onSubmit={({ text }) => {
        if (text.trim()) {
          onSend(text.trim());
        }
      }}
    >
      <PromptInputTextarea
        className="min-h-[56px] py-3 pr-12"
        placeholder="Message Nova..."
      />
      <PromptInputFooter className="justify-end px-3 pb-3">
        <PromptInputSubmit disabled={!canSubmit} status={toAIStatus(status)} />
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
