import { z } from "zod";

export const UserSchema = z.object({
  uuid: z.string(),
  username: z.string(),
  email: z.string().email().nullable(),
  user_type: z.enum(["guest", "free"]),
  is_superuser: z.boolean(),
  date_joined: z.string(),
});

export const TokenSchema = z.object({
  refresh: z.string(),
  access: z.string(),
  user: UserSchema,
});
