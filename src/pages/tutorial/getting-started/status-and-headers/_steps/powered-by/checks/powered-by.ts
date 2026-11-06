import type { Elysia } from 'elysia'

export const title = 'Add a powered-by header'
export const description = 'In GET `/` endpoint, return a custom header `x-powered-by` set to `Elysia`'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	expect((await app.handle(new Request('http://localhost/'))).headers.get('x-powered-by')).toBe('Elysia')
}
