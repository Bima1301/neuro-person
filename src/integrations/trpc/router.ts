import { createTRPCRouter } from "./init";
import { organizationRouter } from "./routers/organization";

export const trpcRouter = createTRPCRouter({
  organization: organizationRouter,
});

export type TRPCRouter = typeof trpcRouter;
