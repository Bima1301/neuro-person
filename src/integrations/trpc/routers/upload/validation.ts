import { z } from "zod";
import { requiredStringFor } from '@/lib/utils'

export const uploadImageInput = z.object({
  file: requiredStringFor('File wajib diisi'),
  folder: z.string().optional().default('cico-photos'),
})

export type UploadImageInput = z.infer<typeof uploadImageInput>;

