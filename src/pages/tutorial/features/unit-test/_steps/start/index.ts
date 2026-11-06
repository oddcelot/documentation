import { Elysia } from 'elysia'

export const app = new Elysia()
	.get('/', 'Hello World')

if (import.meta.main) app.listen(3000)
