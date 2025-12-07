import { createFileRoute } from '@tanstack/react-router'
import ProfileContainer from '@/components/employee/profile/containers'

export const Route = createFileRoute('/employee/profile')({
  component: EmployeeProfilePage,
})

function EmployeeProfilePage() {
  return <ProfileContainer />
}
