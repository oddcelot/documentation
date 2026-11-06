import type { Elysia } from 'elysia'

export const title = 'Extract body'
export const description = "Let's extract a body and return it as `return { body }`"

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	const res = await app.handle(
		new Request('http://localhost/', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ hello: 'elysia' })
		})
	)
	expect(res.status).toBe(200)
	expect(await res.json().catch(() => null)).toMatchObject({ body: { hello: 'elysia' } })
}
