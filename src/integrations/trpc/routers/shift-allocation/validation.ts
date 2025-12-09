import { z } from 'zod'
import { requiredNumberFor, requiredStringFor } from '@/lib/utils'

export const shiftAllocationListInput = z.object({
  month: requiredNumberFor('Bulan').min(1).max(12),
  year: requiredNumberFor('Tahun').min(2020).max(2100),
})

export const shiftAllocationAssignInput = z.object({
  employeeId: requiredStringFor('Karyawan wajib dipilih'),
  attendanceTypeId: requiredStringFor('Tipe kehadiran wajib dipilih'),
  shiftId: z.string().optional(), // Optional, only required if attendanceType.isMustPresence = true
  date: requiredStringFor('Tanggal wajib diisi'),
})

export const shiftAllocationMassAssignInput = z.object({
  startDate: requiredStringFor('Tanggal mulai wajib diisi'),
  endDate: requiredStringFor('Tanggal selesai wajib diisi'),
  days: z.array(requiredNumberFor('Hari').min(0).max(6)),
  assignments: z.array(
    z.object({
      employeeId: requiredStringFor('Karyawan wajib dipilih'),
      attendanceTypeId: requiredStringFor('Tipe kehadiran wajib dipilih'),
      shiftId: z.string().optional(),
    }),
  ),
})

export const shiftAllocationDeleteInput = z.object({
  id: requiredStringFor('ID alokasi shift'),
})

export const shiftAllocationEmployeeScheduleInput = z.object({
  employeeId: requiredStringFor('Karyawan wajib dipilih'),
  month: requiredNumberFor('Bulan').min(1).max(12),
  year: requiredNumberFor('Tahun').min(2020).max(2100),
  schedules: z
    .array(
      z.object({
        day: requiredNumberFor('Hari').min(0).max(6),
        attendanceTypeId: requiredStringFor('Tipe kehadiran wajib dipilih'),
        shiftId: z.string().optional(),
      }),
    )
    .max(7),
})

export const shiftAllocationGetTodayInput = z.object({
	date: z.string().optional(), // ISO date string YYYY-MM-DD, defaults to today
});

export type ShiftAllocationListInput = z.infer<typeof shiftAllocationListInput>;
export type ShiftAllocationAssignInput = z.infer<
	typeof shiftAllocationAssignInput
>;
export type ShiftAllocationMassAssignInput = z.infer<
	typeof shiftAllocationMassAssignInput
>;
export type ShiftAllocationGetTodayInput = z.infer<
	typeof shiftAllocationGetTodayInput
>;
