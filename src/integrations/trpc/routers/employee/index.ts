import { TRPCError } from '@trpc/server'
import { read, utils, write } from 'xlsx'
import { protectedProcedure } from '../../init'
import {
  employeeCreateInput,
  employeeDeleteInput,
  employeeGetByUserIdInput,
  employeeGetInput,
  employeeImportInput,
  employeeInfiniteInput,
  employeeListInput,
  employeePaginatedInput,
  employeeUpdateInput,
} from './validation'
import type { TRPCRouterRecord } from '@trpc/server'
import { prisma } from '@/db'
import { auth } from '@/integrations/better-auth/auth'
import { embeddingService } from '@/lib/embedding-service'

export const employeeRouter = {
  list: protectedProcedure
    .input(employeeListInput)
    .query(async ({ input, ctx }) => {
      const page = input?.page ?? 1
      const perPage = input?.perPage ?? 10
      const skip = (page - 1) * perPage

      const where = {
        organizationId: ctx.organizationId,
        status: input?.status,
        departmentId: input?.departmentId,
        ...(input?.search && {
          OR: [
            {
              firstName: {
                contains: input.search,
                mode: 'insensitive' as const,
              },
            },
            {
              lastName: {
                contains: input.search,
                mode: 'insensitive' as const,
              },
            },
            {
              employeeId: {
                contains: input.search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }),
      }

      const [items, total] = await Promise.all([
        prisma.employee.findMany({
          where,
          include: {
            department: true,
            position: true,
            user: { select: { role: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: perPage,
        }),
        prisma.employee.count({ where }),
      ])

      return {
        items,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      }
    }),

  get: protectedProcedure
    .input(employeeGetInput)
    .query(async ({ input, ctx }) => {
      return await prisma.employee.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
        include: {
          department: true,
          position: true,
          user: { select: { email: true, role: true } },
          allowances: { include: { allowanceType: true } },
        },
      })
    }),

  getByUserId: protectedProcedure
    .input(employeeGetByUserIdInput)
    .query(async ({ input, ctx }) => {
      return await prisma.employee.findFirst({
        where: {
          userId: input.userId,
          organizationId: ctx.organizationId,
        },
        include: {
          department: true,
          position: true,
          user: { select: { email: true, role: true } },
          organization: { select: { name: true } },
          allowances: { include: { allowanceType: true } },
        },
      })
    }),

  create: protectedProcedure
    .input(employeeCreateInput)
    .mutation(async ({ input, ctx }) => {
      const {
        id: _id,
        password,
        dateOfBirth,
        hireDate,
        departmentId,
        positionId,
        email,
        firstName,
        lastName,
        employeeId,
        ...employeeData
      } = input

      if (!email) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Email wajib diisi',
        })
      }

      if (!password) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Password wajib diisi',
        })
      }

      if (!firstName || !lastName) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Nama depan dan belakang wajib diisi',
        })
      }

      if (!employeeId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'NIK/ID Karyawan wajib diisi',
        })
      }

      if (!hireDate) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Tanggal masuk wajib diisi',
        })
      }

      // Check if email already exists in Better Auth
      const existingUser = await prisma.user.findFirst({
        where: { email },
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email sudah terdaftar di sistem',
        })
      }

      // Sanitize username: only letters, numbers, - and _
      const sanitizeUsername = (str: string): string => {
        return str
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '_')
          .replace(/_{2,}/g, '_')
          .replace(/^_+|_+$/g, '')
      }

      const username = sanitizeUsername(email.split('@')[0] || employeeId)

      // Create user in Better Auth
      // Better Auth will automatically send email verification
      let authUserId: string
      try {
        const result = await auth.api.signUpEmail({
          body: {
            email,
            password,
            name: `${firstName} ${lastName}`,
          },
        })

        if (!result.user) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Gagal membuat akun di sistem autentikasi',
          })
        }

        authUserId = result.user.id

        // Update user with organizationId and role
        await prisma.user.update({
          where: { id: authUserId },
          data: {
            organizationId: ctx.organizationId,
            role: 'EMPLOYEE' as const,
          },
        })
      } catch (error: unknown) {
        console.error('Error creating Better Auth user:', error)
        const errorMessage =
          error &&
            typeof error === 'object' &&
            'message' in error &&
            typeof (error as { message: string }).message === 'string'
            ? (error as { message: string }).message
            : 'Gagal membuat akun di sistem autentikasi'
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: errorMessage,
        })
      }

      // Create employee and link to user
      const newEmployee = await prisma.employee.create({
        data: {
          ...employeeData,
          employeeId,
          username,
          firstName,
          lastName,
          email,
          organization: { connect: { id: ctx.organizationId } },
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          hireDate: new Date(hireDate),
          ...(departmentId
            ? { department: { connect: { id: departmentId } } }
            : {}),
          ...(positionId ? { position: { connect: { id: positionId } } } : {}),
          user: {
            connect: {
              id: authUserId,
            },
          },
        },
      })

      embeddingService.employee.embedEmployee(newEmployee.id).catch((error) => {
        console.error(
          '⚠️ Warning: Gagal generate embedding untuk employee baru:',
          error,
        )
      })

      return newEmployee
    }),

  update: protectedProcedure
    .input(employeeUpdateInput)
    .mutation(async ({ input, ctx }) => {
      const {
        id,
        departmentId,
        positionId,
        password: _password,
        dateOfBirth,
        hireDate,
        ...data
      } = input

      if (!id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'ID karyawan wajib diisi',
        })
      }

      // Prepare update data - exclude fields that need special handling
      const updateData: {
        [key: string]: unknown
      } = {
        ...data,
        ...(dateOfBirth !== undefined && {
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        }),
        ...(hireDate !== undefined && {
          hireDate: hireDate ? new Date(hireDate) : undefined,
        }),
        ...(departmentId !== undefined && {
          department: departmentId
            ? { connect: { id: departmentId } }
            : { disconnect: true },
        }),
        ...(positionId !== undefined && {
          position: positionId
            ? { connect: { id: positionId } }
            : { disconnect: true },
        }),
        ...(input.avatar !== undefined && {
          avatar: input.avatar === null ? null : input.avatar,
        }),
      }

      const updatedEmployee = await prisma.employee.update({
        where: {
          id,
          organizationId: ctx.organizationId,
        },
        data: updateData,
      })

      embeddingService.employee
        .embedEmployee(updatedEmployee.id)
        .catch((error) => {
          console.error('⚠️ Warning: Gagal update embedding:', error)
        })

      return updatedEmployee
    }),

  delete: protectedProcedure
    .input(employeeDeleteInput)
    .mutation(async ({ input, ctx }) => {
      // Get employee first to get userId
      const employee = await prisma.employee.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
        select: {
          userId: true,
        },
      })

      if (!employee) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Employee not found',
        })
      }

      await embeddingService.employee.deleteEmployeeEmbedding(
        input.id,
        ctx.organizationId,
      )

      // Delete employee (this will cascade to related records)
      await prisma.employee.delete({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
      })

      // Delete user associated with employee (Better Auth user will be deleted via cascade)
      await prisma.user.delete({
        where: {
          id: employee.userId,
        },
      })

      return { success: true }
    }),

  count: protectedProcedure.query(async ({ ctx }) => {
    const [total, active, inactive] = await Promise.all([
      prisma.employee.count({ where: { organizationId: ctx.organizationId } }),
      prisma.employee.count({
        where: { organizationId: ctx.organizationId, status: 'ACTIVE' },
      }),
      prisma.employee.count({
        where: { organizationId: ctx.organizationId, status: 'INACTIVE' },
      }),
    ])
    return { total, active, inactive }
  }),

  infinite: protectedProcedure
    .input(employeeInfiniteInput)
    .query(async ({ input, ctx }) => {
      const { limit, cursor, status, departmentId, search } = input

      const items = await prisma.employee.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          organizationId: ctx.organizationId,
          status,
          departmentId,
          ...(search && {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { employeeId: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        include: {
          department: true,
          position: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      let nextCursor: string | undefined
      if (items.length > limit) {
        const nextItem = items.pop()
        nextCursor = nextItem?.id
      }

      return {
        items,
        nextCursor,
      }
    }),

  paginated: protectedProcedure
    .input(employeePaginatedInput)
    .query(async ({ input, ctx }) => {
      const { page, perPage, status, departmentId, search } = input
      const skip = (page - 1) * perPage

      const where = {
        organizationId: ctx.organizationId,
        status,
        departmentId,
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { employeeId: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      }

      const [items, total] = await Promise.all([
        prisma.employee.findMany({
          where,
          skip,
          take: perPage,
          include: {
            department: true,
            position: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.employee.count({ where }),
      ])

      return {
        items,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      }
    }),

  import: protectedProcedure
    .input(employeeImportInput)
    .mutation(async ({ input, ctx }) => {
      // Decode base64 file
      const base64Data = input.file.split(',')[1] || input.file
      const buffer = Buffer.from(base64Data, 'base64')

      // Parse Excel file
      const workbook = read(buffer, { type: 'buffer' })

      // Get employee data from "Karyawan" sheet (or first sheet if not found)
      const employeeSheetName =
        workbook.SheetNames.find((name) =>
          name.toLowerCase().includes('karyawan'),
        ) || workbook.SheetNames[0]
      const employeeWorksheet = workbook.Sheets[employeeSheetName]
      const employeeData = utils.sheet_to_json(employeeWorksheet) as Array<{
        'NIK/ID Karyawan'?: string
        NIK?: string
        'Nama Depan'?: string
        'First Name'?: string
        'Nama Belakang'?: string
        'Last Name'?: string
        Email?: string
        Telepon?: string
        Phone?: string
        'Department ID'?: string
        DepartmentID?: string
        DepartmentId?: string
        'Position ID'?: string
        PositionID?: string
        PositionId?: string
        'Tanggal Masuk'?: string
        'Hire Date'?: string
        'Gaji Pokok'?: number
        'Base Salary'?: number
        Status?: string
        [key: string]: unknown
      }>

      // Get department sheet data if exists
      const departmentSheetName = workbook.SheetNames.find((name) =>
        name.toLowerCase().includes('department'),
      )
      const departmentData = (
        departmentSheetName
          ? utils.sheet_to_json(workbook.Sheets[departmentSheetName])
          : []
      ) as Array<{
        ID?: string
        Id?: string
        Nama?: string
        Name?: string
        [key: string]: unknown
      }>

      // Get position sheet data if exists
      const positionSheetName = workbook.SheetNames.find((name) =>
        name.toLowerCase().includes('position'),
      )
      const positionData = (
        positionSheetName
          ? utils.sheet_to_json(workbook.Sheets[positionSheetName])
          : []
      ) as Array<{
        ID?: string
        Nama?: string
        'Department ID'?: string
        [key: string]: unknown
      }>

      const results: Array<{
        row: number
        employeeId: string
        name: string
        status: 'success' | 'error'
        message: string
      }> = []

      // Get existing departments and positions
      const existingDepartments = await prisma.department.findMany({
        where: { organizationId: ctx.organizationId },
      })
      const existingPositions = await prisma.position.findMany({
        where: { organizationId: ctx.organizationId },
      })

      // Create maps for quick lookup
      const deptMap = new Map(existingDepartments.map((d) => [d.id, d]))
      const deptNameMap = new Map(
        existingDepartments.map((d) => [d.name.toLowerCase(), d]),
      )
      const posMap = new Map(existingPositions.map((p) => [p.id, p]))
      const posNameMap = new Map(
        existingPositions.map((p) => [p.name.toLowerCase(), p]),
      )

      // Process Department sheet - create new departments
      for (const row of departmentData) {
        const deptId = String(row.ID || row.Id || '').trim()
        const deptName = String(row.Nama || row.Name || '').trim()

        if (!deptId || !deptName) continue

        // Skip if department already exists by ID or name
        if (deptMap.has(deptId) || deptNameMap.has(deptName.toLowerCase())) {
          continue
        }

        try {
          const newDept = await prisma.department.create({
            data: {
              id: deptId,
              name: deptName,
              organizationId: ctx.organizationId,
            },
          })
          deptMap.set(newDept.id, newDept)
          deptNameMap.set(newDept.name.toLowerCase(), newDept)
        } catch (error) {
          console.error(`Error creating department ${deptName}:`, error)
        }
      }

      // Process Position sheet - create new positions
      for (const row of positionData) {
        const posId = String(row.ID || '').trim()
        const posName = String(row.Nama || '').trim()
        const deptId = String(row['Department ID'] || '').trim()

        if (!posId || !posName || !deptId) continue

        // Check if department exists
        if (!deptMap.has(deptId)) {
          console.error(
            `Department ${deptId} not found for position ${posName}`,
          )
          continue
        }

        // Skip if position already exists by ID or name
        if (posMap.has(posId) || posNameMap.has(posName.toLowerCase())) {
          continue
        }

        try {
          const newPos = await prisma.position.create({
            data: {
              id: posId,
              name: posName,
              departmentId: deptId,
              organizationId: ctx.organizationId,
            },
          })
          posMap.set(newPos.id, newPos)
          posNameMap.set(newPos.name.toLowerCase(), newPos)
        } catch (error) {
          console.error(`Error creating position ${posName}:`, error)
        }
      }

      // Process employee data
      for (let i = 0; i < employeeData.length; i++) {
        const row = employeeData[i]
        const rowNum = i + 2 // +2 because Excel is 1-indexed and has header

        let employeeId = ''
        let firstName = ''
        let lastName = ''
        let email = ''
        let name = '-'

        try {
          // Map Excel columns to employee fields
          employeeId = String(row['NIK/ID Karyawan'] || row.NIK || '').trim()
          firstName = String(
            row['Nama Depan'] || row['First Name'] || '',
          ).trim()
          lastName = String(
            row['Nama Belakang'] || row['Last Name'] || '',
          ).trim()
          email = String(row.Email || '').trim()
          const password = String(row.Password || '').trim()
          const phone = String(row.Telepon || row.Phone || '').trim()
          const departmentId = String(
            row['Department ID'] || row.DepartmentID || row.DepartmentId || '',
          ).trim()
          const positionId = String(
            row['Position ID'] || row.PositionID || row.PositionId || '',
          ).trim()
          const hireDate = String(
            row['Tanggal Masuk'] || row['Hire Date'] || '',
          ).trim()
          const baseSalary = row['Gaji Pokok'] || row['Base Salary'] || 0
          const status = String(row.Status || 'ACTIVE')
            .trim()
            .toUpperCase()

          name = `${firstName} ${lastName}`.trim()

          if (!employeeId || !firstName || !lastName || !email) {
            results.push({
              row: rowNum,
              employeeId: employeeId || '-',
              name: name || '-',
              status: 'error',
              message: 'NIK, Nama Depan, Nama Belakang, dan Email wajib diisi',
            })
            continue
          }

          // Validate department ID if provided
          if (departmentId && !deptMap.has(departmentId)) {
            results.push({
              row: rowNum,
              employeeId,
              name,
              status: 'error',
              message: `Department ID "${departmentId}" tidak ditemukan`,
            })
            continue
          }

          // Validate position ID if provided
          if (positionId && !posMap.has(positionId)) {
            results.push({
              row: rowNum,
              employeeId,
              name,
              status: 'error',
              message: `Position ID "${positionId}" tidak ditemukan`,
            })
            continue
          }

          // Check if employee already exists by employeeId
          const existingByEmployeeId = await prisma.employee.findFirst({
            where: {
              employeeId,
              organizationId: ctx.organizationId,
            },
          })

          if (existingByEmployeeId) {
            results.push({
              row: rowNum,
              employeeId,
              name,
              status: 'error',
              message: `Karyawan dengan NIK ${employeeId} sudah ada`,
            })
            continue
          }

          // Check if email already exists in the organization
          const existingByEmail = await prisma.user.findFirst({
            where: {
              email,
              organizationId: ctx.organizationId,
            },
          })

          if (existingByEmail) {
            results.push({
              row: rowNum,
              employeeId,
              name,
              status: 'error',
              message: `Email ${email} sudah digunakan di organisasi ini`,
            })
            continue
          }

          // Check if email already exists in Better Auth
          const existingAuthUser = await prisma.user.findFirst({
            where: { email },
          })

          if (existingAuthUser) {
            results.push({
              row: rowNum,
              employeeId,
              name,
              status: 'error',
              message: `Email ${email} sudah terdaftar di sistem autentikasi`,
            })
            continue
          }

          // Use password from Excel if provided, otherwise generate temporary password
          const tempPassword = password || `Temp${employeeId}${Date.now()}`.substring(0, 20)

          // Sanitize username
          const sanitizeUsername = (str: string): string => {
            return str
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, '_')
              .replace(/_{2,}/g, '_')
              .replace(/^_+|_+$/g, '')
          }

          const username = sanitizeUsername(email.split('@')[0] || employeeId)

          // Create user in Better Auth
          let authUserId: string
          try {
            const result = await auth.api.signUpEmail({
              body: {
                email,
                password: tempPassword,
                name: `${firstName} ${lastName}`,
              },
            })

            if (!result.user) {
              throw new Error('Gagal membuat akun di sistem autentikasi')
            }

            authUserId = result.user.id

            // Update user with organizationId and role
            await prisma.user.update({
              where: { id: authUserId },
              data: {
                organizationId: ctx.organizationId,
                role: 'EMPLOYEE' as const,
              },
            })
          } catch (error: unknown) {
            console.error(
              'Error creating Better Auth user during import:',
              error,
            )
            const errorMessage =
              error &&
                typeof error === 'object' &&
                'message' in error &&
                typeof (error as { message: string }).message === 'string'
                ? (error as { message: string }).message
                : 'Gagal membuat akun di sistem autentikasi'
            results.push({
              row: rowNum,
              employeeId,
              name,
              status: 'error',
              message: errorMessage,
            })
            continue
          }

          await prisma.employee.create({
            data: {
              employeeId,
              username,
              firstName,
              lastName,
              email,
              phone: phone || null,
              organization: { connect: { id: ctx.organizationId } },
              hireDate: hireDate ? new Date(hireDate) : new Date(),
              baseSalary: typeof baseSalary === 'number' ? baseSalary : 0,
              status:
                status === 'ACTIVE' || status === 'INACTIVE'
                  ? status
                  : 'ACTIVE',
              ...(departmentId &&
                deptMap.has(departmentId) && {
                department: { connect: { id: departmentId } },
              }),
              ...(positionId &&
                posMap.has(positionId) && {
                position: { connect: { id: positionId } },
              }),
              user: {
                connect: {
                  id: authUserId,
                },
              },
            },
          })

          results.push({
            row: rowNum,
            employeeId,
            name,
            status: 'success',
            message: 'Berhasil',
          })
        } catch (error) {
          if (name === '-' && (firstName || lastName)) {
            name = `${firstName} ${lastName}`.trim() || '-'
          }

          results.push({
            row: rowNum,
            employeeId: employeeId || '-',
            name: name || '-',
            status: 'error',
            message:
              error instanceof Error ? error.message : 'Error tidak diketahui',
          })
        }
      }

      const success = results.filter((r) => r.status === 'success').length

      const successfulEmployeeIds = results
        .filter((r) => r.status === 'success')
        .map((r) => r.employeeId)

      if (successfulEmployeeIds.length > 0) {
        prisma.employee
          .findMany({
            where: {
              employeeId: { in: successfulEmployeeIds },
              organizationId: ctx.organizationId,
            },
            select: { id: true },
          })
          .then((employees) => {
            return embeddingService.employee.bulkEmbedEmployees(
              employees.map((e) => e.id),
              (current, total) => {
                console.log(`Meng-embed karyawan ${current} dari ${total}`)
              },
            )
          })
          .catch((error) => {
            console.error(
              '⚠️ Warning: Gagal bulk embed imported employees:',
              error,
            )
          })
      }

      return { success, total: results.length, results }
    }),

  downloadTemplate: protectedProcedure.mutation(async ({ ctx }) => {
    // Get all departments and positions
    let departments = await prisma.department.findMany({
      where: { organizationId: ctx.organizationId },
    })
    let positions = await prisma.position.findMany({
      where: { organizationId: ctx.organizationId },
      include: { department: true },
    })

    // Create dummy data if empty
    if (departments.length === 0) {
      departments = [
        { id: 'DEPT-DUMMY-001', name: 'Human Resources' },
        { id: 'DEPT-DUMMY-002', name: 'Finance' },
        { id: 'DEPT-DUMMY-003', name: 'IT' },
      ] as Array<any>
    }

    if (positions.length === 0) {
      positions = [
        {
          id: 'POS-DUMMY-001',
          name: 'HR Manager',
          departmentId: departments[0].id,
          department: { id: departments[0].id, name: departments[0].name }
        },
        {
          id: 'POS-DUMMY-002',
          name: 'Accountant',
          departmentId: departments[1].id,
          department: { id: departments[1].id, name: departments[1].name }
        },
        {
          id: 'POS-DUMMY-003',
          name: 'Software Developer',
          departmentId: departments[2].id,
          department: { id: departments[2].id, name: departments[2].name }
        },
      ] as Array<any>
    }

    // Create workbook
    const workbook = utils.book_new()

    // Sheet 1: Karyawan (using IDs)
    const sampleData = [
      {
        'NIK/ID Karyawan': 'EMP001',
        'Nama Depan': 'John',
        'Nama Belakang': 'Doe',
        Email: 'john.doe@example.com',
        Password: 'password',
        Telepon: '081234567890',
        'Department ID': departments[0]?.id || '',
        'Position ID': positions[0]?.id || '',
        'Tanggal Masuk': '2024-01-01',
        'Gaji Pokok': 5000000,
        Status: 'ACTIVE',
      },
      {
        'NIK/ID Karyawan': 'EMP002',
        'Nama Depan': 'Jane',
        'Nama Belakang': 'Smith',
        Email: 'jane.smith@example.com',
        Password: 'password',
        Telepon: '081234567891',
        'Department ID': departments[0]?.id || '',
        'Position ID': positions[0]?.id || '',
        'Tanggal Masuk': '2024-01-15',
        'Gaji Pokok': 7500000,
        Status: 'ACTIVE',
      },
    ]

    const employeeSheet = utils.json_to_sheet(sampleData)
    employeeSheet['!cols'] = [
      { wch: 15 }, // NIK/ID Karyawan
      { wch: 15 }, // Nama Depan
      { wch: 15 }, // Nama Belakang
      { wch: 25 }, // Email
      { wch: 15 }, // Password
      { wch: 15 }, // Telepon
      { wch: 30 }, // Department ID
      { wch: 30 }, // Position ID
      { wch: 15 }, // Tanggal Masuk
      { wch: 15 }, // Gaji Pokok
      { wch: 10 }, // Status
    ]
    utils.book_append_sheet(workbook, employeeSheet, 'Karyawan')

    // Sheet 2: Department Reference
    const deptData = departments.map((d) => ({
      ID: d.id,
      Nama: d.name,
    }))
    const deptSheet = utils.json_to_sheet(deptData)
    deptSheet['!cols'] = [{ wch: 30 }, { wch: 20 }]
    utils.book_append_sheet(workbook, deptSheet, 'Department')

    // Sheet 3: Position Reference (WITH DEPARTMENT ID)
    const posData = positions.map((p) => ({
      ID: p.id,
      Nama: p.name,
      'Department ID': p.departmentId,
    }))
    const posSheet = utils.json_to_sheet(posData)
    posSheet['!cols'] = [
      { wch: 30 }, // ID
      { wch: 20 }, // Nama
      { wch: 30 }, // Department ID
    ]
    utils.book_append_sheet(workbook, posSheet, 'Position')

    // Convert to buffer
    const buffer = write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Convert to base64 for tRPC
    const base64 = buffer.toString('base64')
    return base64
  }),
} satisfies TRPCRouterRecord

export * from './validation'
export * from './types'
