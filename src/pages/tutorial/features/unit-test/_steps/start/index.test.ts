import { describe, it, expect } from 'bun:test'

import { app } from './index'

describe('Elysia', () => {
	it('should return Hello World', async () => {
		const response = await app.handle(new Request('http://localhost/'))
		const text = await response.text()

		expect(text).toBe('Hello World')
	})
})
