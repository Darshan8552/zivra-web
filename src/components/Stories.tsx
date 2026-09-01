import { StoryBar } from "#/components/story/StoryBar.tsx";

/**
 * Backwards-compat re-export.
 * Original mock Stories bar is now replaced by premium StoryBar.
 * When VITE_ENABLE_STORIES is set and the feed query fails, StoryBar
 * automatically falls back to mock data (see StoryBar.tsx).
 */
export const Stories = StoryBar;
export default StoryBar;