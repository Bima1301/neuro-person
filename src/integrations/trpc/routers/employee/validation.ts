import { z } from 'zod'
import { requiredStringFor } from '@/lib/utils'

export const employeeListInput = z
  .object({
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    departmentId: z.string().optional(),
    search: z.string().optional(),
    page: z.number().min(1).default(1),
    perPage: z.number().min(1).max(100).default(10),
  })
  .optional()

export const employeeGetInput = z.object({
  id: requiredStringFor('ID karyawan'),
})

export const employeeGetByUserIdInput = z.object({
  userId: requiredStringFor('User ID'),
})

export const employeeMutationInput = z.object({
  id: z.string().optional(),
  employeeId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Email tidak valid').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  avatar: z
    .string()
    .url('Avatar harus berupa URL yang valid')
    .optional()
    .or(z.null()),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  maritalStatus: z
    .enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'])
    .optional(),
  departmentId: z.string().optional().nullable(),
  positionId: z.string().optional().nullable(),
  hireDate: z.string().optional(),
  employmentType: z
    .enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'])
    .optional(),
  baseSalary: z.number().min(0).optional(),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
})

export const employeeCreateInput = employeeMutationInput.extend({
  employeeId: requiredStringFor('NIK/ID Karyawan wajib diisi'),
  email: requiredStringFor('Email wajib diisi').email('Email tidak valid'),
  firstName: requiredStringFor('Nama depan wajib diisi'),
  lastName: requiredStringFor('Nama belakang wajib diisi'),
  hireDate: requiredStringFor('Tanggal bergabung wajib diisi'),
  password: requiredStringFor('Password wajib diisi').min(
    6,
    'Password minimal 6 karakter',
  ),
})

export const employeeUpdateInput = employeeMutationInput

export const employeeDeleteInput = z.object({
  id: requiredStringFor('ID karyawan'),
})

export const employeeInfiniteInput = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  departmentId: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
  cursor: z.string().optional(),
})

export const employeePaginatedInput = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  departmentId: z.string().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(10),
})

export const employeeImportInput = z.object({
  file: requiredStringFor('File wajib diisi'),
  fileName: requiredStringFor('Nama file wajib diisi'),
})

export type EmployeeListInput = z.infer<typeof employeeListInput>
export type EmployeeGetInput = z.infer<typeof employeeGetInput>
export type EmployeeMutationInput = z.infer<typeof employeeMutationInput>
export type EmployeeCreateInput = z.infer<typeof employeeCreateInput>
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateInput>
export type EmployeeDeleteInput = z.infer<typeof employeeDeleteInput>
export type EmployeeImportInput = z.infer<typeof employeeImportInput>
