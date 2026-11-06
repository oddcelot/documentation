import { Elysia, t } from 'elysia'

export const app = new Elysia()
	.get('/', 'Hello Elysia!')
	.post('/', {
		body: t.Object({
			name: t.String()
		})
	}, ({ body }) => body)

if (import.meta.main) app.listen(3000)
