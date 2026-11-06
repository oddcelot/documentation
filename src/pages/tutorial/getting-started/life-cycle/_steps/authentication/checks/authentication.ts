import type { Elysia } from 'elysia'

export const title = 'Authentication'
export const description =
	'Let\'s add a simple authentication middleware to GET "/auth" endpoint using beforeHandle hook. If query `name` is provided, we will let the request pass, otherwise we will return 401 status.'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	expect((await app.handle(new Request('http://localhost/auth'))).status).toBe(401)
	expect((await app.handle(new Request('http://localhost/auth?name=saltyaom'))).status).toBe(200)
}
