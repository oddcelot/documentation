import type { Elysia } from 'elysia'

export const title = 'Your custom error'
export const description =
	'Let\'s define your own custom error, throw it in GET "/" endpoint, and return a status 418'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	expect((await app.handle(new Request('http://localhost/'))).status).toBe(418)
}
