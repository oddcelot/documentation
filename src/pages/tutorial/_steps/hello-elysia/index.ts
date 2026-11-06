import { Elysia } from 'elysia'

export const app = new Elysia()
	.get('/', 'Hello Elysia!')

if (import.meta.main) app.listen(3000)
