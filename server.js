// Import Fastify
import Fastify from 'fastify';
import { JSONFilePreset } from 'lowdb/node'
import fs from 'fs';
import path from 'path';

const DATABASE_FILE = 'file.json';
const fastifyServer = Fastify({ logger: true })
const database = await JSONFilePreset(DATABASE_FILE, {})

database.read()


if (!fs.existsSync(path.resolve(DATABASE_FILE)) || database.data === null) {
	database.data = { customers: [] };
	await database.write();
}

const customerSchema = {
	schema: {
		body: {
			type: 'object',
			required: ['firstName', 'lastName', 'address', 'employeeId'],
			properties: {
				firstName: { type: 'string' },
				lastName: { type: 'string' },
				address: { type: 'string' },
				employeeId: { type: 'number' }
			}
		}
	}
}

fastifyServer.get('/customers/:id', async (request, reply) => {
	const customer = await database.data
		.customers
		.find((entity) => entity.id == request.params.id)
	if (!customer) {
		throw new Error("No customer with that id")
	}
	return customer.content
})

fastifyServer.post('/customers', { customerSchema }, async (request, reply) => {

	const customerBody = request.body

	await database.data
		.customers
		.push({ id: customerBody.employeeId, content: customerBody })
	await database.write()

	return reply
		.status(201)
		.send({ message: 'Created successfully' })
})

fastifyServer.setErrorHandler((error, request, reply) => {

	fastifyServer.log.debug(`error: ${error}`)
	if (error.validation) {
		const response = {
			fault: {
				code: 'badRequest',
				httpStatus: 400,
				message: 'You have supplied invalid request details',
				serverDateTime: new Date().toISOString(),
				failures: error.validation.map(err => {
					return {
						field: err.instancePath.replace('/', ''),
						message: err.message
					}
				})
			}
		}
		return reply
			.status(400)
			.send(response)
	} else {
		// All other errors
		const response = {
			fault: {
				code: 'internalError',
				httpStatus: 500,
				message: 'An internal error was encountered processing the request',
				serverDateTime: new Date().toISOString(),
				failures: [
					error.message
				]
			}
		}
		fastifyServer.log.info(error.message);

		return reply
			.status(500)
			.send(response)
	}
})

const start = async () => {
	try {
		await fastifyServer.listen({ port: 3000 })
		fastifyServer.log.info(`Server is running at http://localhost:3000`)
	} catch (err) {
		fastifyServer.log.error(err)
		process.exit(1)
	}
}
start()
