import type { Elysia } from 'elysia'

export const title = 'Return "Hello Elysia!"'
export const description =
	'Modify the code to make the server respond with "Hello Elysia!" instead of "Hello World!".'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	expect(await (await app.handle(new Request('http://localhost/'))).text()).toBe('Hello Elysia!')
}
