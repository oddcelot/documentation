import type { Elysia } from 'elysia'

export const title = 'Use "age"'
export const description = 'In a main handler of GET "/profile", return a value of "age" from the context'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	const response = await app.handle(new Request('http://localhost/profile?age=18'))
	expect(response.status).toBe(200)
	expect(await response.text()).toBe('18')
}
