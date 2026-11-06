import { Elysia } from 'elysia'

export const app = new Elysia()
	.get('/', 'Hello Elysia!')
	.post('/', ({ body }) => {
		return { body }
	})

if (import.meta.main) app.listen(3000)
