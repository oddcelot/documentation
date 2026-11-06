import type { Elysia } from 'elysia'

export const title = 'Add a body schema'
export const description =
	'Define a body schema for POST `/user` endpoint that accepts an object with `name` property with type string, and return `Hello ${name}!`'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	const send = (body: unknown) =>
		app.handle(
			new Request('http://localhost/user', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(body)
			})
		)

	const valid = await send({ name: 'Elysia' })
	expect(valid.status).toBe(200)
	expect(await valid.text()).toBe('Hello Elysia!')
	expect((await send({ name: 1 })).status).toBe(422)
}
