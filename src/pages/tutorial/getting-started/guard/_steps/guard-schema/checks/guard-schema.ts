import type { Elysia } from 'elysia'

export const title = 'Guard schema'
export const description =
	'Both routes need a `name` query too. Add a `query` schema to the same `guard`, so that a request without `name` returns 422 status.'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	const headers = { authorization: 'Bearer token' }
	for (const path of ['/auth', '/profile']) {
		expect((await app.handle(new Request(`http://localhost${path}`, { headers }))).status).toBe(422)
		const response = await app.handle(new Request(`http://localhost${path}?name=Elysia`, { headers }))
		expect(response.status).toBe(200)
		expect(await response.text()).toBe('Hello Elysia!')
	}
}
