import { createFileRoute } from '@tanstack/react-router'
import {useEffect, useMemo, useRef, useState} from "react";
import {ArrowLeft, ImagePlus, MessageCircle, MoreHorizontal, Phone, Search, Send, Share2, Smile, UserRound, Video} from "lucide-react";
import { useConversations, useMessages, useSendMessage, useMarkConversationRead, useSendImageMessage, useSendPostShare, useSendProfileShare } from "#/lib/chat/chat.hooks.ts";
import { useChatSocket, useTypingIndicator, usePresence } from "#/lib/chat/chat.socket.ts";
import { getChatSocket } from "#/lib/chat/ws-client.ts";
import { useDebouncedValue } from "#/lib/use-debounced-value.ts";
import type { ChatConversation } from "#/lib/chat/chat.types.ts";
import { useNavigate } from "@tanstack/react-router";
import { useSuggestions } from "#/lib/users/users.hooks.ts";
import { useToggleFollow } from "#/lib/users/users.hooks.ts";

export const Route = createFileRoute('/_main/chat/')({
  validateSearch: (search: Record<string, unknown>) => ({
    conversationId: (search.conversationId as string | undefined) ?? undefined,
  }),
  component: ChatPage,
})

function ChatPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { data: convPages, isLoading: convLoading, isError: convoError, error: convoErr, fetchNextPage: fetchNextConvo, hasNextPage: hasNextConvo, isFetchingNextPage: isFetchingConvoNext } = useConversations(debouncedSearch || undefined);
  const conversations: ChatConversation[] = useMemo(() => convPages?.pages.flatMap(p => p.items) ?? [], [convPages]);

  const navigate = useNavigate();
  const { data: suggestions } = useSuggestions();
  const toggleFollow = useToggleFollow();
  const { conversationId: searchConversationId } = Route.useSearch();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openThread, setOpenThread] = useState(false);
  const [input, setInput] = useState("");
  const convoSentinelRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesTopSentinelRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastConvoFetchRef = useRef(0);
  const lastMsgFetchRef = useRef(0);

  useEffect(() => {
    if (searchConversationId) setActiveId(searchConversationId);
  }, [searchConversationId]);

  useEffect(() => {
    if (!activeId && conversations.length > 0) setActiveId(conversations[0].id);
  }, [activeId, conversations]);

  useEffect(() => {
    if (searchConversationId) setOpenThread(true);
  }, [searchConversationId]);

  const activeConv = useMemo(() => conversations.find(c => c.id === activeId) ?? null, [conversations, activeId]);
  const displayChats = conversations;
  const active: ChatConversation | null = activeConv;

  const { data: msgPages, isLoading: msgLoading, isError: msgError, fetchNextPage: fetchNextMessages, hasNextPage: hasNextMessages, isFetchingNextPage: isFetchingMessagesNext } = useMessages(activeId ?? "");
  const messagesData = useMemo(() => msgPages?.pages.flatMap(p => p.items) ?? [], [msgPages]);
  const displayMessages = messagesData;

  useChatSocket(activeId ?? undefined);
  const typingUsers = useTypingIndicator(activeId ?? undefined);
  const presence = usePresence();
  const sendMutation = useSendMessage(activeId ?? "");
  const sendImageMutation = useSendImageMessage(activeId ?? "");
  const sendPostShare = useSendPostShare(activeId ?? "");
  const sendProfileShare = useSendProfileShare(activeId ?? "");
  const markRead = useMarkConversationRead();
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!activeId) return;
    markRead.mutate(activeId);
    try {
      getChatSocket().emit('message:read', { conversationId: activeId });
    } catch { /* ignore */ }
  }, [activeId]);

  // Infinite scroll: conversations
  useEffect(() => {
    if (!hasNextConvo) return;
    const el = convoSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isFetchingConvoNext) {
        const now = Date.now();
        if (now - lastConvoFetchRef.current < 1000) return;
        lastConvoFetchRef.current = now;
        fetchNextConvo();
      }
    }, { rootMargin: '100px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextConvo, isFetchingConvoNext, fetchNextConvo]);

  // Infinite scroll: messages load older when top sentinel visible
  useEffect(() => {
    if (!hasNextMessages) return;
    const el = messagesTopSentinelRef.current;
    if (!el) return;
    const root = messagesContainerRef.current;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isFetchingMessagesNext) {
        const now = Date.now();
        if (now - lastMsgFetchRef.current < 1000) return;
        lastMsgFetchRef.current = now;
        fetchNextMessages();
      }
    }, { root: root ?? undefined, rootMargin: '100px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextMessages, isFetchingMessagesNext, fetchNextMessages, activeId]);

  // Auto scroll to bottom on new messages / typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages.length, typingUsers.length]);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeId) return;
    sendImageMutation.mutate(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSharePost = () => {
    if (!activeId) return;
    const postId = window.prompt('Enter post ID to share (uuidv7):');
    if (!postId?.trim()) return;
    sendPostShare.mutate(postId.trim());
  };

  const handleShareProfile = () => {
    if (!activeId) return;
    const userId = window.prompt('Enter user ID to share (uuidv7):');
    if (!userId?.trim()) return;
    sendProfileShare.mutate(userId.trim());
  };

  const emitTyping = () => {
    if (!activeId) return;
    try {
      getChatSocket().emit('chat:typing', { conversationId: activeId });
    } catch { /* ignore */ }
  };

  const emitStopTyping = () => {
    if (!activeId) return;
    try {
      getChatSocket().emit('chat:stopTyping', { conversationId: activeId });
    } catch { /* ignore */ }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    emitTyping();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !activeId) {
      setInput("");
      return;
    }
    emitStopTyping();
    sendMutation.mutate(trimmed, { onSuccess: () => setInput("") });
  };

  return (
      <div className="h-[calc(100vh-0px)] lg:h-screen flex">
        {}
        <section className={`${openThread ? "hidden md:flex" : "flex"} flex-col w-full md:w-[380px] border-r border-border`}>
          <header className="px-6 pt-8 pb-4">
            <p className="overline text-accent">Inbox</p>
            <h1 className="font-display font-bold text-3xl tracking-tight mt-2">Messages</h1>
            <div className="mt-5 relative">
              <Search size={16} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                  data-testid="chat-search-input"
                  placeholder="Search conversations"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-full bg-secondary border border-transparent focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-sm transition-colors duration-200"
              />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scroll">
            {convoError ? <p className="px-6 py-4 text-sm text-destructive">Failed to load: {String((convoErr as Error)?.message ?? 'error')}</p> : convLoading ? <p className="px-6 py-4 text-sm text-muted-foreground">Loading…</p> : displayChats.length === 0 ? (
              <div className="px-6 py-8 space-y-6">
                <div className="border border-dashed border-border rounded-2xl p-8 text-center space-y-4">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center">
                    <MessageCircle size={20} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-display font-semibold">No conversations yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Follow someone to start chatting. Your messages will appear here.</p>
                  </div>
                  <button data-testid="chat-empty-search-btn" onClick={() => navigate({ to: '/search' })} className="h-10 px-6 rounded-full bg-foreground text-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">Find people to message</button>
                </div>
                {suggestions && suggestions.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground px-1">Suggested for you</p>
                    <div className="space-y-2">
                      {suggestions.slice(0, 4).map((u) => (
                        <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors">
                          {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="h-10 w-10 rounded-xl object-cover" /> : <div className="h-10 w-10 rounded-xl bg-secondary" />}
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium truncate">{u.name}</p>
                            <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
                          </div>
                          <button data-testid={`suggest-follow-chat-${u.id}`} onClick={() => toggleFollow.mutate(u.username)} disabled={toggleFollow.isPending} className="h-8 px-4 rounded-full bg-foreground text-background text-xs font-medium disabled:opacity-50">
                            Follow
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : displayChats.map((c) => {
              const cid = (c as ChatConversation).id ?? (c as unknown as { id: string }).id;
              const isActive = (active as unknown as { id: string })?.id === cid;
              const avatar = (c as ChatConversation).otherParticipant?.avatarUrl ?? (c as unknown as { avatar: string }).avatar;
              const name = (c as ChatConversation).otherParticipant?.name ?? (c as unknown as { name: string }).name ?? (c as ChatConversation).title ?? 'Conversation';
              const unread = (c as ChatConversation).unreadCount ?? (c as unknown as { unread: number }).unread ?? 0;
              const last = (c as ChatConversation).lastMessage?.content ?? (c as unknown as { last: string }).last ?? '';
              const time = (c as ChatConversation).updatedAt ? new Date((c as ChatConversation).updatedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : (c as unknown as { time: string }).time ?? '';
              const otherId = (c as ChatConversation).otherParticipant?.id;
              const online = otherId ? presence.get(otherId) ?? false : (c as unknown as { online?: boolean }).online ?? false;
              return (
                <button
                    key={cid}
                    data-testid={`chat-item-${cid}`}
                    onClick={() => { setActiveId(cid); setOpenThread(true); }}
                    className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors duration-200 hover:bg-secondary ${
                        isActive ? "bg-secondary" : ""
                    }`}
                >
                  <div className="relative">
                    {avatar ? <img src={avatar} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <div className="h-12 w-12 rounded-xl bg-secondary" />}
                    {online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-accent border-2 border-background" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <p className="font-display font-semibold text-sm tracking-tight truncate">{name}</p>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground shrink-0 ml-2">{time}</span>
                    </div>
                    <p className={`text-sm truncate ${unread ? "text-foreground font-medium" : "text-muted-foreground"}`}>{last}</p>
                  </div>
                  {unread > 0 && (
                      <span className="h-6 min-w-6 px-2 rounded-full bg-accent text-accent-foreground text-xs font-semibold flex items-center justify-center">
                  {unread}
                </span>
                  )}
                </button>
              );
            })}
            {hasNextConvo && <div ref={convoSentinelRef} className="h-1" />}
            {isFetchingConvoNext && <p className="px-6 py-2 text-xs text-muted-foreground text-center">Loading more…</p>}
          </div>
        </section>

        {}
        <section className={`${openThread ? "flex" : "hidden md:flex"} flex-1 flex-col bg-background`}>
          <header className="flex items-center gap-3 px-6 h-20 border-b border-border">
            <button data-testid="chat-back-btn" onClick={() => setOpenThread(false)} className="md:hidden text-muted-foreground hover:text-foreground">
              <ArrowLeft size={20} strokeWidth={1.75} />
            </button>
            {(() => {
              const avatar = (active as ChatConversation)?.otherParticipant?.avatarUrl ?? (active as unknown as { avatar: string })?.avatar ?? '';
              const name = (active as ChatConversation)?.otherParticipant?.name ?? (active as unknown as { name: string })?.name ?? (active as ChatConversation)?.title ?? 'Select a conversation';
              const otherId = (active as ChatConversation)?.otherParticipant?.id;
              const online = otherId ? presence.get(otherId) ?? false : (active as unknown as { online?: boolean })?.online ?? false;
              const sub = online ? 'Active now' : ((active as unknown as { time?: string })?.time ? `Last seen ${(active as unknown as { time: string }).time} ago` : (otherId ? 'Offline' : ''));
              return (<>
            {avatar ? <img src={avatar} alt="" className="h-11 w-11 rounded-xl object-cover" /> : <div className="h-11 w-11 rounded-xl bg-secondary" />}
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold tracking-tight">{name}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div></>);
            })()}
            <button data-testid="chat-call-btn" className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200"><Phone size={18} strokeWidth={1.75} /></button>
            <button data-testid="chat-video-btn" className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200"><Video size={18} strokeWidth={1.75} /></button>
            <button data-testid="chat-more-btn" className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200"><MoreHorizontal size={18} strokeWidth={1.75} /></button>
          </header>

          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto custom-scroll px-6 py-8 space-y-4">
            <div ref={messagesTopSentinelRef} className="h-1" />
            {isFetchingMessagesNext && <p className="text-center text-xs text-muted-foreground">Loading older messages…</p>}
            {msgError ? <p className="text-center text-sm text-destructive">Failed to load messages</p> : null}
            <div className="text-center">
              <span className="overline text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">Today</span>
            </div>
            {!activeId ? (
              <div className="border border-dashed border-border rounded-2xl p-8 text-center space-y-4 max-w-sm mx-auto mt-8">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center">
                  <MessageCircle size={20} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="font-display font-semibold">Select a chat</p>
                  <p className="text-sm text-muted-foreground mt-1">Choose a conversation from the left or find someone new to message.</p>
                </div>
                <button onClick={() => navigate({ to: '/search' })} className="h-10 px-6 rounded-full bg-secondary text-foreground text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">Browse people</button>
              </div>
            ) : msgLoading ? <p className="text-center text-sm text-muted-foreground">Loading messages…</p> : displayMessages.length === 0 ? <p className="text-center text-sm text-muted-foreground">No messages yet. Say hello!</p> : displayMessages.map((m) => {
              const text = m.content ?? '';
              const timeStr = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '';
              const mediaUrl = m.mediaUrl ?? null;
              const mediaType = m.type ?? null;
              const sharedPost = m.sharedPost ?? null;
              const sharedProfile = m.sharedProfile ?? null;
              const realIsMe = m.senderId && active?.otherParticipant ? m.senderId !== active.otherParticipant.id : false;
              const alignRight = realIsMe;
              return (
                <div key={(m as { id: string }).id} className={`flex ${alignRight ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-4 py-3 text-[15px] leading-relaxed ${
                      alignRight
                          ? "bg-foreground text-background rounded-2xl rounded-br-md"
                          : "bg-secondary text-foreground rounded-2xl rounded-bl-md"
                  }`}>
                    {mediaUrl && mediaType === 'IMAGE' ? (
                      <img src={mediaUrl} alt="" className="rounded-xl max-w-[280px] max-h-[320px] object-cover mb-2" />
                    ) : null}
                    {mediaType === 'POST_SHARE' && sharedPost ? (
                      <div className={`rounded-xl p-3 mb-2 flex items-center gap-3 ${alignRight ? 'bg-background/10' : 'bg-background'}`}>
                        <Share2 size={16} className="shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">Post</p>
                          <p className="text-xs opacity-70 truncate">{sharedPost.caption ?? sharedPost.id}</p>
                        </div>
                      </div>
                    ) : null}
                    {mediaType === 'PROFILE_SHARE' && sharedProfile ? (
                      <div className={`rounded-xl p-3 mb-2 flex items-center gap-3 ${alignRight ? 'bg-background/10' : 'bg-background'}`}>
                        {sharedProfile.avatarUrl ? <img src={sharedProfile.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" /> : <div className="h-8 w-8 rounded-full bg-secondary" />}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{sharedProfile.name}</p>
                          <p className="text-xs opacity-70 truncate">@{sharedProfile.username}</p>
                        </div>
                      </div>
                    ) : null}
                    {text}
                    <p className={`mt-1 text-[10px] uppercase tracking-[0.2em] ${alignRight ? "text-background/60" : "text-muted-foreground"}`}>{timeStr}</p>
                  </div>
                </div>
              );
            })}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-secondary text-foreground rounded-2xl rounded-bl-md px-4 py-3 text-sm animate-pulse">
                  {typingUsers.length === 1
                    ? `${typingUsers[0].name} is typing…`
                    : `${typingUsers.map((u) => u.name).join(', ')} are typing…`}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className="hidden" onChange={handleImagePick} data-testid="chat-image-input" />
          <form
              onSubmit={handleSend}
              className="border-t border-border p-4 flex items-center gap-2"
          >
            <button type="button" data-testid="chat-image-btn" onClick={() => fileRef.current?.click()} disabled={!activeId || sendImageMutation.isPending} className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200 disabled:opacity-50">
              <ImagePlus size={18} strokeWidth={1.75} />
            </button>
            <button type="button" data-testid="chat-share-post-btn" onClick={handleSharePost} disabled={!activeId || sendPostShare.isPending} title="Share post" className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200 disabled:opacity-50">
              <Share2 size={18} strokeWidth={1.75} />
            </button>
            <button type="button" data-testid="chat-share-profile-btn" onClick={handleShareProfile} disabled={!activeId || sendProfileShare.isPending} title="Share profile" className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200 disabled:opacity-50">
              <UserRound size={18} strokeWidth={1.75} />
            </button>
            <input
                data-testid="chat-message-input"
                placeholder={activeId ? "Write something thoughtful…" : "Select a conversation first"}
                value={input}
                onChange={handleInputChange}
                onBlur={emitStopTyping}
                disabled={!activeId || sendMutation.isPending}
                className="flex-1 h-12 px-5 rounded-full bg-secondary border border-transparent focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-[15px] transition-colors duration-200 disabled:opacity-50"
            />
            <button type="button" data-testid="chat-emoji-btn" className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200">
              <Smile size={18} strokeWidth={1.75} />
            </button>
            <button data-testid="chat-send-btn" type="submit" disabled={!activeId || sendMutation.isPending || !input.trim()} className="h-12 w-12 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors duration-200 disabled:opacity-50">
              <Send size={16} strokeWidth={2} />
            </button>
          </form>
        </section>
      </div>
  );
}
