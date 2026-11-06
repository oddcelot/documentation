import { Elysia } from 'elysia'

export const app = new Elysia()
	.get('/', () => {
		return 'Hello Elysia!'
	})

if (import.meta.main) app.listen(3000)
