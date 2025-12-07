import { createFileRoute } from '@tanstack/react-router'
import HomeContainer from '@/components/employee/home/containers'

export const Route = createFileRoute('/employee/')({
  component: EmployeeHomePage,
})

function EmployeeHomePage() {
  return <HomeContainer />
}
