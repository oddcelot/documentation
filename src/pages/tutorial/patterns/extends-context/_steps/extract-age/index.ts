import { Elysia, t } from 'elysia'

class Logger {
	log(info: string) {
		console.log(info)
	}
}

export const app = new Elysia()
	.decorate('logger', new Logger())
	.onRequest(({ request, logger }) => {
		logger.log(`Request to ${request.url}`)
	})
	.guard({
		query: t.Optional(
			t.Object({
				age: t.Number({ minimum: 15 })
			})
		)
	})
	.derive(({ query: { age }, status }) => {
		if(!age) return status(401)

		return { age }
	})
	.get('/profile', () => 'Hello Elysia!')

if (import.meta.main) app.listen(3000)
