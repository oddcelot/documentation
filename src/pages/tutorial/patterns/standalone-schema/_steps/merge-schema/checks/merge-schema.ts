import type { Elysia } from 'elysia'

export const title = 'Merged guard schema'
export const description =
	"Let's make POST '/user' endpoint accept a body with `name` as string and `age` as number by modifying a guard schema to use `schema: 'merge'`"

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	const post = (body: unknown) =>
		app.handle(
			new Request('http://localhost/user', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(body)
			})
		)
	expect((await post({ name: 'Eden', age: 'not a number' })).status).toBe(422)
	expect((await post({ age: 20 })).status).toBe(422)
	expect((await post({ name: 'Eden', age: 20 })).status).toBe(200)
}
