import { Elysia } from 'elysia'

export const app = new Elysia()
	.get('/', 'Hello Elysia!')
	.guard({
		beforeHandle({ headers: { authorization }, status }) {
			if (!authorization) return status(401)
		}
	})
	.get('/auth', ({ query: { name = 'anon' } }) => `Hello ${name}!`)
	.get('/profile', ({ query: { name = 'anon' } }) => `Hello ${name}!`)

if (import.meta.main) app.listen(3000)
