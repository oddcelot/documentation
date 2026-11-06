import type { Elysia } from 'elysia'

export const title = 'Provide a custom validation message'
export const description = "Let's override a validation message to be more friendly with your own words"

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	const response = await app.handle(
		new Request('http://localhost/', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ age: 'not-a-number' })
		})
	)
	expect(response.status).toBe(422)
	expect(response.headers.get('content-type') ?? '').not.toContain('application/problem+json')
	expect((await response.text()).trim()).not.toBe('')
}
