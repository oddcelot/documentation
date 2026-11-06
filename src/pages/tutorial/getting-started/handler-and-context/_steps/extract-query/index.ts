import { Elysia } from 'elysia'

export const app = new Elysia()
	.get('/', 'Hello Elysia!')
	.post('/', ({ body, query }) => {
		return { body, query }
	})

if (import.meta.main) app.listen(3000)
