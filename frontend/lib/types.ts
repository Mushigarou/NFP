import { z } from 'zod';

export const noteSchema = z.object({
  id: z.number(),
  text: z.string(),
  completed: z.boolean(),
});

export const noteInSchema = z.object({
  text: z.string(),
  completed: z.boolean(),
});

export type Note = z.infer<typeof noteSchema>;
export type NoteIn = z.infer<typeof noteInSchema>;
