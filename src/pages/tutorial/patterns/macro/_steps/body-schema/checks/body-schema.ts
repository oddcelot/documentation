import type { Elysia } from 'elysia'

export const title = 'Enforce body schema'
export const description = "Let's enforce a schema as body for POST `/` endpoint that accept a number."

export default async (app: Pick<Elysia, 'handle'>, { expect }: typeof import('bun:test')) => {
	const post = (body: string) =>
		app.handle(new Request('http://localhost/', { method: 'POST', headers: { 'content-type': 'application/json' }, body }))
	expect((await post('"XD"')).status).toBe(422)
	expect((await post('5')).status).toBe(200)
}
