import {currentUser, stories} from "#/lib/mock.ts";
import {Plus} from "lucide-react";

export const Stories = () => {
    return(
        <section aria-label="Stories" className="w-full overflow-x-auto no-scrollbar">
            <h2 className="sr-only">Stories</h2>
            <div role="list" className="flex gap-3 pb-2 min-w-max">
                {}
                <div role="listitem">
                    <button
                        type="button"
                        data-testid="story-create"
                        aria-label="Create story"
                        className="group relative w-[110px] h-[170px] rounded-2xl overflow-hidden border border-border bg-secondary flex-shrink-0 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    >
                        <img src={currentUser.avatar} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-200" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="absolute top-2 left-2 h-8 w-8 rounded-full bg-accent flex items-center justify-center border-2 border-background">
                            <Plus size={16} strokeWidth={2} aria-hidden="true" className="text-accent-foreground" />
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 text-left">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/80">New</p>
                            <p className="text-sm font-display font-semibold tracking-tight text-white">Your story</p>
                        </div>
                    </button>
                </div>

                {stories.map((s) => (
                    <div key={s.id} role="listitem">
                        <button
                            type="button"
                            data-testid={`story-${s.id}`}
                            aria-label={`View ${s.user}'s story${s.seen ? ' - seen' : ''}`}
                            className="group relative w-[110px] h-[170px] rounded-2xl overflow-hidden flex-shrink-0 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                        >
                            <img src={s.preview} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className={`absolute inset-0 rounded-2xl border-2 ${s.seen ? "border-transparent" : "border-accent"}`} />
                            <img
                                src={s.avatar}
                                alt=""
                                aria-hidden="true"
                                className="absolute top-2 left-2 h-8 w-8 rounded-full object-cover border-2 border-background"
                            />
                            <div className="absolute bottom-2 left-2 right-2">
                                <p className="text-xs font-display font-semibold tracking-tight text-white truncate">@{s.user}</p>
                            </div>
                        </button>
                    </div>
                ))}
            </div>
        </section>
    )
}