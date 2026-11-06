import { Elysia, NotFound } from 'elysia'

class YourError extends Error {
	constructor(message: string) {
		super(message)
	}
}

export const app = new Elysia()
	.onError(NotFound, () => 'Hi there')
	.get('/', () => {
		return 'Hello Elysia!'
	})

if (import.meta.main) app.listen(3000)
