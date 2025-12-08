import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Eye, EyeOff, Upload, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type {
  EmployeeCreateInput,
  EmployeeMutationInput,
} from '@/integrations/trpc/routers/employee/validation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { InputMask } from '@/components/ui/input-mask'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmployeeStatus, Gender, MaritalStatus } from '@/generated/prisma/enums'
import { useTRPC } from '@/integrations/trpc/react'
import {
  employeeCreateInput,
  employeeMutationInput,
} from '@/integrations/trpc/routers/employee/validation'
import { cn } from '@/lib/utils'
import {
  SelectEmptyState,
  SelectEmptyStateWithAdd,
} from '@/components/shared/select-empty-state'

interface EmployeeFormProps {
  mode: 'create' | 'edit'
  onSubmit: (data: EmployeeCreateInput | EmployeeMutationInput) => void
  onCancel: () => void
  isPending?: boolean
  defaultValues?: Partial<EmployeeMutationInput>
  totalEmployees: number
  darkMode?: boolean
}

export function EmployeeForm({
  mode,
  onSubmit,
  onCancel,
  isPending,
  defaultValues,
  totalEmployees,
  darkMode = false,
}: EmployeeFormProps) {
  const trpc = useTRPC()
  const [showPassword, setShowPassword] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    defaultValues?.avatar || null,
  )
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const { data: deptData } = useQuery(trpc.department.list.queryOptions())
  const { data: posData } = useQuery(trpc.position.list.queryOptions())
  const departments = deptData?.items || []
  const positions = posData?.items || []

  const uploadAvatarMutation = useMutation(
    trpc.upload.uploadImage.mutationOptions(),
  )

  const form = useForm<EmployeeCreateInput | EmployeeMutationInput>({
    resolver: zodResolver(
      mode === 'create' ? employeeCreateInput : employeeMutationInput,
    ),
    defaultValues,
  })

  const selectedPositionId = form.watch('positionId')
  const selectedPosition = positions.find((p) => p.id === selectedPositionId)

  useEffect(() => {
    form.setValue(
      'employeeId',
      `EMP-${String(totalEmployees + 1).padStart(4, '0')}`,
    )
  }, [totalEmployees])

  // Auto-populate baseSalary when position is selected
  useEffect(() => {
    if (
      selectedPosition &&
      selectedPosition.baseSalary &&
      selectedPosition.baseSalary > 0
    ) {
      form.setValue('baseSalary', selectedPosition.baseSalary)
    }
  }, [selectedPosition, form])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }

    // Simpan file untuk upload saat submit
    setAvatarFile(file)

    // Create preview saja, tidak upload
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setAvatarPreview(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(defaultValues?.avatar || null)
    form.setValue('avatar', defaultValues?.avatar || null)
  }

  const getInitials = () => {
    const firstName = form.watch('firstName') || ''
    const lastName = form.watch('lastName') || ''
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
  }

  // Dark mode styling helpers
  const inputClassName = darkMode
    ? 'bg-[#252932] border-white/10 text-white placeholder:text-white/40 focus-visible:ring-cyan-500/50'
    : ''
  const labelClassName = darkMode ? 'text-white' : ''
  const selectClassName = darkMode
    ? 'bg-[#252932] border-white/10 text-white [&>span]:text-white/60'
    : ''

  const handleFormSubmit = async (
    data: EmployeeCreateInput | EmployeeMutationInput,
  ) => {
    // Jika ada file avatar baru, upload dulu
    if (avatarFile) {
      setIsUploadingAvatar(true)
      try {
        // Convert file to base64
        const reader = new FileReader()
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            resolve(reader.result as string)
          }
          reader.onerror = reject
          reader.readAsDataURL(avatarFile)
        })

        // Upload to Cloudinary
        const uploadResult = await uploadAvatarMutation.mutateAsync({
          file: base64,
          folder: 'employee-avatars',
        })

        // Set avatar URL ke form data
        data.avatar = uploadResult.url
        setIsUploadingAvatar(false)
      } catch (error) {
        setIsUploadingAvatar(false)
        toast.error(
          `Gagal mengunggah avatar: ${error instanceof Error ? error.message : 'Error tidak diketahui'
          }`,
        )
        return // Stop submission if upload fails
      }
    }

    // Submit form dengan data lengkap
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        {/* Avatar Upload Section */}
        <FormField
          control={form.control}
          name="avatar"
          render={() => (
            <FormItem>
              <FormLabel className={labelClassName}>Avatar</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <Avatar
                    className={cn('h-20 w-20', darkMode ? 'bg-gray-500!' : '')}
                  >
                    <AvatarImage
                      src={avatarPreview || undefined}
                      className={darkMode ? 'bg-gray-500!' : ''}
                    />
                    <AvatarFallback className={darkMode ? 'text-gray-900' : ''}>
                      {getInitials() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="avatar-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer"
                        asChild
                      >
                        <span className={darkMode ? 'text-gray-900' : ''}>
                          <Upload
                            className={cn(
                              'mr-2 h-4 w-4',
                              darkMode ? 'text-gray-900' : '',
                            )}
                          />
                          Unggah Avatar
                        </span>
                      </Button>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveAvatar}
                        disabled={isUploadingAvatar}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Hapus
                      </Button>
                    )}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-4">
          {/* Create-only fields */}
          {mode === 'create' && (
            <>
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClassName}>
                      NIK/ID Karyawan *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="EMP001"
                        className={inputClassName}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClassName}>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@company.com"
                        className={inputClassName}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClassName}>
                  Nama Depan {mode === 'create' && '*'}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="John"
                    className={inputClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClassName}>
                  Nama Belakang {mode === 'create' && '*'}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Doe"
                    className={inputClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. Telepon</FormLabel>
                <FormControl>
                  <InputMask
                    inputType="phone"
                    placeholder="+62"
                    {...field}
                    onChange={(_e, rawValue) => field.onChange(rawValue)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClassName}>Tanggal Lahir</FormLabel>
                <FormControl>
                  <Input type="date" className={inputClassName} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClassName}>Jenis Kelamin</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={selectClassName}>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    className={
                      darkMode ? 'bg-[#252932] border-white/10 text-white' : ''
                    }
                  >
                    <SelectItem
                      value={Gender.MALE}
                      className={darkMode ? 'text-white focus:bg-white/10' : ''}
                    >
                      Laki-laki
                    </SelectItem>
                    <SelectItem
                      value={Gender.FEMALE}
                      className={darkMode ? 'text-white focus:bg-white/10' : ''}
                    >
                      Perempuan
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maritalStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClassName}>
                  Status Perkawinan
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={selectClassName}>
                      <SelectValue placeholder="Pilih status perkawinan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    className={
                      darkMode ? 'bg-[#252932] border-white/10 text-white' : ''
                    }
                  >
                    <SelectItem
                      value={MaritalStatus.SINGLE}
                      className={darkMode ? 'text-white focus:bg-white/10' : ''}
                    >
                      Belum Menikah
                    </SelectItem>
                    <SelectItem
                      value={MaritalStatus.MARRIED}
                      className={darkMode ? 'text-white focus:bg-white/10' : ''}
                    >
                      Menikah
                    </SelectItem>
                    <SelectItem
                      value={MaritalStatus.DIVORCED}
                      className={darkMode ? 'text-white focus:bg-white/10' : ''}
                    >
                      Cerai
                    </SelectItem>
                    <SelectItem
                      value={MaritalStatus.WIDOWED}
                      className={darkMode ? 'text-white focus:bg-white/10' : ''}
                    >
                      Janda/Duda
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {mode === 'create' && (
            <FormField
              control={form.control}
              name="hireDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClassName}>
                    Tanggal Bergabung *
                  </FormLabel>
                  <FormControl>
                    <Input type="date" className={inputClassName} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {mode === 'edit' && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClassName}>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={selectClassName}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      className={
                        darkMode
                          ? 'bg-[#252932] border-white/10 text-white'
                          : ''
                      }
                    >
                      <SelectItem
                        value={EmployeeStatus.ACTIVE}
                        className={
                          darkMode ? 'text-white focus:bg-white/10' : ''
                        }
                      >
                        Active
                      </SelectItem>
                      <SelectItem
                        value={EmployeeStatus.INACTIVE}
                        className={
                          darkMode ? 'text-white focus:bg-white/10' : ''
                        }
                      >
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="departmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClassName}>Departemen</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === '' ? null : value)
                  }
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger className={selectClassName}>
                      <SelectValue placeholder="Pilih departemen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    className={
                      darkMode ? 'bg-[#252932] border-white/10 text-white' : ''
                    }
                  >
                    {departments.length === 0 ? (
                      <SelectEmptyState
                        message="Belum ada departemen"
                        createButtonLabel="Buat Departemen"
                        createRoute="/app/departments"
                      />
                    ) : (
                      <>
                        {departments.map((dept) => (
                          <SelectItem
                            key={dept.id}
                            value={dept.id}
                            className={
                              darkMode ? 'text-white focus:bg-white/10' : ''
                            }
                          >
                            {dept.name}
                          </SelectItem>
                        ))}
                        <SelectEmptyStateWithAdd
                          message=""
                          createButtonLabel="Buat Departemen Baru"
                          createRoute="/app/departments"
                          items={departments}
                        />
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="positionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClassName}>Posisi</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === '' ? null : value)
                  }
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger className={selectClassName}>
                      <SelectValue placeholder="Pilih posisi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    className={
                      darkMode ? 'bg-[#252932] border-white/10 text-white' : ''
                    }
                  >
                    {positions.length === 0 ? (
                      <SelectEmptyState
                        message="Belum ada posisi"
                        createButtonLabel="Buat Posisi"
                        createRoute="/app/positions"
                      />
                    ) : (
                      <>
                        {positions.map((pos) => (
                          <SelectItem
                            key={pos.id}
                            value={pos.id}
                            className={
                              darkMode ? 'text-white focus:bg-white/10' : ''
                            }
                          >
                            {pos.name}
                            {pos.baseSalary && pos.baseSalary > 0 && (
                              <span
                                className={`ml-2 ${darkMode
                                  ? 'text-white/60'
                                  : 'text-muted-foreground'
                                  }`}
                              >
                                (Rp {pos.baseSalary.toLocaleString('id-ID')})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                        <SelectEmptyStateWithAdd
                          message=""
                          createButtonLabel="Buat Posisi Baru"
                          createRoute="/app/positions"
                          items={positions}
                        />
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {mode === 'create' && (
            <FormField
              control={form.control}
              name="employmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClassName}>
                    Tipe Karyawan
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={selectClassName}>
                        <SelectValue placeholder="Pilih tipe karyawan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FULL_TIME">Full Time</SelectItem>
                      <SelectItem value="PART_TIME">Part Time</SelectItem>
                      <SelectItem value="CONTRACT">Kontrak</SelectItem>
                      <SelectItem value="INTERN">Magang</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="baseSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClassName}>Gaji Pokok</FormLabel>
                <FormControl>
                  <InputMask
                    inputType="currency"
                    placeholder="Rp 0"
                    className={inputClassName}
                    {...field}
                    onChange={(_e, rawValue) => field.onChange(rawValue)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClassName}>Alamat</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Alamat"
                    className={inputClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClassName}>Kota</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Kota"
                    className={inputClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {mode === 'create' && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className={labelClassName}>Password *</FormLabel>
                  <FormControl>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimal 6 karakter"
                      className={inputClassName}
                      {...field}
                      suffixIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending || isUploadingAvatar}
            className={
              darkMode ? 'border-white/10 text-gray-900 hover:bg-white/10' : ''
            }
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isPending || isUploadingAvatar}
            className={
              darkMode
                ? 'bg-[#252932] text-white hover:bg-[#2d3239] border-0'
                : ''
            }
          >
            {isUploadingAvatar
              ? 'Mengunggah avatar...'
              : isPending
                ? 'Menyimpan...'
                : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
