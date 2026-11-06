import { Elysia } from 'elysia'

const user = new Elysia()
	.get('/profile', 'User Profile')
	.get('/settings', 'User Settings')

export const app = new Elysia()
	.use(user)
	.get('/', 'Home')

if (import.meta.main) app.listen(3000)
