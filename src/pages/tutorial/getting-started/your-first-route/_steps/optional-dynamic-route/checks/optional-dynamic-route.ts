import type { Elysia } from 'elysia'

export const title = 'Optional dynamic route'
export const description =
	'Modify "/friends/:name" to accept an optional parameter, and respond with "Hello stranger!" when there is no name'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	const res = await app.handle(new Request('http://localhost/friends'))
	expect(res.status).toBe(200)
	expect(await res.text()).toBe('Hello stranger!')
}
