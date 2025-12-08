import { createFileRoute } from '@tanstack/react-router'
import { SalaryComponentContainer } from '@/components/pages/salary-component/containers'

export const Route = createFileRoute('/app/salary-components')({
  component: SalaryComponentPage,
})

function SalaryComponentPage() {
  return <SalaryComponentContainer />
}

