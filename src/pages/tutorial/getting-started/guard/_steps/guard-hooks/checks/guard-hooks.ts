import type { Elysia } from 'elysia'

export const title = 'Guard hooks'
export const description =
	'GET "/auth" and GET "/profile" should return 401 status when the request has no `authorization` header. Use `guard` to add one `beforeHandle` hook to both routes, and keep GET "/" public.'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	const headers = { authorization: 'Bearer token' }
	for (const path of ['/auth', '/profile']) {
		expect((await app.handle(new Request(`http://localhost${path}?name=Elysia`))).status).toBe(401)
		expect((await app.handle(new Request(`http://localhost${path}?name=Elysia`, { headers }))).status).toBe(200)
	}
	expect((await app.handle(new Request('http://localhost/'))).status).toBe(200)
}
