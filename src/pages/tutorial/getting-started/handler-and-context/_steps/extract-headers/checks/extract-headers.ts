import type { Elysia } from 'elysia'

export const title = 'Extract headers'
export const description = "Let's extract a header and return it as `return { body, query, headers }`"

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	const res = await app.handle(
		new Request('http://localhost/', { method: 'POST', headers: { authorization: 'Bearer 12345' } })
	)
	expect(res.status).toBe(200)
	expect(await res.json().catch(() => null)).toMatchObject({ headers: { authorization: 'Bearer 12345' } })
}
