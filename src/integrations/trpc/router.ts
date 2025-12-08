import { createTRPCRouter } from './init'
import { attendanceTypeRouter } from './routers/attendance-type'
import { dashboardRouter } from './routers/dashboard'
import { departmentRouter } from './routers/department'
import { organizationRouter } from './routers/organization'
import { positionRouter } from './routers/position'
import { shiftRouter } from './routers/shift'
import { uploadRouter } from './routers/upload'
import { employeeRouter } from './routers/employee'
import { shiftAllocationRouter } from './routers/shift-allocation'
import { attendanceRouter } from './routers/attendance'
import { permissionRouter } from './routers/permission'
import { payrollRouter } from './routers/payroll'
import { leaveRouter } from './routers/leave'
import { chatRouter } from './routers/chat-bot'
import { salaryComponentRouter } from './routers/salary-component'

export const trpcRouter = createTRPCRouter({
  upload: uploadRouter,
  dashboard: dashboardRouter,
  organization: organizationRouter,

  //MASTER DATA
  department: departmentRouter,
  position: positionRouter,
  shift: shiftRouter,
  attendanceType: attendanceTypeRouter,
  salaryComponent: salaryComponentRouter,

  //MAIN MENU
  employee: employeeRouter,
  shiftAllocation: shiftAllocationRouter,
  attendance: attendanceRouter,
  permission: permissionRouter,
  payroll: payrollRouter,
  leave: leaveRouter,
  chatBot: chatRouter,
})

export type TRPCRouter = typeof trpcRouter
