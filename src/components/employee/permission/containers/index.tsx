import { useState } from 'react'
import Header from '../sections/header'
import PermissionList from '../sections/permission-list'
import type { PermissionStatus } from '@/generated/prisma/enums'

export default function PermissionContainer() {
  const [filter, setFilter] = useState<{
    search: string
    status: PermissionStatus | undefined
    month?: string
    year?: string
  }>({
    search: '',
    status: undefined,
    month: new Date().getMonth().toString(),
    year: new Date().getFullYear().toString(),
  })

  return (
    <div className="flex flex-col min-h-full">
      <Header filter={filter} setFilter={setFilter} />
      <PermissionList filter={filter} setFilter={setFilter} />
    </div>
  )
}
