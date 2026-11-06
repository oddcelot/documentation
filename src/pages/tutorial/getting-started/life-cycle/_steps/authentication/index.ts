import { Elysia } from 'elysia'

export const app = new Elysia()
	.get('/auth', {
		beforeHandle({ query: { name }, status }) {
			if(!name) return status(401)
		}
	}, ({ query: { name = 'anon' } }) => {
		return `Hello ${name}!`
	})

if (import.meta.main) app.listen(3000)
