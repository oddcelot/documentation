import { Elysia, t } from 'elysia'

export const app = new Elysia()
	.post(
		'/',
		{
			body: t.Object({
				age: t.Number()
			})
		}, ({ body }) => body
	)

if (import.meta.main) app.listen(3000)
