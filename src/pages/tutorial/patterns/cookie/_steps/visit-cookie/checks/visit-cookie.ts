import type { Elysia } from 'elysia'

export const title = 'Visit cookie'
export const description =
	'Create a route GET "/" that increase every visit by 1 using store in cookie name "visit"'

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	const response = await app.handle(new Request('http://localhost/', { headers: { cookie: 'visit=3' } }))
	expect(response.status).toBe(200)
	expect(await response.text()).toContain('4')
	expect(response.headers.getSetCookie()).toContainEqual(expect.stringMatching(/^visit=4;/))
}
