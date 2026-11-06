import { Elysia, NotFound } from 'elysia'

class YourError extends Error {
	status = 418

	constructor(message: string) {
		super(message)
	}
}

export const app = new Elysia()
	.onError(NotFound, () => 'Hi there')
	.onError(YourError, ({ error, status }) => status(error.status, error.message))
	.get('/', () => {
		throw new YourError('A')
	})

if (import.meta.main) app.listen(3000)
