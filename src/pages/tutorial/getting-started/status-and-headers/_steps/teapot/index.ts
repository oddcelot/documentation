import { Elysia } from 'elysia'

export const app = new Elysia()
	.get('/', ({ status }) => {
		return status(418, 'Hello Elysia!')
	})

if (import.meta.main) app.listen(3000)
