import type { Elysia } from 'elysia'

export const title = 'Dynamic route'
export const description = 'Create a dynamic route "/friends/:name" with response "Hello ${name}!"'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	expect(await (await app.handle(new Request('http://localhost/friends/Eden'))).text()).toBe('Hello Eden!')
}
