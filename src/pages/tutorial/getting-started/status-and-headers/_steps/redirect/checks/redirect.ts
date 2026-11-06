import type { Elysia } from 'elysia'

export const title = 'Create a redirect'
export const description = 'Redirect a GET `/docs` endpoint to `https://next.elysiajs.com/`'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	const res = await app.handle(new Request('http://localhost/docs'))
	expect(res.status).toBe(302)
	expect(res.headers.get('location')).toBe('https://next.elysiajs.com/')
}
