import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type DragEvent, useMemo, useRef, useState } from "react";
import {
  ImagePlus,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Video,
  X,
} from "lucide-react";
import { Avatar } from "#/components/ui/avatar.tsx";
import { HashtagPicker } from "#/components/main/create/HashtagPicker.tsx";
import type { UserSuggestion } from "#/lib/posts/posts.types.ts";
import { toast } from "sonner";
import { useCreatePost } from "#/lib/posts/posts.hooks.ts";
import { useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "#/lib/auth/auth.hooks.ts";
import { UserTagPicker } from "#/components/main/create/UserTagPicker.tsx";

const MAX_FILES = 10;
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

export const Route = createFileRoute("/_main/create/")({
  component: CreatePostPage,
});

type PendingMedia = { file: File; previewUrl: string; isVideo: boolean };

function CreatePostPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = Route.useRouteContext();
  const createPost = useCreatePost();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<PendingMedia[]>([]);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [taggedUsers, setTaggedUsers] = useState<UserSuggestion[]>([]);
  const [allowComments, setAllowComments] = useState(true);
  const [allowLikes, setAllowLikes] = useState(true);
  const [allowShare, setAllowShare] = useState(true);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList);

    const accepted: PendingMedia[] = [];
    for (const file of incoming) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast(`${file.name}: unsupported file type`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast(`${file.name}: file is larger than 50MB`);
        continue;
      }
      accepted.push({
        file,
        previewUrl: URL.createObjectURL(file),
        isVideo: file.type.startsWith("video/"),
      });
    }

    setMedia((prev) => {
      const next = [...prev, ...accepted];
      if (next.length > MAX_FILES) {
        toast(`You can share up to ${MAX_FILES} photos or videos`);
        return next.slice(0, MAX_FILES);
      }
      return next;
    });
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const onDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const canSubmit = media.length > 0 && !createPost.isPending;

  const toggles = useMemo(
    () => [
      {
        label: "Allow comments",
        enabled: allowComments,
        setEnabled: setAllowComments,
      },
      { label: "Allow likes", enabled: allowLikes, setEnabled: setAllowLikes },
      {
        label: "Allow sharing",
        enabled: allowShare,
        setEnabled: setAllowShare,
      },
    ],
    [allowComments, allowLikes, allowShare],
  );

  const handleSubmit = () => {
    if (media.length === 0) {
      toast("Add at least one photo or video before sharing");
      return;
    }

    const formData = new FormData();
    for (const item of media) formData.append("media", item.file);
    if (caption.trim()) formData.append("caption", caption.trim());
    if (location.trim()) formData.append("locationName", location.trim());
    formData.append("hashtags", JSON.stringify(hashtags));
    formData.append(
      "taggedUserIds",
      JSON.stringify(taggedUsers.map((u) => u.id)),
    );
    formData.append("allowComments", String(allowComments));
    formData.append("allowLikes", String(allowLikes));
    formData.append("allowShare", String(allowShare));

    createPost.mutate(formData, {
      onSuccess: () => {
        toast("Post shared");
        void queryClient.invalidateQueries({
          queryKey: ["users", user.username],
        });
        void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        for (const item of media) URL.revokeObjectURL(item.previewUrl);
        navigate({ to: "/profile" });
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Couldn't share your post."));
      },
    });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-border pb-6 mb-8">
          <p className="overline text-accent">New post</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mt-2">
            Create
          </h1>
        </header>

        <div className="space-y-8">
          {}
          {media.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {media.map((item, index) => (
                <div
                  key={item.previewUrl}
                  className="relative rounded-2xl overflow-hidden border border-border bg-secondary aspect-square"
                >
                  {item.isVideo ? (
                    <video
                      src={item.previewUrl}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={item.previewUrl}
                      alt="Post preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {item.isVideo && (
                    <span className="absolute bottom-2 left-2 h-6 w-6 rounded-full bg-background/80 backdrop-blur flex items-center justify-center">
                      <Video size={12} strokeWidth={1.75} />
                    </span>
                  )}
                  <button
                    type="button"
                    data-testid={`create-remove-image-${index}`}
                    onClick={() => removeMedia(index)}
                    aria-label="Remove media"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-foreground hover:bg-background transition-colors duration-200"
                  >
                    <X size={14} strokeWidth={1.75} />
                  </button>
                </div>
              ))}
              {media.length < MAX_FILES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-foreground transition-colors duration-200"
                >
                  <ImagePlus size={20} strokeWidth={1.75} />
                  <span className="text-xs font-semibold">Add more</span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              data-testid="create-dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[4/5] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:border-foreground transition-colors duration-200 px-6"
            >
              <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center">
                <ImagePlus
                  size={22}
                  strokeWidth={1.75}
                  className="text-muted-foreground"
                />
              </div>
              <p className="font-display font-semibold tracking-tight">
                Drag photos or videos here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Up to {MAX_FILES} files, 50MB each
              </p>
            </button>
          )}
          <input
            ref={fileInputRef}
            data-testid="create-file-input"
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {}
          <div className="flex items-center gap-3">
            <Avatar
              src={user.avatarUrl}
              name={user.name}
              username={user.username}
              size="md"
              shape="square"
            />
            <div>
              <p className="font-display font-semibold tracking-tight">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
          </div>

          {}
          <div>
            <label htmlFor="caption" className="overline text-muted-foreground">
              Caption
            </label>
            <textarea
              id="caption"
              data-testid="create-caption-input"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              rows={4}
              maxLength={2200}
              className="mt-2 w-full rounded-2xl border border-border bg-transparent p-4 text-[15px] leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-200 resize-none"
            />
          </div>

          {}
          <div className="grid gap-6 sm:grid-cols-2">
            <HashtagPicker value={hashtags} onChange={setHashtags} />
            <UserTagPicker value={taggedUsers} onChange={setTaggedUsers} />
          </div>

          {}
          <div>
            <label
              htmlFor="location"
              className="overline text-muted-foreground"
            >
              Location
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-full border border-border px-4 h-12 focus-within:border-foreground transition-colors duration-200">
              <MapPin
                size={16}
                strokeWidth={1.75}
                className="text-muted-foreground shrink-0"
              />
              <input
                id="location"
                data-testid="create-location-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location"
                maxLength={255}
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          {}
          <div className="grid gap-3">
            {toggles.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => item.setEnabled((v) => !v)}
                className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-left hover:border-foreground transition-colors duration-200"
              >
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.enabled ? "Visible on the post" : "Turned off"}
                  </p>
                </div>
                {item.enabled ? (
                  <ToggleRight
                    size={28}
                    strokeWidth={1.75}
                    className="text-accent"
                  />
                ) : (
                  <ToggleLeft
                    size={28}
                    strokeWidth={1.75}
                    className="text-muted-foreground"
                  />
                )}
              </button>
            ))}
          </div>

          {}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              data-testid="create-cancel-btn"
              onClick={() => navigate({ to: "/feed" })}
              className="px-5 h-11 rounded-full text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              data-testid="create-submit-btn"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-6 h-11 rounded-full text-sm font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-opacity duration-200 disabled:opacity-40 disabled:pointer-events-none"
            >
              {createPost.isPending ? "Sharing..." : "Share post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
