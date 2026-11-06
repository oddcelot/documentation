import { Elysia, t } from 'elysia'

function isPerfectSquare(x: number) {
	const s = Math.floor(Math.sqrt(x))
	return s * s === x
}

function isFibonacci(n: number) {
	if (n < 0) return false

	return isPerfectSquare(5 * n * n + 4) || isPerfectSquare(5 * n * n - 4)
}

export const app = new Elysia()
	.macro({ isFibonacci: {
		body: t.Number(),
		beforeHandle({ body, status }) {
			if(!isFibonacci(body)) return status(418)
		}
	} })
	.post('/', {
		isFibonacci: true
	}, ({ body }) => body)

if (import.meta.main) app.listen(3000)
