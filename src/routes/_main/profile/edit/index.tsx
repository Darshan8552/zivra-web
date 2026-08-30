import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUpdateProfile } from "#/lib/users/users.hooks.ts";
import { useRef, useState } from "react";
import { Camera, MapPin } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "#/lib/auth/auth.hooks.ts";

export const Route = createFileRoute("/_main/profile/edit/")({
  component: EditPage,
});

const MAX_AVATAR_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const USERNAME_REGEX = /^[a-z0-9_]{3,30}$/;

function EditPage() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const updateProfile = useUpdateProfile();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatarUrl,
  );
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio ?? "");
  const [website, setWebsite] = useState(user.website ?? "");
  const [location, setLocation] = useState(user.location ?? "");

  const onAvatarChange = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      toast("Please choose a JPG, PNG, WEBP or HEIC image");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast("Image must be under 10MB");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };
  const handleSubmit = () => {
    if (!name.trim()) {
      toast("Name can't be empty");
      return;
    }
    const normalizedUsername = username.trim().toLowerCase();
    if (!USERNAME_REGEX.test(normalizedUsername)) {
      toast(
        "Username must be 3-30 characters: lowercase letters, numbers, underscores",
      );
      return;
    }

    const formData = new FormData();
    if (avatarFile) formData.append("avatar", avatarFile);
    formData.append("name", name.trim());
    formData.append("username", normalizedUsername);
    formData.append("bio", bio.trim());
    formData.append("website", website.trim());
    formData.append("location", location.trim());

    updateProfile.mutate(formData, {
      onSuccess: () => {
        toast("Profile updated");
        navigate({ to: "/profile" });
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Couldn't update your profile."));
      },
    });
  };
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
      <div className="max-w-xl mx-auto">
        <header className="border-b border-border pb-6 mb-8">
          <p className="overline text-accent">Settings</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mt-2">
            Edit profile
          </h1>
        </header>

        <div className="space-y-8">
          {}
          <div className="flex items-center gap-5">
            <button
              type="button"
              data-testid="edit-avatar-button"
              onClick={() => avatarInputRef.current?.click()}
              className="relative h-20 w-20 rounded-2xl overflow-hidden bg-secondary shrink-0 group"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-secondary" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-background/0 group-hover:bg-background/60 transition-colors duration-200">
                <Camera
                  size={18}
                  strokeWidth={1.75}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                />
              </span>
            </button>
            <div>
              <button
                type="button"
                data-testid="edit-avatar-change-btn"
                onClick={() => avatarInputRef.current?.click()}
                className="text-sm font-semibold text-accent hover:underline"
              >
                Change photo
              </button>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WEBP or HEIC. Up to 10MB.
              </p>
            </div>
            <input
              ref={avatarInputRef}
              data-testid="edit-avatar-input"
              type="file"
              accept={ACCEPTED_AVATAR_TYPES.join(",")}
              className="hidden"
              onChange={(e) => {
                onAvatarChange(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {}
          <div>
            <label htmlFor="name" className="overline text-muted-foreground">
              Name
            </label>
            <input
              id="name"
              data-testid="edit-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="mt-2 w-full h-12 rounded-2xl border border-border bg-transparent px-4 text-[15px] focus:outline-none focus:border-foreground transition-colors duration-200"
            />
          </div>

          {}
          <div>
            <label
              htmlFor="username"
              className="overline text-muted-foreground"
            >
              Username
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border px-4 h-12 focus-within:border-foreground transition-colors duration-200">
              <span className="text-muted-foreground text-[15px]">@</span>
              <input
                id="username"
                data-testid="edit-username-input"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                maxLength={30}
                className="w-full bg-transparent text-[15px] focus:outline-none"
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Lowercase letters, numbers and underscores only.
            </p>
          </div>

          {}
          <div>
            <label htmlFor="bio" className="overline text-muted-foreground">
              Bio
            </label>
            <textarea
              id="bio"
              data-testid="edit-bio-input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={150}
              placeholder="Tell people about yourself"
              className="mt-2 w-full rounded-2xl border border-border bg-transparent p-4 text-[15px] leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-200 resize-none"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {bio.length}/150
            </p>
          </div>

          {}
          <div>
            <label htmlFor="website" className="overline text-muted-foreground">
              Website
            </label>
            <input
              id="website"
              data-testid="edit-website-input"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yoursite.com"
              maxLength={255}
              className="mt-2 w-full h-12 rounded-2xl border border-border bg-transparent px-4 text-[15px] placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-200"
            />
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
                data-testid="edit-location-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                maxLength={100}
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          {}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              data-testid="edit-cancel-btn"
              onClick={() => navigate({ to: "/profile" })}
              className="px-5 h-11 rounded-full text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              data-testid="edit-save-btn"
              onClick={handleSubmit}
              disabled={updateProfile.isPending}
              className="px-6 h-11 rounded-full text-sm font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-opacity duration-200 disabled:opacity-40 disabled:pointer-events-none"
            >
              {updateProfile.isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
