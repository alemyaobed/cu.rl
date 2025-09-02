import { z } from 'zod';

export const TokenSchema = z.object({
  refresh: z.string(),
  access: z.string(),
  user: z.object({
    uuid: z.string(),
    username: z.string(),
    email: z.string().email().nullable(),
    user_type: z.enum(['guest', 'free']),
  }),
});
