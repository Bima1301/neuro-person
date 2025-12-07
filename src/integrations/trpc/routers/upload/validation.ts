import { z } from "zod";

/**
 * Input untuk upload image ke Cloudinary
 */
export const uploadImageInput = z.object({
    file: z.string(), // Base64 string
    folder: z.string().optional().default("cico-photos"),
});

export type UploadImageInput = z.infer<typeof uploadImageInput>;

