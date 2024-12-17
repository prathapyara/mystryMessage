import { z } from "zod";

export const messageSchema = z.object({
  content: z.string().min(10, {
    message: "the length of the stirng should be min of 10 charcters",
  }),
});
