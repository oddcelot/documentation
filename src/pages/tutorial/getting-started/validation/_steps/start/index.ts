import { Elysia, t } from 'elysia'

export const app = new Elysia()
	.post(
		'/user',
		({ body: { name } }) => `Hello ${name}!`
	)

if (import.meta.main) app.listen(3000)
