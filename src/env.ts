import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    SERVER_URL: z.string().url().optional(),
    BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET harus minimal 32 karakter").optional(),

    // OPENAI_API_KEY: z.string().min(1),
    // OPENAI_MODEL: z.string().default('gpt-4o-mini'),
    // OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
    // UPLOADTHING_SECRET: z.string().min(1),
    // UPLOADTHING_APP_ID: z.string().min(1),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "VITE_",

  client: {
    VITE_APP_TITLE: z.string().min(1).optional(),
    VITE_GEMINI_API_KEY: z.string().min(1),
    VITE_GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    VITE_UPLOADTHING_URL: z.string().url().optional(),
    VITE_CLOUDINARY_CLOUD_NAME: z.string().min(1),
    VITE_CLOUDINARY_API_KEY: z.string().min(1),
    VITE_CLOUDINARY_API_SECRET: z.string().min(1),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: {
    ...process.env,
    ...import.meta.env,
  },

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
});
