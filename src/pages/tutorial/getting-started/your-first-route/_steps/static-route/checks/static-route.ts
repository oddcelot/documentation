import type { Elysia } from 'elysia'

export const title = 'Static route'
export const description = 'Create a static route "/elysia" with response "Hello Elysia!"'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	expect(await (await app.handle(new Request('http://localhost/elysia'))).text()).toBe('Hello Elysia!')
}
