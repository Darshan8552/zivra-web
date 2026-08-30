export const currentUser = {
    id: "u_me",
    name: "Ava Reyes",
    username: "ava.reyes",
    avatar: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=200&auto=format",
    bio: "Editor at large. Chasing light and salt air. Currently: Lisbon.",
    followers: 12480,
    following: 328,
    posts: 142,
};

const avatars = [
    "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=200&auto=format",
    "https://images.pexels.com/photos/8556182/pexels-photo-8556182.jpeg?w=200",
    "https://images.pexels.com/photos/7342419/pexels-photo-7342419.jpeg?w=200",
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format",
    "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=200&auto=format",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format",
    "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&auto=format",
];

export const stories = [
    { id: "s1", user: "milo.k", avatar: avatars[1], preview: "https://images.pexels.com/photos/31000908/pexels-photo-31000908.jpeg?w=400", seen: false },
    { id: "s2", user: "june.walker", avatar: avatars[2], preview: "https://images.pexels.com/photos/35161204/pexels-photo-35161204.jpeg?w=400", seen: false },
    { id: "s3", user: "kaz.ito", avatar: avatars[3], preview: "https://images.pexels.com/photos/6159262/pexels-photo-6159262.jpeg?w=400", seen: false },
    { id: "s4", user: "nia.osei", avatar: avatars[4], preview: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&auto=format", seen: true },
    { id: "s5", user: "sam.hart", avatar: avatars[5], preview: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&auto=format", seen: true },
    { id: "s6", user: "ren.oliveira", avatar: avatars[6], preview: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&auto=format", seen: true },
    { id: "s7", user: "tobi.a", avatar: avatars[7], preview: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&auto=format", seen: true },
];

export type MentionableUser = { name: string; username: string; avatar: string };

export const mentionableUsers: MentionableUser[] = [
    { name: "Ava Reyes", username: "ava.reyes", avatar: avatars[0] },
    { name: "Milo Kováč", username: "milo.k", avatar: avatars[1] },
    { name: "June Walker", username: "june.walker", avatar: avatars[2] },
    { name: "Kaz Ito", username: "kaz.ito", avatar: avatars[3] },
    { name: "Nia Osei", username: "nia.osei", avatar: avatars[4] },
    { name: "Sam Hart", username: "sam.hart", avatar: avatars[5] },
    { name: "Ren Oliveira", username: "ren.oliveira", avatar: avatars[6] },
    { name: "Tobi A.", username: "tobi.a", avatar: avatars[7] },
];

export type PostsType = {
    id: string
    user: { name: string, username: string, avatar: string }
    isOwner: boolean
    location: string
    time: string
    caption: string
    image: string
    likes: number
    comments: number
    shares: number
    liked: boolean
    bookmarked: boolean
    hashtags?: string[]
    mentions?: string[]
    likesEnabled?: boolean
    commentsEnabled?: boolean
    sharesEnabled?: boolean
}

export const posts: PostsType[] = [
    {
        id: "p1",
        user: { name: "Milo Kováč", username: "milo.k", avatar: avatars[1] },
        isOwner: false,
        location: "Istanbul, Turkey",
        time: "2h",
        caption: "Blue hour on the Bosphorus. Every window a small story.",
        image: "https://images.pexels.com/photos/31000908/pexels-photo-31000908.jpeg?w=1200",
        likes: 2843, comments: 128, shares: 42,
        liked: false, bookmarked: false,
    },
    {
        id: "p2",
        user: { name: "June Walker", username: "june.walker", avatar: avatars[2] },
        isOwner: false,
        location: "London, UK",
        time: "5h",
        caption: "Rain, neon, and the last bus home.",
        image: "https://images.pexels.com/photos/35161204/pexels-photo-35161204.jpeg?w=1200",
        likes: 5120, comments: 274, shares: 91,
        liked: true, bookmarked: true,
    },
    {
        id: "p3",
        user: { name: "Ava Reyes", username: "ava.reyes", avatar: avatars[0] },
        isOwner: true,
        location: "Lisbon, Portugal",
        time: "1d",
        caption: "Shapes that only make sense at 4pm.",
        image: "https://images.pexels.com/photos/6159262/pexels-photo-6159262.jpeg?w=1200",
        likes: 1832, comments: 64, shares: 18,
        liked: false, bookmarked: false,
    },
    {
        id: "p4",
        user: { name: "Kaz Ito", username: "kaz.ito", avatar: avatars[3] },
        isOwner: false,
        location: "Tokyo, Japan",
        time: "2d",
        caption: "Notebook page 41 — the color of Tuesday.",
        image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1200&auto=format",
        likes: 3410, comments: 152, shares: 60,
        liked: false, bookmarked: true,
    },
];
export const myPosts: PostsType[] = [
    {
        id: "p3",
        user: { name: "Ava Reyes", username: "ava.reyes", avatar: avatars[0] },
        isOwner: true,
        location: "Lisbon, Portugal",
        time: "1d",
        caption: "Shapes that only make sense at 4pm.",
        image: "https://images.pexels.com/photos/6159262/pexels-photo-6159262.jpeg?w=1200",
        likes: 1832, comments: 64, shares: 18,
        liked: false, bookmarked: false,
    },
    {
        id: "p5",
        user: { name: "Ava Reyes", username: "ava.reyes", avatar: avatars[0] },
        isOwner: true,
        location: "Lisbon, Portugal",
        time: "4d",
        caption: "Tile work older than most countries.",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format",
        likes: 964, comments: 31, shares: 9,
        liked: false, bookmarked: false,
    },
    {
        id: "p6",
        user: { name: "Ava Reyes", username: "ava.reyes", avatar: avatars[0] },
        isOwner: true,
        location: "Porto, Portugal",
        time: "1w",
        caption: "Salt air, slow mornings.",
        image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format",
        likes: 2210, comments: 88, shares: 22,
        liked: true, bookmarked: false,
    },
];

export const taggedPosts: PostsType[] = [
    {
        id: "tp1",
        user: { name: "June Walker", username: "june.walker", avatar: avatars[2] },
        isOwner: false,
        location: "London, UK",
        time: "6h",
        caption: "With @ava.reyes, arguing about the best bridge in London.",
        image: "https://images.pexels.com/photos/35161204/pexels-photo-35161204.jpeg?w=1200",
        likes: 1120, comments: 54, shares: 12,
        liked: false, bookmarked: false,
    },
    {
        id: "tp2",
        user: { name: "Kaz Ito", username: "kaz.ito", avatar: avatars[3] },
        isOwner: false,
        location: "Tokyo, Japan",
        time: "2d",
        caption: "Ramen run with @ava.reyes before the flight.",
        image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&auto=format",
        likes: 640, comments: 22, shares: 4,
        liked: false, bookmarked: false,
    },
];

export type SuggestionType ={
    id: string
    name: string
    username: string
    avatar: string
    reason: string
}
export const suggestions: SuggestionType[] = [
    { id: "sg1", name: "Nia Osei", username: "nia.osei", avatar: avatars[4], reason: "Followed by milo.k" },
    { id: "sg2", name: "Sam Hart", username: "sam.hart", avatar: avatars[5], reason: "New to Pulse" },
    { id: "sg3", name: "Ren Oliveira", username: "ren.oliveira", avatar: avatars[6], reason: "Popular this week" },
];

export const notifications = [
    { id: "n1", type: "like", user: "june.walker", avatar: avatars[2], text: "liked your post", time: "3m", preview: "https://images.pexels.com/photos/6159262/pexels-photo-6159262.jpeg?w=100" },
    { id: "n2", type: "follow", user: "kaz.ito", avatar: avatars[3], text: "started following you", time: "18m" },
    { id: "n3", type: "comment", user: "milo.k", avatar: avatars[1], text: "commented: \"the composition is unreal\"", time: "1h", preview: "https://images.pexels.com/photos/31000908/pexels-photo-31000908.jpeg?w=100" },
    { id: "n4", type: "mention", user: "nia.osei", avatar: avatars[4], text: "mentioned you in a story", time: "3h" },
    { id: "n5", type: "like", user: "sam.hart", avatar: avatars[5], text: "and 12 others liked your post", time: "6h", preview: "https://images.pexels.com/photos/35161204/pexels-photo-35161204.jpeg?w=100" },
    { id: "n6", type: "follow", user: "ren.oliveira", avatar: avatars[6], text: "started following you", time: "1d" },
];

export const chats = [
    { id: "c1", name: "June Walker", username: "june.walker", avatar: avatars[2], last: "sent that draft over — take a look", time: "2m", unread: 2, online: true },
    { id: "c2", name: "Milo Kováč", username: "milo.k", avatar: avatars[1], last: "haha absolutely, next week?", time: "1h", unread: 0, online: true },
    { id: "c3", name: "Kaz Ito", username: "kaz.ito", avatar: avatars[3], last: "the tokyo shots came out great", time: "3h", unread: 1, online: false },
    { id: "c4", name: "Nia Osei", username: "nia.osei", avatar: avatars[4], last: "thanks for the follow ✿", time: "1d", unread: 0, online: false },
    { id: "c5", name: "Sam Hart", username: "sam.hart", avatar: avatars[5], last: "you around this weekend?", time: "2d", unread: 0, online: false },
];

export const messages = [
    { id: "m1", from: "them", text: "Hey! Just saw the Lisbon set. Absolute masterclass.", time: "10:14" },
    { id: "m2", from: "me", text: "Thanks June — took ages to get that light.", time: "10:15" },
    { id: "m3", from: "them", text: "It shows. Also — sent that draft over. Take a look when free.", time: "10:16" },
    { id: "m4", from: "me", text: "On it. Give me an hour.", time: "10:17" },
];

export const discoverGrid = [
    "https://images.pexels.com/photos/31000908/pexels-photo-31000908.jpeg?w=800",
    "https://images.pexels.com/photos/35161204/pexels-photo-35161204.jpeg?w=800",
    "https://images.pexels.com/photos/6159262/pexels-photo-6159262.jpeg?w=800",
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&auto=format",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format",
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&auto=format",
    "https://images.unsplash.com/photo-1444837122804-6d2e64764b8b?w=800&auto=format",
    "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=800&auto=format",
    "https://images.unsplash.com/photo-1487260211189-670c54da558d?w=800&auto=format",
    "https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=800&auto=format",
    "https://images.unsplash.com/photo-1449339854873-750e6913a2fb?w=800&auto=format",
];

export const trendingTopics = [
    { tag: "editorialphoto", posts: "128K" },
    { tag: "bluehour", posts: "84K" },
    { tag: "brutalism", posts: "62K" },
    { tag: "streetscape", posts: "41K" },
    { tag: "filmgrain", posts: "39K" },
    { tag: "quietluxury", posts: "22K" },
];
