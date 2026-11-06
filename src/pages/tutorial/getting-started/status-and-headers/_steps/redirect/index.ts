import { Elysia } from 'elysia'

export const app = new Elysia()
	.get('/', ({ status }) => {
		return status(418, 'Hello Elysia!')
	})
	.get('/docs', ({ redirect }) => redirect('https://next.elysiajs.com/'))

if (import.meta.main) app.listen(3000)
