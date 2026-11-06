import { Elysia, t } from 'elysia'

export const app = new Elysia()
	.post(
		'/',
		{
			body: t.Object({
				age: t.Number({
					error: 'Age must be a number'
				})
			})
		}, ({ body }) => body
	)

if (import.meta.main) app.listen(3000)
