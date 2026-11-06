import { Elysia, t } from 'elysia'

export const app = new Elysia()
	.get('/', {
		cookie: t.Object({
			visit: t.Optional(t.Number())
		})
	}, ({ cookie: { visit } }) => {
		visit.value ??= 0
		visit.value++

		return `You have visited ${visit.value} times`
	})

if (import.meta.main) app.listen(3000)
