import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '../../init'
import { uploadImageInput } from './validation'
import type { TRPCRouterRecord } from '@trpc/server'
import { uploadToCloudinary } from '@/lib/cloudinary'

export const uploadRouter = {
  /**
   * Upload image to Cloudinary
   */
  uploadImage: protectedProcedure
    .input(uploadImageInput)
    .mutation(async ({ input }): Promise<{ url: string }> => {
      try {
        const url = await uploadToCloudinary(input.file, input.folder)
        return { url }
      } catch (error) {
        console.error('Error uploading image:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Gagal mengunggah gambar',
        })
      }
    }),
} satisfies TRPCRouterRecord
