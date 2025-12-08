import { z } from 'zod'
import { requiredStringFor, requiredNumberFor } from '@/lib/utils'

export const salaryComponentListInput = z
  .object({
    search: z.string().optional(),
    type: z.enum(['ADDITION', 'DEDUCTION']).optional(),
    page: z.number().min(1).default(1),
    perPage: z.number().min(1).max(100).default(10),
  })
  .optional()

export const salaryComponentGetInput = z.object({
  id: requiredStringFor('ID komponen gaji'),
})

export const salaryComponentCreateInput = z.object({
  name: requiredStringFor('Nama komponen gaji wajib diisi'),
  description: z.string().optional(),
  type: z.enum(['ADDITION', 'DEDUCTION'], {
    required_error: 'Tipe komponen gaji wajib dipilih',
  }),
  amount: z.number().min(0).optional(),
})

export const salaryComponentUpdateInput = z.object({
  id: requiredStringFor('ID komponen gaji'),
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['ADDITION', 'DEDUCTION']).optional(),
  amount: z.number().min(0).optional(),
})

export const salaryComponentDeleteInput = z.object({
  id: requiredStringFor('ID komponen gaji'),
})

// Inferred types
export type SalaryComponentListInput = z.infer<typeof salaryComponentListInput>
export type SalaryComponentGetInput = z.infer<typeof salaryComponentGetInput>
export type SalaryComponentCreateInput = z.infer<
  typeof salaryComponentCreateInput
>
export type SalaryComponentUpdateInput = z.infer<
  typeof salaryComponentUpdateInput
>
export type SalaryComponentDeleteInput = z.infer<
  typeof salaryComponentDeleteInput
>
