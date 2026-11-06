import type { Elysia } from 'elysia'

export const title = 'Apply plugin'
export const description = "Let's apply the user plugin to the main app."

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	const profile = await app.handle(new Request('http://localhost/profile'))
	expect(profile.status).toBe(200)
	expect(await profile.text()).toBe('User Profile')
	const settings = await app.handle(new Request('http://localhost/settings'))
	expect(settings.status).toBe(200)
	expect(await settings.text()).toBe('User Settings')
}
