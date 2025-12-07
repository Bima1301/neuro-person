import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/employee/cico/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/employee/cico/"!</div>
}
