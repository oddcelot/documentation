import type { Elysia } from 'elysia'

export const title = 'Extract "query.age"'
export const description = 'Let\'s extract a "query.age" as "age". If it doesn\'t exist, return 401.'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	expect((await app.handle(new Request('http://localhost/profile'))).status).toBe(401)
	expect((await app.handle(new Request('http://localhost/profile?age=14'))).status).toBe(422)
}
