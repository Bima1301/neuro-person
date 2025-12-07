import { z } from 'zod'
import {
  LocationPresenceType,
  ShiftPresenceType,
} from '@/generated/prisma/enums'
import { requiredStringFor } from '@/lib/utils'

export const positionListInput = z
  .object({
    departmentId: z.string().optional(),
    search: z.string().optional(),
    page: z.number().min(1).default(1),
    perPage: z.number().min(1).max(100).default(10),
  })
  .optional()

export const positionGetInput = z.object({
  id: requiredStringFor('ID posisi'),
})

export const positionCreateInput = z.object({
  name: requiredStringFor('Nama posisi wajib diisi'),
  description: z.string().optional(),
  departmentId: requiredStringFor('Departemen wajib dipilih'),
  baseSalary: z.number().optional(),
  shiftPresenceType: z.enum(ShiftPresenceType).optional(),
  locationPresenceType: z.enum(LocationPresenceType).optional(),
})

export const positionUpdateInput = z.object({
  id: requiredStringFor('ID posisi'),
  name: z.string().optional(),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  baseSalary: z.number().optional(),
  shiftPresenceType: z.enum(ShiftPresenceType).optional(),
  locationPresenceType: z.enum(LocationPresenceType).optional(),
})

export const positionDeleteInput = z.object({
  id: requiredStringFor('ID posisi'),
})

// Inferred types
export type PositionListInput = z.infer<typeof positionListInput>
export type PositionGetInput = z.infer<typeof positionGetInput>
export type PositionCreateInput = z.infer<typeof positionCreateInput>
export type PositionUpdateInput = z.infer<typeof positionUpdateInput>
export type PositionDeleteInput = z.infer<typeof positionDeleteInput>
