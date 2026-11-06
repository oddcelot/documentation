import { Elysia } from 'elysia'
import { Hono } from 'hono'

const hono = new Hono()
	.get('/', (c) => c.text('Hello from Hono'))

export const app = new Elysia()
	.get('/', 'Hello from Elysia')
	.mount('/hono', hono.fetch)

if (import.meta.main) app.listen(3000)
