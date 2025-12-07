import { z } from "zod";
import { requiredStringFor } from '@/lib/utils'

/**
 * Input untuk upload image ke Cloudinary
 */
export const uploadImageInput = z.object({
  file: requiredStringFor('File wajib diisi'), // Base64 string
  folder: z.string().optional().default('cico-photos'),
})

export type UploadImageInput = z.infer<typeof uploadImageInput>;

