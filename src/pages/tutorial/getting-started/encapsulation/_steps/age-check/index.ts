import { Elysia, t } from 'elysia'

const nameCheck = new Elysia()
	.onBeforeHandle(
		'plugin',
		({ query: { name }, status }) => {
			if(!name) return status(401)
		}
	)

const ageCheck = new Elysia()
	.guard('global', {
		query: t.Object({
			age: t.Number(),
			name: t.Optional(t.String())
		}),
		beforeHandle({ query: { age }, status }) {
			if(age < 18) return status(403)
		}
	})

const name = new Elysia()
	.use(nameCheck)
	.patch('/rename', () => 'Ok! XD')

const profile = new Elysia()
	.use(ageCheck)
	.use(name)
	.get('/profile', () => 'Hi!')

export const app = new Elysia()
	.use(profile)
	.get('/', 'Home')

if (import.meta.main) app.listen(3000)
