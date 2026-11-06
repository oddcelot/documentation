import { Elysia } from 'elysia'

class YourError extends Error {
	constructor(message: string) {
		super(message)
	}
}

export const app = new Elysia()
	.get('/', () => {
		return 'Hello Elysia!'
	})

if (import.meta.main) app.listen(3000)
