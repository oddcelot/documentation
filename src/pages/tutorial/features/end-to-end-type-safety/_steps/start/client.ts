import { treaty } from '@elysia/eden'

import { app } from './index'

const api = treaty(app)

// Try hover over "data"
const { data, error } = await api.get()

console.log(data)
