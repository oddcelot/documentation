import type { Elysia } from 'elysia'

export const title = 'Age check'
export const description =
	'Make sure that the check that the user is at least 18 years old applies to **all** endpoints, including GET "/" on the main app.'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	for (const [method, path] of [
		['GET', '/profile'],
		['PATCH', '/rename'],
		['GET', '/']
	]) {
		expect((await app.handle(new Request(`http://localhost${path}?name=Elysia&age=17`, { method }))).status).toBe(403)
		expect((await app.handle(new Request(`http://localhost${path}?name=Elysia&age=18`, { method }))).status).toBe(200)
	}
}
