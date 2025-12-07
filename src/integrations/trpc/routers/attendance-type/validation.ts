import { z } from 'zod'
import { requiredStringFor } from '@/lib/utils'

export const attendanceTypeListInput = z
  .object({
    search: z.string().optional(),
    page: z.number().min(1).default(1),
    perPage: z.number().min(1).max(100).default(10),
  })
  .optional()

export const attendanceTypeGetInput = z.object({
  id: requiredStringFor('ID tipe kehadiran'),
})

export const attendanceTypeCreateInput = z.object({
  name: requiredStringFor('Nama tipe kehadiran wajib diisi'),
  code: z.string().optional(),
  isMustPresence: z.boolean(),
})

export const attendanceTypeUpdateInput = z.object({
  id: requiredStringFor('ID tipe kehadiran'),
  name: z.string().optional(),
  code: z.string().optional(),
  isMustPresence: z.boolean().optional(),
})

export const attendanceTypeDeleteInput = z.object({
  id: requiredStringFor('ID tipe kehadiran'),
})

// Inferred types
export type AttendanceTypeListInput = z.infer<typeof attendanceTypeListInput>
export type AttendanceTypeGetInput = z.infer<typeof attendanceTypeGetInput>
export type AttendanceTypeCreateInput = z.infer<
  typeof attendanceTypeCreateInput
>
export type AttendanceTypeUpdateInput = z.infer<
  typeof attendanceTypeUpdateInput
>
export type AttendanceTypeDeleteInput = z.infer<
  typeof attendanceTypeDeleteInput
>
