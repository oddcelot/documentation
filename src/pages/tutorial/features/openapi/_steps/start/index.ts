import { Elysia, t } from 'elysia'
import { openapi } from '@elysia/openapi'

export const app = new Elysia()
	.use(openapi())
	.model({
		age: t.Object({
			age: t.Number()
		})
	})
	.post(
		'/',
		{
			body: 'age',
			detail: {
				summary: 'Create a user',
				description: 'Create a user with age',
				tags: ['User']
			}
		}, ({ body }) => body
	)

if (import.meta.main) app.listen(3000)
