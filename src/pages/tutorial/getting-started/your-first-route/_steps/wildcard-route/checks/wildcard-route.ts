import type { Elysia } from 'elysia'

export const title = 'Wildcard route'
export const description = 'Create a wildcard route "/flame-chasers/*" that responds with the rest of the path'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	expect(await (await app.handle(new Request('http://localhost/flame-chasers/kevin'))).text()).toBe('kevin')
	expect(await (await app.handle(new Request('http://localhost/flame-chasers/kevin/flame'))).text()).toBe('kevin/flame')
}
