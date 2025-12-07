import { z } from 'zod'
import { requiredStringFor } from '@/lib/utils'

export const permissionListInput = z
  .object({
    employeeId: z.string().optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
    search: z.string().optional(),
    month: z.string().optional(),
    year: z.string().optional(),
    page: z.number().min(1).default(1),
    perPage: z.number().min(1).max(100).default(10),
  })
  .optional()

export const permissionGetInput = z.object({
  id: requiredStringFor('ID perizinan'),
})

export const permissionCreateInput = z.object({
  employeeId: requiredStringFor('Karyawan wajib dipilih'),
  attendanceTypeId: requiredStringFor('Tipe perizinan wajib dipilih'),
  startDate: requiredStringFor('Tanggal awal wajib diisi'),
  endDate: requiredStringFor('Tanggal selesai wajib diisi'),
  reason: z.string().optional(),
})

export const permissionApproveInput = z.object({
  id: requiredStringFor('ID perizinan'),
  approvedById: requiredStringFor('ID approver'),
})

export const permissionInfiniteInput = z
  .object({
    employeeId: z.string().optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
    search: z.string().optional(),
    month: z.string().optional(),
    year: z.string().optional(),
    limit: z.number().min(1).max(50).default(10),
    cursor: z.string().optional(),
  })
  .optional()

export const permissionRejectInput = z.object({
  id: requiredStringFor('ID perizinan'),
  reason: z.string().optional(),
})

// Inferred types
export type PermissionListInput = z.infer<typeof permissionListInput>
export type PermissionInfiniteInput = z.infer<typeof permissionInfiniteInput>
export type PermissionGetInput = z.infer<typeof permissionGetInput>
export type PermissionCreateInput = z.infer<typeof permissionCreateInput>
export type PermissionApproveInput = z.infer<typeof permissionApproveInput>
export type PermissionRejectInput = z.infer<typeof permissionRejectInput>
