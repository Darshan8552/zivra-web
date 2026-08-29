import { z } from "zod";

export const feedQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
});

export type FeedQuery = z.infer<typeof feedQuerySchema>;
