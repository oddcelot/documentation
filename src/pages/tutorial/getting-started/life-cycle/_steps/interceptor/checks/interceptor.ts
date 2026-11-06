import type { Elysia } from 'elysia'

export const title = 'Interceptor hook'
export const description =
	'Now, let\'s create another endpoint GET "/profile" that has the same logic with authentication. We can refactor our code by using interceptor hook to avoid duplication.'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	expect((await app.handle(new Request('http://localhost/profile'))).status).toBe(401)
	expect((await app.handle(new Request('http://localhost/profile?name=saltyaom'))).status).toBe(200)
}
