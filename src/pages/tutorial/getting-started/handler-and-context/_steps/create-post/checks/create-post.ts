import type { Elysia } from 'elysia'

export const title = 'Create POST endpoint'
export const description = 'Let\'s create a POST endpoint "/", so we can send a body'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	expect((await app.handle(new Request('http://localhost/', { method: 'POST' }))).status).toBe(200)
}
