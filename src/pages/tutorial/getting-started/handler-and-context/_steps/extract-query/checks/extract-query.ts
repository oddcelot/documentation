import type { Elysia } from 'elysia'

export const title = 'Extract query'
export const description = "Let's extract a query and return it as `return { body, query }`"

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	const res = await app.handle(new Request('http://localhost/?friend=eden', { method: 'POST' }))
	expect(res.status).toBe(200)
	expect(await res.json().catch(() => null)).toMatchObject({ query: { friend: 'eden' } })
}
