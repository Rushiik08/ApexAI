export type ContentType =
  | "blog"
  | "article"
  | "social"
  | "marketing"
  | "product"
  | "email"
  | "summary"
  | "general";

export interface GenerateOptions {
  contentType: ContentType;
  topic: string;
  tone?: string;
  audience?: string;
  length?: "short" | "medium" | "long";
  language?: string;
  instructions?: string;
  mode?: "generate" | "regenerate" | "improve";
  existingContent?: string;
}

export interface GenerateResult {
  title: string;
  content: string;
  model: string;
  provider: string;
  tokensUsed: number;
}
