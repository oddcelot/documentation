import type { Elysia } from 'elysia'

export const title = 'HTTP only'
export const description =
	'Make the "visit" cookie HTTP Only so it is inaccessible from client-side script'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	const response = await app.handle(new Request('http://localhost/', { headers: { cookie: 'visit=3' } }))
	expect(response.status).toBe(200)
	expect(response.headers.getSetCookie()).toContainEqual(expect.stringMatching(/^visit=.*; HttpOnly(;|$)/))
}
