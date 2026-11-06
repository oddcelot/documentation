import { Elysia } from 'elysia'

export const app = new Elysia()
	.get('/', 'Hello Elysia!')
	.post('/', ({ body, query, headers }) => {
		return { body, query, headers }
	})

if (import.meta.main) app.listen(3000)
