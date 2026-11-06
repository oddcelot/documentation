import type { Elysia } from 'elysia'

export const title = 'Your own 404'
export const description = "Let's override a default 404 response your own"

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	const response = await app.handle(new Request('http://localhost/No/existenceN'))
	expect(response.headers.get('content-type') ?? '').not.toContain('application/problem+json')
	expect((await response.text()).trim()).not.toBe('')
}
