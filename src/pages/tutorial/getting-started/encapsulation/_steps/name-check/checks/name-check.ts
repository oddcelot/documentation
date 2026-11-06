import type { Elysia } from 'elysia'

export const title = 'Name check'
export const description =
	'Make sure that the check that the user provides a `name` query applies **only to the instance that uses the plugin** (and the plugin itself), so PATCH "/rename" needs `name` but GET "/profile" doesn\'t.'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	expect((await app.handle(new Request('http://localhost/rename?name=Elysia&age=18', { method: 'PATCH' }))).status).toBe(200)
	expect((await app.handle(new Request('http://localhost/rename?age=18', { method: 'PATCH' }))).status).toBe(401)
	expect((await app.handle(new Request('http://localhost/profile?age=18'))).status).toBe(200)
}
