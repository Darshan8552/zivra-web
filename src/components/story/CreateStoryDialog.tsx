import { Dialog } from "radix-ui";
import { ImagePlus, Loader2, Lock, Globe, X, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCreateStory } from "#/lib/stories/stories.hooks.ts";
import { getErrorMessage } from "#/lib/auth/auth.hooks.ts";

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/webm";
const MAX_SIZE = 30 * 1024 * 1024;

export interface CreateStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

type Visibility = "PUBLIC" | "CLOSE_FRIENDS";

export function CreateStoryDialog({ open, onOpenChange, onCreated }: CreateStoryDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");
  const createStory = useCreateStory();

  const reset = () => {
    setFile(null);
    setIsVideo(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setVisibility("PUBLIC");
    if (inputRef.current) inputRef.current.value = "";
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // reset when dialog closes
  useEffect(() => {
    if (!open) {
      // delay reset to allow exit animation
      const t = setTimeout(reset, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
      "video/mp4",
      "video/quicktime",
      "video/webm",
    ];
    if (!allowed.includes(f.type)) {
      toast.error("Unsupported file type");
      e.target.value = "";
      return;
    }
    if (f.size > MAX_SIZE) {
      toast.error("File too large — max 30MB");
      e.target.value = "";
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(f);
    setFile(f);
    setPreviewUrl(url);
    setIsVideo(f.type.startsWith("video/"));
  };

  const canSubmit = !!file && !createStory.isPending;

  const handleSubmit = () => {
    if (!file) {
      toast.error("Choose a photo or video first");
      return;
    }
    const fd = new FormData();
    fd.append("media", file);
    fd.append("visibility", visibility);
    createStory.mutate(fd, {
      onSuccess: () => {
        toast.success("Story shared");
        onCreated?.();
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error(getErrorMessage(err, "Couldn't create story"));
      },
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content
          aria-describedby={undefined}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-[480px] max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-background border border-border shadow-[0_16px_48px_rgba(0,0,0,0.18)] p-6 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display font-bold text-xl tracking-tight">Create story</Dialog.Title>
              <Dialog.Description className="text-xs text-muted-foreground mt-1">
                Share a photo or video — visible for 24 hours.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close"
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <X size={14} />
            </Dialog.Close>
          </div>

          {/* File picker / preview */}
          <div className="mt-6">
            {!previewUrl ? (
              <button
                type="button"
                data-testid="create-story-dropzone"
                onClick={() => inputRef.current?.click()}
                className="w-full aspect-[9/13] max-h-[380px] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 text-center hover:border-foreground transition-colors px-6"
              >
                <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center">
                  <ImagePlus size={22} strokeWidth={1.75} className="text-muted-foreground" />
                </div>
                <p className="font-display font-semibold tracking-tight text-sm">Tap to choose photo or video</p>
                <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, HEIC or MP4 / MOV / WebM — max 30MB, 30s video</p>
              </button>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-border bg-black aspect-[9/16] max-h-[520px]">
                {isVideo ? (
                  <video src={previewUrl} controls muted playsInline className="h-full w-full object-contain bg-black" />
                ) : (
                  <img src={previewUrl} alt="Story preview" className="h-full w-full object-contain bg-black" />
                )}
                {isVideo && (
                  <span className="absolute bottom-3 left-3 h-7 px-2.5 rounded-full bg-black/60 backdrop-blur text-white text-xs font-semibold flex items-center gap-1.5">
                    <Video size={12} /> Video
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                    setFile(null);
                    setIsVideo(false);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  aria-label="Remove"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              data-testid="create-story-file-input"
              onChange={handleFile}
            />
          </div>

          {/* Visibility toggle */}
          <div className="mt-5 grid grid-cols-2 gap-2 p-1 rounded-2xl bg-secondary border border-border">
            <button
              type="button"
              data-testid="visibility-public"
              onClick={() => setVisibility("PUBLIC")}
              className={`h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${visibility === "PUBLIC" ? "bg-background border border-border shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Globe size={12} /> Public
            </button>
            <button
              type="button"
              data-testid="visibility-close-friends"
              onClick={() => setVisibility("CLOSE_FRIENDS")}
              className={`h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${visibility === "CLOSE_FRIENDS" ? "bg-background border border-border shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Lock size={12} /> Close friends
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Dialog.Close className="px-5 h-10 rounded-full text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </Dialog.Close>
            <button
              type="button"
              data-testid="create-story-submit"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-6 h-10 rounded-full text-sm font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
            >
              {createStory.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
              {createStory.isPending ? "Sharing…" : "Share story"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default CreateStoryDialog;
