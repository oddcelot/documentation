import { Elysia } from 'elysia'

export const app = new Elysia()
	.get('/', 'Hello Elysia!')
	.get('/elysia', 'Hello Elysia!')
	.get('/friends/:name', ({ params: { name } }) => `Hello ${name}!`)

if (import.meta.main) app.listen(3000)
