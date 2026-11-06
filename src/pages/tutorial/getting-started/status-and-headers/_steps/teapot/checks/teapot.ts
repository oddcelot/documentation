import type { Elysia } from 'elysia'

export const title = 'Return a 418 status'
export const description = "Let's make the GET `/` endpoint return a 418 status"

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	expect((await app.handle(new Request('http://localhost/'))).status).toBe(418)
}
