import { createFileRoute } from '@tanstack/react-router'
import {useState} from "react";
import {Bookmark, Calendar, Grid, Heart, LinkIcon, MapPin, MessageSquare, Settings} from "lucide-react";
import {currentUser, discoverGrid, posts} from "#/lib/mock.ts";

export const Route = createFileRoute('/_main/profile/')({
  component: RouteComponent,
})

const tabs = [
  { id: "posts", label: "Posts", icon: Grid },
  { id: "replies", label: "Replies", icon: MessageSquare },
  { id: "media", label: "Media", icon: Bookmark },
  { id: "likes", label: "Likes", icon: Heart },
];

function RouteComponent() {
  const [tab, setTab] = useState("posts");

  return(
      <div>
        {/* Cover */}
        <div className="relative h-48 sm:h-64 lg:h-80 bg-secondary overflow-hidden">
          <img
              src="https://images.pexels.com/photos/31022528/pexels-photo-31022528.jpeg?w=1600"
              alt=""
              className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="px-4 sm:px-6 lg:px-10 -mt-16 sm:-mt-20">
          <div className="max-w-4xl mx-auto">
            {/* Avatar + actions */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <img
                  src={currentUser.avatar}
                  alt=""
                  className="h-28 w-28 sm:h-36 sm:w-36 rounded-3xl object-cover border-4 border-background"
              />
              <div className="flex gap-2 pb-2">
                <button data-testid="profile-edit-btn" className="px-5 h-11 rounded-full border border-border font-semibold text-sm hover:border-foreground transition-colors duration-200">
                  Edit profile
                </button>
                <button data-testid="profile-settings-btn" className="h-11 w-11 rounded-full border border-border flex items-center justify-center hover:border-foreground transition-colors duration-200">
                  <Settings size={16} strokeWidth={1.75} />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="mt-6">
              <h1 className="font-display font-bold text-4xl tracking-tight">{currentUser.name}</h1>
              <p className="text-muted-foreground mt-1">@{currentUser.username}</p>
              <p className="mt-5 text-[15px] leading-relaxed max-w-xl">{currentUser.bio}</p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin size={14} strokeWidth={1.75} /> Lisbon, Portugal</span>
                <a href="#" className="flex items-center gap-1.5 hover:text-accent transition-colors duration-200"><LinkIcon size={14} strokeWidth={1.75} /> avareyes.co</a>
                <span className="flex items-center gap-1.5"><Calendar size={14} strokeWidth={1.75} /> Joined March 2022</span>
              </div>

              <div className="mt-6 flex gap-6 text-sm">
                <button data-testid="profile-stat-following" className="hover:text-accent transition-colors duration-200">
                  <span className="font-display font-bold text-base mr-1">{currentUser.following}</span>
                  <span className="text-muted-foreground">Following</span>
                </button>
                <button data-testid="profile-stat-followers" className="hover:text-accent transition-colors duration-200">
                  <span className="font-display font-bold text-base mr-1">{currentUser.followers.toLocaleString()}</span>
                  <span className="text-muted-foreground">Followers</span>
                </button>
                <div>
                  <span className="font-display font-bold text-base mr-1">{currentUser.posts}</span>
                  <span className="text-muted-foreground">Posts</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-10 border-b border-border flex gap-2 overflow-x-auto no-scrollbar">
              {tabs.map((t) => (
                  <button
                      key={t.id}
                      data-testid={`profile-tab-${t.id}`}
                      onClick={() => setTab(t.id)}
                      className={`relative flex items-center gap-2 px-4 py-3 text-sm font-display font-semibold tracking-tight transition-colors duration-200 ${
                          tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <t.icon size={14} strokeWidth={1.75} />
                    {t.label}
                    {tab === t.id && <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-accent" />}
                  </button>
              ))}
            </div>

            {/* Content */}
            <section className="mt-8 pb-16">
              {tab === "posts" && (
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[...posts.map(p => p.image), ...discoverGrid].slice(0, 12).map((src, i) => (
                        <div key={i} data-testid={`profile-post-${i}`} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                          <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                    ))}
                  </div>
              )}
              {tab !== "posts" && (
                  <div className="py-24 text-center border border-dashed border-border rounded-2xl">
                    <p className="overline text-muted-foreground">Nothing here yet</p>
                    <p className="font-display text-2xl tracking-tight mt-2">Your {tab} will show up here.</p>
                  </div>
              )}
            </section>
          </div>
        </div>
      </div>
  )
}
