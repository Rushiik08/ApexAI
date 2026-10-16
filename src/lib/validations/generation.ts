import { z } from "zod";

export const contentTypeEnum = z.enum([
  "blog",
  "article",
  "social",
  "marketing",
  "product",
  "email",
  "summary",
  "general",
]);

export const generateSchema = z.object({
  contentType: contentTypeEnum,
  topic: z.string().min(3, "Topic or prompt must be at least 3 characters").max(2000, "Prompt cannot exceed 2000 characters"),
  tone: z.string().max(50).optional().default("professional"),
  audience: z.string().max(100).optional().default("general"),
  length: z.enum(["short", "medium", "long"]).optional().default("medium"),
  language: z.string().max(50).optional().default("English"),
  instructions: z.string().max(1000).optional().default(""),
  mode: z.enum(["generate", "regenerate", "improve"]).optional().default("generate"),
  existingContent: z.string().max(20000).optional().default(""),
});

export const saveGenerationSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  contentType: contentTypeEnum,
  topic: z.string().min(1).max(2000),
  prompt: z.string().min(1).max(5000),
  generatedContent: z.string().min(1, "Generated content cannot be empty"),
  tone: z.string().max(50).optional(),
  audience: z.string().max(100).optional(),
  length: z.string().max(20).optional(),
  language: z.string().max(50).optional(),
  modelUsed: z.string().max(100).optional(),
  isFavorite: z.boolean().optional().default(false),
});

export const updateGenerationSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(255).optional(),
  generatedContent: z.string().min(1, "Content cannot be empty").optional(),
  isFavorite: z.boolean().optional(),
});

export type GenerateInput = z.infer<typeof generateSchema>;
export type SaveGenerationInput = z.infer<typeof saveGenerationSchema>;
export type UpdateGenerationInput = z.infer<typeof updateGenerationSchema>;
