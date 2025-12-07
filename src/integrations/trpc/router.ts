import { createTRPCRouter } from "./init";
import { attendanceTypeRouter } from "./routers/attendance-type";
import { dashboardRouter } from "./routers/dashboard";
import { departmentRouter } from "./routers/department";
import { organizationRouter } from "./routers/organization";
import { positionRouter } from "./routers/position";
import { shiftRouter } from "./routers/shift";
import { uploadRouter } from "./routers/upload";

export const trpcRouter = createTRPCRouter({
  upload: uploadRouter,
  dashboard: dashboardRouter,
  organization: organizationRouter,

  //MASTER DATA
  department: departmentRouter,
  position: positionRouter,
  shift: shiftRouter,
  attendanceType: attendanceTypeRouter,
});

export type TRPCRouter = typeof trpcRouter;
