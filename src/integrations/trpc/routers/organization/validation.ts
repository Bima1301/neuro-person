import { z } from "zod";
import { requiredStringFor, requiredNumberFor } from '@/lib/utils'

export const organizationCreateInput = z.object({
  organizationName: requiredStringFor('Nama organisasi').min(2),
  organizationSlug: requiredStringFor('Slug organisasi').min(2),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  geoPolygon: z
    .array(z.tuple([requiredNumberFor('Latitude'), requiredNumberFor('Longitude')]))
    .optional(),
  geoCenter: z
    .object({
      lat: requiredNumberFor('Latitude'),
      lng: requiredNumberFor('Longitude'),
    })
    .optional(),
  geoRadius: z.number().optional(),
  userId: requiredStringFor('User ID'),
  userName: requiredStringFor('Nama user'),
  userEmail: requiredStringFor('Email user'),
})

export const organizationUpdateInput = z.object({
	name: z.string().min(2).optional(),
	address: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().optional(),
	website: z.string().optional(),
	logo: z.string().optional(),
	geoPolygon: z
		.array(z.tuple([z.number(), z.number()]))
		.optional()
		.nullable(),
	geoCenter: z
		.object({ lat: z.number(), lng: z.number() })
		.optional()
		.nullable(),
	geoRadius: z.number().optional().nullable(),
});

export type OrganizationCreateInput = z.infer<typeof organizationCreateInput>;
export type OrganizationUpdateInput = z.infer<typeof organizationUpdateInput>;
