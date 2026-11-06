import { Elysia } from 'elysia'

export const app = new Elysia()
	.get('/auth', ({ query: { name = 'anon' } }) => {
		return `Hello ${name}!`
	})

if (import.meta.main) app.listen(3000)
