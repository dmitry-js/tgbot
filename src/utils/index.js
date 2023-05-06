import { isObject } from './helpers.js'

export const logger = data => isObject(data) ? JSON.stringify(data, null, 2) : data
