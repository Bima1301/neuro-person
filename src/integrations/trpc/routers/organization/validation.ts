import { z } from "zod";

export const organizationCreateInput = z.object({
	organizationName: z.string().min(2),
	organizationSlug: z.string().min(2),
	address: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().optional(),
	website: z.string().optional(),
	geoPolygon: z.array(z.tuple([z.number(), z.number()])).optional(),
	geoCenter: z.object({ lat: z.number(), lng: z.number() }).optional(),
	geoRadius: z.number().optional(),
	userId: z.string(),
	userName: z.string(),
	userEmail: z.string(),
});

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
