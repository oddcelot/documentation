import type { Elysia } from 'elysia'

export const title = 'Check if body is in the Fibonacci sequence'
export const description =
	'We can use `isFibonacci` function to check if the number is in Fibonacci sequence. If it is not, return 418 status'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	const post = (body: string) =>
		app.handle(new Request('http://localhost/', { method: 'POST', headers: { 'content-type': 'application/json' }, body }))
	expect((await post('4')).status).toBe(418)
	expect((await post('5')).status).toBe(200)
}
