import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import z from 'zod'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number | undefined) => {
  if (!amount) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export const requiredStringFor = (fieldName?: string | null) =>
  z
    .string({
      error: (issue) =>
        issue.input === undefined || issue.input === null
          ? fieldName
            ? `${fieldName}`
            : 'Required'
          : undefined,
    })
    .trim()
    .min(1, fieldName ? `${fieldName}` : 'Required')

export const requiredNumberFor = (fieldName?: string | null) =>
  z.number({
    error: (issue) =>
      issue.input === undefined || issue.input === null
        ? fieldName
          ? `${fieldName}`
          : 'Required'
        : undefined,
  })
