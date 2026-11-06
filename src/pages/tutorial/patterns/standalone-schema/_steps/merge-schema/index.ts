import { Elysia, t } from 'elysia'
import { z } from 'zod'

export const app = new Elysia()
	.guard({
		schema: 'merge',
		body: z.object({
			age: z.number()
		})
	})
	.post(
		'/user',
		{
			body: t.Object({
				name: t.String()
			})
		}, ({ body }) => body
	)

if (import.meta.main) app.listen(3000)
