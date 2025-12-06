import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from './init'

import type { TRPCRouterRecord } from '@trpc/server'
import { prisma } from '@/db'


const todosRouter = {
  list: publicProcedure.query(async () => await prisma.todo.findMany()),
  add: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      return await prisma.todo.create({
        data: {
          title: input.name,
        },
      })
    }),
} satisfies TRPCRouterRecord

export const trpcRouter = createTRPCRouter({
  todos: todosRouter,
})
export type TRPCRouter = typeof trpcRouter
