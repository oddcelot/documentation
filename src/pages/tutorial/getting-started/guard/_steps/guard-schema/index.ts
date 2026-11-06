import { Elysia, t } from 'elysia'

export const app = new Elysia()
	.get('/', 'Hello Elysia!')
	.guard({
		beforeHandle({ headers: { authorization }, status }) {
			if (!authorization) return status(401)
		},
		query: t.Object({
			name: t.String()
		})
	})
	.get('/auth', ({ query: { name } }) => `Hello ${name}!`)
	.get('/profile', ({ query: { name } }) => `Hello ${name}!`)

if (import.meta.main) app.listen(3000)
